import re
from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(file_path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix in {".doc", ".docx"}:
        document = Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return file_path.read_text(encoding="utf-8", errors="ignore")


def extract_candidate_fields(text: str) -> dict:
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    phone_match = re.search(r"(\+?\d[\d\s().-]{7,}\d)", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    return {
        "full_name": lines[0] if lines else "Unknown Candidate",
        "email": email_match.group(0).lower() if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "extracted_text": text,
    }
