from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.config import settings
from app.parsers.cv_parser import extract_candidate_fields, extract_text
from app.schemas.candidate import CandidateCreate
from app.schemas.upload import UploadResult
from app.services.candidate_service import create_candidate
from app.services.duplicate_service import find_duplicates

SUPPORTED_CV_EXTENSIONS = {".pdf", ".doc", ".docx", ".zip"}


def store_cv_file(filename: str, content: bytes) -> Path:
    suffix = Path(filename).suffix.lower()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored_path = upload_dir / f"{uuid4().hex}{suffix}"
    stored_path.write_bytes(content)
    return stored_path


def import_cv_file(db: Session, filename: str, content: bytes) -> UploadResult:
    suffix = Path(filename).suffix.lower()
    stored_path = store_cv_file(filename, content)

    text = extract_text(stored_path) if suffix != ".zip" else ""
    candidate_data = extract_candidate_fields(text)
    candidate_data["cv_file_path"] = str(stored_path)
    duplicates = find_duplicates(db, candidate_data)

    if duplicates:
        return UploadResult(status="duplicate_found", duplicates=duplicates, stored_file=str(stored_path))

    candidate = create_candidate(db, CandidateCreate(**candidate_data))
    return UploadResult(status="done", candidate=candidate, stored_file=str(stored_path))
