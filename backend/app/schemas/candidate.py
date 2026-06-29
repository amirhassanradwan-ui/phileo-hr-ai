from datetime import datetime

from pydantic import BaseModel, EmailStr


class CandidateBase(BaseModel):
    full_name: str
    phone: str | None = None
    email: EmailStr | None = None
    city: str | None = None
    address: str | None = None
    degree: str | None = None
    university: str | None = None
    graduation_year: int | None = None
    experience_years: int | None = None
    current_company: str | None = None
    current_position: str | None = None
    industry: str | None = None
    english_level: str | None = None
    status: str = "new"


class CandidateCreate(CandidateBase):
    cv_file_path: str | None = None
    extracted_text: str | None = None


class CandidateRead(CandidateBase):
    id: int
    cv_file_path: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
