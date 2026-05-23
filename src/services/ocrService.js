/**
 * ocrService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DiagnosIQ OCR Extraction Engine
 *
 * Strategy (in order of preference):
 *  1. Gemini Vision API — if API key present, sends image/pdf bytes for
 *     high-accuracy clinical text extraction via multimodal model.
 *  2. Tesseract.js   — local browser-side OCR fallback for image files.
 *  3. FileReader (text) — for plain .txt files, just reads the file content.
 *
 * Returns: { text: string, source: 'gemini' | 'tesseract' | 'text' | 'error', confidence: number }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ── OCR System Prompt ────────────────────────────────────────────────────────
const OCR_SYSTEM_PROMPT = `You are a medical document OCR specialist. Your only job is to extract ALL visible text from this medical laboratory report image or document EXACTLY as it appears. 

Rules:
1. Extract every single character, number, and symbol visible in the document.
2. Preserve the original formatting: keep numbers next to their test names.
3. Do NOT interpret or summarize — just transcribe the raw text faithfully.
4. Pay special attention to: patient name, date, biomarker test names, numerical values, measurement units, and reference ranges.
5. Output ONLY the extracted raw text, nothing else. No commentary, no JSON, just the verbatim extracted text.`;

// ── Helper: Convert File to Base64 ───────────────────────────────────────────
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Helper: Read Text File ───────────────────────────────────────────────────
async function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ── Strategy 1: Gemini Vision OCR ───────────────────────────────────────────
async function extractWithGemini(file) {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-1.5-flash for vision (multimodal)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const base64Data = await fileToBase64(file);
    
    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = file.name.toLowerCase().split('.').pop();
      const mimeMap = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
      };
      mimeType = mimeMap[ext] || 'image/png';
    }

    const result = await model.generateContent([
      OCR_SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text().trim();
    if (text && text.length > 20) {
      return { text, source: 'gemini', confidence: 0.97 };
    }
    return null;
  } catch (err) {
    console.warn('[DiagnosIQ OCR] Gemini Vision failed:', err.message);
    return null;
  }
}

// ── Strategy 2: Tesseract.js Local OCR ──────────────────────────────────────
async function extractWithTesseract(file) {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', 1, {
      logger: () => {}, // Suppress verbose Tesseract logging
    });

    const { data } = await worker.recognize(file);
    await worker.terminate();

    const text = data.text?.trim();
    const confidence = (data.confidence || 70) / 100;

    if (text && text.length > 20) {
      return { text, source: 'tesseract', confidence };
    }
    return null;
  } catch (err) {
    console.warn('[DiagnosIQ OCR] Tesseract.js failed:', err.message);
    return null;
  }
}

// ── Main OCR Dispatcher ──────────────────────────────────────────────────────
/**
 * extractTextFromFile()
 * Intelligently picks the best available OCR strategy for the uploaded file.
 *
 * @param {File} file - The uploaded file (PDF, PNG, JPG, TXT)
 * @returns {Promise<{ text: string, source: string, confidence: number }>}
 */
export async function extractTextFromFile(file) {
  if (!file) {
    return { text: '', source: 'error', confidence: 0 };
  }

  const ext = file.name.toLowerCase().split('.').pop();
  const isTextFile = ext === 'txt' || file.type === 'text/plain';
  const isImageOrPdf = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'heic', 'heif'].includes(ext) ||
    file.type.startsWith('image/') ||
    file.type === 'application/pdf';

  // Strategy A: Plain text — direct read
  if (isTextFile) {
    try {
      const text = await readTextFile(file);
      if (text && text.trim().length > 0) {
        return { text: text.trim(), source: 'text', confidence: 0.99 };
      }
    } catch (err) {
      console.warn('[DiagnosIQ OCR] Text file read failed:', err.message);
    }
  }

  // Strategy B: Image/PDF — try Gemini Vision first
  if (isImageOrPdf) {
    const geminiResult = await extractWithGemini(file);
    if (geminiResult) {
      return geminiResult;
    }

    // Strategy C: Fallback to Tesseract for image files (not PDF)
    if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      const tesseractResult = await extractWithTesseract(file);
      if (tesseractResult) {
        return tesseractResult;
      }
    }
  }

  // Final fallback: try text read
  try {
    const text = await readTextFile(file);
    if (text && text.trim().length > 5) {
      return { text: text.trim(), source: 'text', confidence: 0.75 };
    }
  } catch {
    // Ignore
  }

  return { text: '', source: 'error', confidence: 0 };
}

/**
 * getOCRSourceLabel()
 * Returns a human-readable label for the OCR source.
 */
export function getOCRSourceLabel(source) {
  switch (source) {
    case 'gemini':    return 'Gemini Vision AI';
    case 'tesseract': return 'Tesseract OCR Engine';
    case 'text':      return 'Direct Text Input';
    default:          return 'Manual Input';
  }
}
