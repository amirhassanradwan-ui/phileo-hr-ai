from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.candidate import CandidateCreate, CandidateRead
from app.services.candidate_service import create_candidate, search_candidates

router = APIRouter()


@router.get("", response_model=list[CandidateRead])
def list_candidates(q: str | None = None, db: Session = Depends(get_db)):
    return search_candidates(db, q)


@router.post("", response_model=CandidateRead)
def add_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    return create_candidate(db, payload)
