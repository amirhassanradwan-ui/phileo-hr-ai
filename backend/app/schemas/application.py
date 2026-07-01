from datetime import datetime

from pydantic import BaseModel


class ApplicationBase(BaseModel):
    candidate_id: int
    job_id: int
    status: str = "new"
    score: float | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: int
    application_date: datetime
    candidate_name: str
    job_name: str

    model_config = {"from_attributes": True}
