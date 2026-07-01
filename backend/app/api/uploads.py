from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.upload import UploadResult
from app.services.cv_import_service import SUPPORTED_CV_EXTENSIONS, import_cv_file

router = APIRouter()


@router.post("/cv", response_model=UploadResult)
async def upload_cv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_CV_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    return import_cv_file(db, file.filename or "cv", await file.read())
