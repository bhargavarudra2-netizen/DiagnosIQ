import os
import json
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize FastAPI app
app = FastAPI(title="Life-Log AI Service", version="0.3.0")

# Verify configurations
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Warning: Supabase credentials not found in env variables.")
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in env variables.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Request / Response Schemas
class ProcessEntryRequest(BaseModel):
    entry_id: str

class DailySummaryRequest(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD

class DailyPlanRequest(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD

class AskAIRequest(BaseModel):
    user_id: str
    query: str

def clean_json_response(raw_text: str) -> str:
    """Cleans markdown code fences from JSON output if present."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```json") or lines[0].startswith("```"):
            lines = lines[1:-1]
        text = "\n".join(lines).strip()
    return text

def process_and_update_entry(entry_id: str):
    try:
        response = supabase.table("entries").select("raw_text").eq("id", entry_id).execute()
        if not response.data:
            print(f"Error: Entry {entry_id} not found in database.")
            return
        
        raw_text = response.data[0]["raw_text"]

        prompt = f"""
        Analyze the following personal daily log entry:
        "{raw_text}"

        Extract metadata from this log according to the following strict JSON schema:
        {{
            "activity": "The core action or activity being done/finished, e.g., 'React Hooks study', 'Cardio Workout' (null if not clear)",
            "category": "Categorize it strictly into one of: Study, Coding, Reading, Break, Exercise, Idea, Other",
            "confidence": 0-100 (how confident are you in this categorization),
            "tags": ["short", "lowercase", "keywords", "related", "to", "the", "activity"]
        }}

        Respond ONLY with a valid, raw JSON object conforming to this schema. No markdown wrapping, no trailing commas, no extra text.
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        ai_response = model.generate_content(prompt)
        clean_text = clean_json_response(ai_response.text)
        structured_data = json.loads(clean_text)

        supabase.table("entries").update({
            "activity": structured_data.get("activity"),
            "tags": structured_data.get("tags", []),
            "ai_summary": structured_data,
            "metadata": {
                "ai_processed": True,
                "model": "gemini-1.5-flash",
                "category": structured_data.get("category"),
                "confidence": structured_data.get("confidence")
            }
        }).eq("id", entry_id).execute()

        print(f"Success: Processed entry {entry_id} successfully.")

    except Exception as e:
        print(f"Failed to process entry {entry_id}: {str(e)}")


@app.post("/process-entry")
def process_entry(request: ProcessEntryRequest, background_tasks: BackgroundTasks):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="API configuration is incomplete. Missing database or Gemini credentials."
        )
    background_tasks.add_task(process_and_update_entry, request.entry_id)
    return {"status": "processing", "entry_id": request.entry_id}


@app.post("/daily-summary")
def generate_daily_summary(request: DailySummaryRequest):
    if not GEMINI_API_KEY or not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="API keys are missing.")

    try:
        # Fetch all entries for that user on that specific date
        start_time = f"{request.date}T00:00:00+00:00"
        end_time = f"{request.date}T23:59:59+00:00"

        response = supabase.table("entries").select("raw_text, timestamp, activity, tags").eq("user_id", request.user_id).gte("timestamp", start_time).lte("timestamp", end_time).execute()
        entries = response.data or []

        if not entries:
            return {"status": "no_entries", "message": "No entries logged on this date."}

        logs_context = "\n".join([
            f"- [{entry['timestamp']}] {entry['raw_text']} (Activity: {entry.get('activity')}, Tags: {entry.get('tags')})"
            for entry in entries
        ])

        prompt = f"""
        You are a helpful productivity summarizer. Synthesize the user's logs for {request.date}:
        
        {logs_context}

        Produce a structured JSON summary conforming to this schema:
        {{
            "completed": ["Accomplishments and completed tasks"],
            "pending": ["Unfinished activities or items that need attention"],
            "ideas": ["Thoughts, ideas, or insights recorded during the day"],
            "time_spent": {{
                "Coding": "estimated time or description of what was done",
                "Study": "estimated time or description of what was done",
                "Other": "description of other events"
            }},
            "summary_sentence": "A single premium sentence summarizing their overall day."
        }}

        Respond ONLY with valid, raw JSON conforming to this schema. No markdown wrapping.
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        ai_response = model.generate_content(prompt)
        clean_text = clean_json_response(ai_response.text)
        summary_content = json.loads(clean_text)

        # Write to database (upsert based on unique constraint user_id + date)
        supabase.table("summaries").upsert({
            "user_id": request.user_id,
            "date": request.date,
            "content": summary_content
        }, on_conflict="user_id,date").execute()

        return {"status": "success", "summary": summary_content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@app.post("/daily-plan")
def generate_daily_plan(request: DailyPlanRequest):
    if not GEMINI_API_KEY or not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="API keys are missing.")

    try:
        # 1. Fetch yesterday's summary
        target_date = datetime.strptime(request.date, "%Y-%m-%d")
        yesterday_date_str = (target_date - timedelta(days=1)).strftime("%Y-%m-%d")

        yesterday_summary_response = supabase.table("summaries").select("content").eq("user_id", request.user_id).eq("date", yesterday_date_str).execute()
        
        yesterday_summary_text = ""
        if yesterday_summary_response.data:
            yesterday_summary_text = json.dumps(yesterday_summary_response.data[0]["content"])
        else:
            # If no summary, fetch raw entries for yesterday
            start_time = f"{yesterday_date_str}T00:00:00+00:00"
            end_time = f"{yesterday_date_str}T23:59:59+00:00"
            yesterday_entries = supabase.table("entries").select("raw_text").eq("user_id", request.user_id).gte("timestamp", start_time).lte("timestamp", end_time).execute()
            if yesterday_entries.data:
                yesterday_summary_text = "Yesterday's logs: " + "; ".join([e["raw_text"] for e in yesterday_entries.data])

        prompt = f"""
        You are a proactive planner assistant. Suggest a realistic productivity plan for tomorrow, {request.date}, based on what they did yesterday.
        
        Yesterday's Summary/Logs:
        {yesterday_summary_text}

        Produce a structured JSON plan conforming to this schema:
        {{
            "target_plan": ["Action item 1", "Action item 2", "Action item 3"],
            "suggested_focus": "One brief sentence summarizing the main objective for tomorrow."
        }}

        Respond ONLY with valid, raw JSON conforming to this schema. No markdown wrapping.
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        ai_response = model.generate_content(prompt)
        clean_text = clean_json_response(ai_response.text)
        plan_content = json.loads(clean_text)

        # Write to database (upsert based on unique constraint user_id + date)
        supabase.table("plans").upsert({
            "user_id": request.user_id,
            "date": request.date,
            "content": plan_content
        }, on_conflict="user_id,date").execute()

        return {"status": "success", "plan": plan_content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")


@app.post("/ask-ai")
def ask_ai(request: AskAIRequest):
    if not GEMINI_API_KEY or not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="API keys are missing.")

    try:
        # Search the user's entries using Full-Text Search.
        # We search raw_text using textSearch or, if query has special chars, we can fetch recent 50 entries.
        # For robustness, we will fetch the 50 most recent entries to provide a general chronological context.
        # Plus, we try FTS to grab matching entries.
        
        # 1. Fetch matching entries via Full Text Search
        search_results = []
        try:
            fts_response = supabase.table("entries").select("raw_text, timestamp").eq("user_id", request.user_id).text_search("search_vector", request.query).limit(10).execute()
            search_results = fts_response.data or []
        except Exception:
            pass  # Fallback silently if text search fails (e.g. empty vector or query syntax)

        # 2. Fetch last 30 general logs for general context
        recent_response = supabase.table("entries").select("raw_text, timestamp, activity, tags").eq("user_id", request.user_id).order("timestamp", { "ascending": False }).limit(30).execute()
        recent_logs = recent_response.data or []

        # Combine contexts
        context_lines = []
        context_lines.append("=== MATCHING SEARCH LOGS ===")
        for log in search_results:
            context_lines.append(f"- [{log['timestamp']}] {log['raw_text']}")
        
        context_lines.append("\n=== RECENT ACTIVITY LOGS ===")
        for log in recent_logs:
            context_lines.append(f"- [{log['timestamp']}] {log['raw_text']} (Activity: {log.get('activity')}, Tags: {log.get('tags')})")

        full_context = "\n".join(context_lines)

        prompt = f"""
        You are the AI assistant for Life-Log, an app that is "GitHub for your life."
        The user is asking a question about their life log: "{request.query}"

        Use the following log history context to formulate your response:
        
        {full_context}

        Formulate a clear, direct, and conversational answer. Reference dates and times if useful. If the logs do not contain the answer, politely say that you couldn't find details in their log history. Do not make up facts.
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        ai_response = model.generate_content(prompt)
        
        return {"answer": ai_response.text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query AI: {str(e)}")


@app.get("/")
def read_root():
    return {"status": "active", "service": "Life-Log AI Service"}
