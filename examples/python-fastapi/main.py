import os
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Hello from FastAPI on SKYHOST", "service": os.environ.get("SKYHOST_SERVICE")}


@app.get("/health")
def health():
    return {"ok": True}
