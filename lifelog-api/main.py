from fastapi import FastAPI

app = FastAPI(title="Life-Log API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Life-Log API is running"}
