from rapidfuzz import fuzz
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.schemas.upload import DuplicateMatch


def find_duplicates(db: Session, candidate: dict) -> list[DuplicateMatch]:
    matches: list[DuplicateMatch] = []
    existing = list(db.scalars(select(Candidate)).all())

    for item in existing:
        if candidate.get("phone") and item.phone == candidate["phone"]:
            matches.append(DuplicateMatch(candidate_id=item.id, reason="phone", confidence=1.0))
            continue

        if candidate.get("email") and item.email == candidate["email"]:
            matches.append(DuplicateMatch(candidate_id=item.id, reason="email", confidence=0.95))
            continue

        name_score = fuzz.token_sort_ratio(candidate.get("full_name") or "", item.full_name)
        company_score = fuzz.token_sort_ratio(candidate.get("current_company") or "", item.current_company or "")

        if name_score >= 90:
            confidence = 0.75
            reason = "name_similarity"
            if company_score >= 85:
                confidence = 0.85
                reason = "name_similarity_and_company_history"
            matches.append(DuplicateMatch(candidate_id=item.id, reason=reason, confidence=confidence))

    return matches
