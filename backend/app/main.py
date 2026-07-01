from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import applications, auth, candidates, jobs, uploads
from app.core.config import settings
from app.database.session import Base, engine
from app import models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
