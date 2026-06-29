from pydantic import BaseModel


class JobBase(BaseModel):
    job_name: str
    department: str | None = None
    description: str | None = None
    is_active: bool = True


class JobCreate(JobBase):
    pass


class JobRead(JobBase):
    id: int

    model_config = {"from_attributes": True}
