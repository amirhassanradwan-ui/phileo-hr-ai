from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate, CandidateRead, CandidateStatusUpdate
from app.services.candidate_service import create_candidate, search_candidates, update_candidate_status

router = APIRouter()


@router.get("", response_model=list[CandidateRead])
def list_candidates(q: str | None = None, db: Session = Depends(get_db)):
    return search_candidates(db, q)


@router.post("", response_model=CandidateRead)
def add_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    return create_candidate(db, payload)


@router.patch("/{candidate_id}/status", response_model=CandidateRead)
def change_candidate_status(candidate_id: int, payload: CandidateStatusUpdate, db: Session = Depends(get_db)):
    candidate = db.get(Candidate, candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return update_candidate_status(db, candidate, payload.status)
