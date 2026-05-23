from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil

from app.ocr.ocr_service import extract_text_from_image, extract_text_from_pdf
from app.services.parser_service import parse_extracted_text
from app.risk_engine.risk_analyzer import analyze_parsed_results

router = APIRouter()

# Request schemas for validation
class TextRequest(BaseModel):
    text: str

class BiomarkerModel(BaseModel):
    name: str
    value: float
    unit: str
    normal_range: str
    affected_organ: str

class AnalyzeRequest(BaseModel):
    patient_info: dict
    report_date: str
    report_type: str
    tests: dict

# Endpoint 1: POST /upload
@router.post("/upload")
async def upload_medical_file(file: UploadFile = File(...)):
    """
    Accepts PDF/Image diagnostic report, executes OpenCV image preprocessing,
    runs OCR text extraction, fuzzily parses keywords, and checks clinical risk boundaries.
    """
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".png", ".jpg", ".jpeg", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Upload PDF, PNG, or JPG.")
        
    # Save file in local workspace temp location
    temp_dir = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. OCR Stage
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            # PNG / JPG
            extracted_text = extract_text_from_image(temp_path)
            
        # 2. Parsing Stage
        parsed_data = parse_extracted_text(extracted_text)
        
        # 3. Clinical Safety Assessment & Organ Mapping
        assessment_response = analyze_parsed_results(parsed_data)
        
        # Inject raw OCR text for frontend transparency
        assessment_response["extracted_text"] = extracted_text
        
        return assessment_response
        
    except Exception as e:
        print(f"Pipeline processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostic pipeline error: {str(e)}")
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass

# Endpoint 2: POST /extract
@router.post("/extract")
async def extract_report_text(payload: TextRequest):
    """
    Accepts raw unstructured diagnostic report text, runs fuzzy aliases keyword parser,
    and analyzes systemic organ deviations.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text segment cannot be empty.")
        
    try:
        # 1. Parsing Stage
        parsed_data = parse_extracted_text(payload.text)
        
        # 2. Clinical Safety Assessment & Organ Mapping
        assessment_response = analyze_parsed_results(parsed_data)
        assessment_response["extracted_text"] = payload.text
        
        return assessment_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text processing error: {str(e)}")

# Endpoint 3: GET /history
@router.get("/history")
async def get_history_timeline():
    """
    Returns standard diagnostic progressions log.
    """
    return [
        {"date": "2025-11-20", "biomarkers": {"glucose": 98, "hemoglobin": 14.2, "creatinine": 0.9, "sodium": 139}},
        {"date": "2026-02-15", "biomarkers": {"glucose": 94, "hemoglobin": 14.4, "creatinine": 0.9, "sodium": 138}},
        {"date": "2026-05-18", "biomarkers": {"glucose": 92, "hemoglobin": 14.5, "creatinine": 0.9, "sodium": 140}}
    ]
