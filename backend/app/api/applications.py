from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.application import ApplicationCreate, ApplicationRead

router = APIRouter()


@router.get("", response_model=list[ApplicationRead])
def list_applications(db: Session = Depends(get_db)):
    statement = (
        select(Application, Candidate.full_name, Job.job_name)
        .join(Candidate, Candidate.id == Application.candidate_id)
        .join(Job, Job.id == Application.job_id)
        .order_by(Application.application_date.desc())
    )
    applications = []
    for application, candidate_name, job_name in db.execute(statement).all():
        applications.append(
            ApplicationRead(
                id=application.id,
                candidate_id=application.candidate_id,
                job_id=application.job_id,
                application_date=application.application_date,
                status=application.status,
                score=application.score,
                candidate_name=candidate_name,
                job_name=job_name,
            )
        )
    return applications


@router.post("", response_model=ApplicationRead)
def add_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    candidate = db.get(Candidate, payload.candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = db.get(Job, payload.job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    application = Application(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)

    return ApplicationRead(
        id=application.id,
        candidate_id=application.candidate_id,
        job_id=application.job_id,
        application_date=application.application_date,
        status=application.status,
        score=application.score,
        candidate_name=candidate.full_name,
        job_name=job.job_name,
    )
