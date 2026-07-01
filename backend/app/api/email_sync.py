import email
import imaplib
from email.header import decode_header, make_header
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.email_sync import EmailAttachmentResult, EmailSyncRequest, EmailSyncResult
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


@router.post("/imap", response_model=EmailSyncResult)
def sync_imap(payload: EmailSyncRequest, db: Session = Depends(get_db)):
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
