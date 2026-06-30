import re
from pathlib import Path

from docx import Document
from pypdf import PdfReader

SECTION_WORDS = {
    "ABOUT",
    "CONTACT",
    "CONTACTS",
    "COURSES",
    "EDUCATION",
    "EXPERIENCE",
    "LANGUAGE",
    "LANGUAGES",
    "SKILLS",
    "UNIVERSITY",
    "WORK",
}
TITLE_MARKERS = (
    "ELECTRICAL",
    "MECHANICAL",
    "MAINTENANCE",
    "MANAGER",
    "ENGINEER",
    "ACCOUNTANT",
    "SPECIALIST",
    "SUPERVISOR",
)

CITY_PATTERN = re.compile(
    r"\b([A-Z][A-Za-z]+(?:[ \t]+[A-Z][A-Za-z]+)?)\s*,\s*(Egypt|EG)\b",
    re.IGNORECASE,
)
EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_PATTERN = re.compile(r"(?:\+?20|0)?1[0125]\d{8}\b")
DATE_PATTERN = re.compile(
    r"^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC|\d{4})\b",
    re.IGNORECASE,
)


def clean_company(value: str) -> str:
    company = value.split("|", 1)[0].strip()
    company = re.sub(r"\s+", " ", company)
    return company


def is_name_line(line: str) -> bool:
    words = line.split()
    cleaned = re.sub(r"[ '\-]", "", line)
    return (
        cleaned.isalpha()
        and 2 <= len(words) <= 4
        and all(len(word.strip("-'")) >= 2 for word in words)
        and line.upper() not in SECTION_WORDS
        and not any(word.upper() in SECTION_WORDS for word in words)
    )


def extract_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(file_path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        document = Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return file_path.read_text(encoding="utf-8", errors="ignore")


def normalize_cv_text(text: str) -> str:
    raw_lines = [line.strip() for line in text.splitlines()]
    normalized_lines: list[str] = []
    buffer: list[str] = []

    def flush_buffer() -> None:
        nonlocal buffer
        if buffer:
            normalized_lines.append("".join(buffer))
            buffer = []

    for line in raw_lines:
        if len(line) == 1 and line.isalpha():
            buffer.append(line)
            continue
        flush_buffer()
        if line:
            normalized_lines.append(line)

    flush_buffer()
    return "\n".join(normalized_lines)


def extract_name(lines: list[str]) -> str:
    if lines:
        first = lines[0].strip()
        if is_name_line(first) or (first.replace("-", "").isalpha() and len(first) >= 2):
            parts = [first]
            if len(lines) > 1:
                second = lines[1].strip()
                for marker in TITLE_MARKERS:
                    marker_index = second.upper().find(marker)
                    if marker_index > 1:
                        parts.append(second[:marker_index])
                        break
            if len(parts) >= 2:
                return " ".join(parts).title()

    for line in lines[:12]:
        if is_name_line(line):
            return line.title()
    return lines[0] if lines else "Unknown Candidate"


def extract_city(text: str) -> str | None:
    match = CITY_PATTERN.search(text)
    if not match:
        return None
    return match.group(1).strip().title()


def extract_current_company(lines: list[str]) -> str | None:
    for index, line in enumerate(lines):
        if "|" in line:
            company = clean_company(line)
            if company and not DATE_PATTERN.match(company):
                return company

        if DATE_PATTERN.match(line):
            nearby_lines = lines[index + 1 : index + 8]
            for nearby_line in nearby_lines:
                if "|" in nearby_line:
                    company = clean_company(nearby_line)
                    if company:
                        return company

    return None


def extract_candidate_fields(text: str) -> dict:
    normalized_text = normalize_cv_text(text)
    email_match = EMAIL_PATTERN.search(normalized_text)
    phone_match = PHONE_PATTERN.search(normalized_text)
    lines = [line.strip() for line in normalized_text.splitlines() if line.strip()]

    return {
        "full_name": extract_name(lines),
        "email": email_match.group(0).lower() if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "city": extract_city(normalized_text),
        "current_company": extract_current_company(lines),
        "extracted_text": normalized_text,
    }
