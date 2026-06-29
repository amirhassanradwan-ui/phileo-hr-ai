from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.parsers.cv_parser import extract_candidate_fields, extract_text
from app.schemas.candidate import CandidateCreate
from app.schemas.upload import UploadResult
from app.services.candidate_service import create_candidate
from app.services.duplicate_service import find_duplicates

router = APIRouter()
SUPPORTED_EXTENSIONS = {".pdf", ".doc", ".docx", ".zip"}


@router.post("/cv", response_model=UploadResult)
async def upload_cv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{suffix}"
    stored_path = upload_dir / stored_name
    stored_path.write_bytes(await file.read())

    text = extract_text(stored_path) if suffix != ".zip" else ""
    candidate_data = extract_candidate_fields(text)
    candidate_data["cv_file_path"] = str(stored_path)
    duplicates = find_duplicates(db, candidate_data)

    if duplicates:
        return UploadResult(status="duplicate_found", duplicates=duplicates, stored_file=str(stored_path))

    candidate = create_candidate(db, CandidateCreate(**candidate_data))
    return UploadResult(status="done", candidate=candidate, stored_file=str(stored_path))
