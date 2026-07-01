import email
import imaplib
from email.header import decode_header, make_header
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.database.session import get_db
from app.models.imap_settings import ImapSettings
from app.models.user import User
from app.schemas.email_sync import (
    EmailAttachmentResult,
    EmailSyncRequest,
    EmailSyncResult,
    ImapSettingsRead,
    ImapSettingsUpdate,
    SavedEmailSyncRequest,
)
from app.services.cv_import_service import SUPPORTED_CV_EXTENSIONS, import_cv_file

router = APIRouter()


def decode_text(value: str | None) -> str | None:
    if not value:
        return None
    return str(make_header(decode_header(value)))


def connect_to_mailbox(payload: EmailSyncRequest) -> imaplib.IMAP4:
    try:
        if payload.use_ssl:
            client: imaplib.IMAP4 = imaplib.IMAP4_SSL(payload.host, payload.port)
        else:
            client = imaplib.IMAP4(payload.host, payload.port)
        client.login(payload.username, payload.password)
        return client
    except imaplib.IMAP4.error as exc:
        raise HTTPException(status_code=400, detail="Could not connect to IMAP mailbox") from exc


def read_saved_settings(db: Session) -> ImapSettings | None:
    return db.scalar(select(ImapSettings).order_by(ImapSettings.id).limit(1))


def settings_to_read(settings: ImapSettings | None) -> ImapSettingsRead:
    if settings is None:
        return ImapSettingsRead(is_configured=False)
    return ImapSettingsRead(
        is_configured=True,
        host=settings.host,
        port=settings.port,
        username=settings.username,
        mailbox=settings.mailbox,
        use_ssl=settings.use_ssl,
        only_unseen=settings.only_unseen,
        mark_seen=settings.mark_seen,
        password_saved=bool(settings.password),
    )


def run_imap_sync(payload: EmailSyncRequest, db: Session) -> EmailSyncResult:
    client = connect_to_mailbox(payload)
    processed: list[EmailAttachmentResult] = []
    checked_emails = 0
    attachments_found = 0

    try:
        status, _ = client.select(payload.mailbox, readonly=not payload.mark_seen)
        if status != "OK":
            raise HTTPException(status_code=400, detail="Could not open mailbox")

        search_filter = "UNSEEN" if payload.only_unseen else "ALL"
        status, data = client.search(None, search_filter)
        if status != "OK":
            raise HTTPException(status_code=400, detail="Could not search mailbox")

        message_ids = data[0].split()[-payload.limit :]
        checked_emails = len(message_ids)

        for message_id in reversed(message_ids):
            status, message_data = client.fetch(message_id, "(RFC822)")
            if status != "OK":
                continue

            raw_message = next((part[1] for part in message_data if isinstance(part, tuple)), None)
            if raw_message is None:
                continue

            message = email.message_from_bytes(raw_message)
            subject = decode_text(message.get("subject"))
            sender = decode_text(message.get("from"))

            for part in message.walk():
                filename = decode_text(part.get_filename())
                if not filename:
                    continue

                suffix = Path(filename).suffix.lower()
                if suffix not in SUPPORTED_CV_EXTENSIONS:
                    continue

                content = part.get_payload(decode=True)
                if not content:
                    continue

                attachments_found += 1
                result = import_cv_file(db, filename, content)
                processed.append(
                    EmailAttachmentResult(
                        email_subject=subject,
                        email_from=sender,
                        filename=filename,
                        result=result,
                    )
                )
    finally:
        try:
            client.close()
        except imaplib.IMAP4.error:
            pass
        client.logout()

    return EmailSyncResult(
        checked_emails=checked_emails,
        attachments_found=attachments_found,
        processed=processed,
    )


@router.get("/settings", response_model=ImapSettingsRead)
def get_imap_settings(db: Session = Depends(get_db)):
    return settings_to_read(read_saved_settings(db))


@router.put("/settings", response_model=ImapSettingsRead)
def save_imap_settings(
    payload: ImapSettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    settings = read_saved_settings(db)
    if settings is None:
        if not payload.password:
            raise HTTPException(status_code=400, detail="Password is required when creating IMAP settings")
        settings = ImapSettings(password=payload.password)
        db.add(settings)

    settings.host = payload.host
    settings.port = payload.port
    settings.username = payload.username
    settings.mailbox = payload.mailbox
    settings.use_ssl = payload.use_ssl
    settings.only_unseen = payload.only_unseen
    settings.mark_seen = payload.mark_seen
    if payload.password:
        settings.password = payload.password

    db.commit()
    db.refresh(settings)
    return settings_to_read(settings)


@router.post("/imap", response_model=EmailSyncResult)
def sync_saved_imap(payload: SavedEmailSyncRequest, db: Session = Depends(get_db)):
    settings = read_saved_settings(db)
    if settings is None or not settings.password:
        raise HTTPException(status_code=400, detail="IMAP settings are not configured")

    sync_payload = EmailSyncRequest(
        host=settings.host,
        port=settings.port,
        username=settings.username,
        password=settings.password,
        mailbox=settings.mailbox,
        limit=payload.limit,
        use_ssl=settings.use_ssl,
        only_unseen=settings.only_unseen,
        mark_seen=settings.mark_seen,
    )
    return run_imap_sync(sync_payload, db)
