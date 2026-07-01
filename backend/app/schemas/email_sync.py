from pydantic import BaseModel, Field

from app.schemas.upload import UploadResult


class EmailSyncRequest(BaseModel):
    host: str
    port: int = 993
    username: str
    password: str
    mailbox: str = "INBOX"
    limit: int = Field(default=10, ge=1, le=50)
    use_ssl: bool = True
    only_unseen: bool = True
    mark_seen: bool = False


class ImapSettingsRead(BaseModel):
    is_configured: bool
    host: str = ""
    port: int = 993
    username: str = ""
    mailbox: str = "INBOX"
    use_ssl: bool = True
    only_unseen: bool = True
    mark_seen: bool = False
    password_saved: bool = False


class ImapSettingsUpdate(BaseModel):
    host: str
    port: int = 993
    username: str
    password: str | None = None
    mailbox: str = "INBOX"
    use_ssl: bool = True
    only_unseen: bool = True
    mark_seen: bool = False


class SavedEmailSyncRequest(BaseModel):
    limit: int = Field(default=10, ge=1, le=50)


class EmailAttachmentResult(BaseModel):
    email_subject: str | None = None
    email_from: str | None = None
    filename: str
    result: UploadResult


class EmailSyncResult(BaseModel):
    checked_emails: int
    attachments_found: int
    processed: list[EmailAttachmentResult]
