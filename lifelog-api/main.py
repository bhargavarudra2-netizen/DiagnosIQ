import os
import json
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
app = FastAPI(title="Life-Log AI Service", version="0.2.0")

# Verify configurations
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Warning: Supabase credentials not found in env variables.")
else:
    # Initialize Supabase client with Service Role key (bypasses RLS to write updates)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in env variables.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Define request schemas
class ProcessEntryRequest(BaseModel):
    entry_id: str

class StructuredLogOutput(BaseModel):
    activity: str | None
    category: str  # Study/Coding/Reading/Break/Exercise/Idea/Other
    confidence: int  # 0 to 100
    tags: list[str]

def process_and_update_entry(entry_id: str):
    try:
        # 1. Fetch raw entry from database
        response = supabase.table("entries").select("raw_text").eq("id", entry_id).execute()
        if not response.data:
            print(f"Error: Entry {entry_id} not found in database.")
            return
        
        raw_text = response.data[0]["raw_text"]

        # 2. Setup Gemini structured model call
        # We ask for a strict JSON format matching the schema
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
        
        # Clean response string in case it wrapped it in markdown code blocks
        clean_text = ai_response.text.strip()
        if clean_text.startswith("```"):
            # Strip markdown blocks
            lines = clean_text.splitlines()
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                lines = lines[1:-1]
            clean_text = "\n".join(lines).strip()

        # Parse LLM output
        structured_data = json.loads(clean_text)

        # 3. Update Supabase Database row
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
    
    # Process asynchronously in the background so the HTTP request returns instantly
    background_tasks.add_task(process_and_update_entry, request.entry_id)
    
    return {"status": "processing", "entry_id": request.entry_id}

@app.get("/")
def read_root():
    return {"status": "active", "service": "Life-Log AI Service"}
