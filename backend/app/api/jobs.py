from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobRead

router = APIRouter()


@router.get("", response_model=list[JobRead])
def list_jobs(db: Session = Depends(get_db)):
    return list(db.scalars(select(Job).order_by(Job.job_name)).all())


@router.post("", response_model=JobRead)
def add_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
