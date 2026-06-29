from pydantic import BaseModel

from app.schemas.candidate import CandidateRead


class DuplicateMatch(BaseModel):
    candidate_id: int
    reason: str
    confidence: float


class UploadResult(BaseModel):
    status: str
    candidate: CandidateRead | None = None
    duplicates: list[DuplicateMatch] = []
    stored_file: str | None = None
