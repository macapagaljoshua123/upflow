"""
Basic safety checks run on every upload before it is stored.

This is a first line of defense, not a full malware scanner:
- restricts file types to static web assets
- enforces a size ceiling
- flags a short list of high-risk patterns (e.g. obfuscated eval chains)
Real isolation comes from serving every preview inside a sandboxed iframe
(sandbox="allow-scripts allow-forms" with no allow-same-origin) so a page
can never reach into another user's session or the parent app.
"""
import re

ALLOWED_EXTENSIONS = {".html", ".htm", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".json", ".woff", ".woff2"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB per file

SUSPICIOUS_PATTERNS = [
    re.compile(r"eval\s*\(\s*atob", re.IGNORECASE),
    re.compile(r"document\.write\s*\(\s*unescape", re.IGNORECASE),
    re.compile(r"<iframe[^>]+src\s*=\s*[\"']javascript:", re.IGNORECASE),
]


class UnsafeUploadError(Exception):
    pass


def check_extension(filename: str) -> None:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise UnsafeUploadError(f"\u201c{ext or filename}\u201d files aren\u2019t allowed. Upload HTML, CSS, JS, or image assets.")


def check_size(content: bytes) -> None:
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise UnsafeUploadError("This file is over the 15 MB limit per upload.")


def scan_contents(content: bytes) -> None:
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        return
    for pattern in SUSPICIOUS_PATTERNS:
        if pattern.search(text):
            raise UnsafeUploadError("This file was blocked because it matched a known unsafe script pattern.")


def run_safety_checks(filename: str, content: bytes) -> None:
    check_extension(filename)
    check_size(content)
    scan_contents(content)