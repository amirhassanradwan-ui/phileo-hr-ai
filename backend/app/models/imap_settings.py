from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class ImapSettings(Base):
    __tablename__ = "imap_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    host: Mapped[str] = mapped_column(String(160))
    port: Mapped[int] = mapped_column(Integer, default=993)
    username: Mapped[str] = mapped_column(String(160))
    password: Mapped[str] = mapped_column(String(255))
    mailbox: Mapped[str] = mapped_column(String(120), default="INBOX")
    use_ssl: Mapped[bool] = mapped_column(Boolean, default=True)
    only_unseen: Mapped[bool] = mapped_column(Boolean, default=True)
    mark_seen: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
