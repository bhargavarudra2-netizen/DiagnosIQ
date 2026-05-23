from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Initialize app
app = FastAPI(
    title="Vitalis AI Backend API",
    description="Deterministic rules validating health risks and report parsing.",
    version="1.0.0"
)

# Enable CORS for Next.js app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production (e.g. localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def get_health():
    return {
        "status": "healthy",
        "service": "Vitalis AI clinical engine",
        "version": "1.0.0"
    }

# Import and register routers
from app.routes.analysis import router as analysis_router
app.include_router(analysis_router, prefix="/api", tags=["clinical"])

# AI Intelligence Layer
try:
    from app.routes.ai_insights import router as ai_router
    app.include_router(ai_router, prefix="/api/ai", tags=["intelligence"])
except Exception as e:
    import logging
    logging.getLogger("vitalis").warning(f"AI router not loaded: {e}")

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
