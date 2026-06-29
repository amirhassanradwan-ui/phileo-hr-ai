from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate


def create_candidate(db: Session, data: CandidateCreate) -> Candidate:
    candidate = Candidate(**data.model_dump())
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


def search_candidates(db: Session, query: str | None = None) -> list[Candidate]:
    statement = select(Candidate).order_by(Candidate.created_at.desc())
    if query:
        like_query = f"%{query}%"
        statement = statement.where(
            or_(
                Candidate.full_name.ilike(like_query),
                Candidate.phone.ilike(like_query),
                Candidate.email.ilike(like_query),
                Candidate.current_company.ilike(like_query),
                Candidate.current_position.ilike(like_query),
            )
        )
    return list(db.scalars(statement).all())
