import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.routes import analytics, auth, claims, reports

app = FastAPI(
    title="ClaimWise AI API",
    version="1.0.0",
    description="Insurance claim processing copilot backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
        "https://insurance-claim-co-pilot.vercel.app",
        "https://frontend-dun-delta-72.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# Serve generated Grad-CAM heatmap images
_STATIC_DIR = os.path.join(os.path.dirname(__file__), "static", "heatmaps")
os.makedirs(_STATIC_DIR, exist_ok=True)
app.mount("/static/heatmaps", StaticFiles(directory=_STATIC_DIR), name="heatmaps")


@app.get("/")
def root_status():
    return {
        "message": "ClaimWise AI API is running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "claimwise-ai-api",
        "version": "1.0.0",
    }
