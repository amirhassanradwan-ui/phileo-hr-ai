from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), primary_key=True)
    level: Mapped[str | None] = mapped_column(String(50))
