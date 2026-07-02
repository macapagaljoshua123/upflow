from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from app.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_FROM_NAME=settings.mail_from_name,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=bool(settings.mail_username and settings.mail_password),
    VALIDATE_CERTS=True,
)


class MailNotConfiguredError(Exception):
    """Raised when a send is attempted without SMTP credentials set."""


def _assert_configured() -> None:
    if not settings.mail_username or not settings.mail_password:
        raise MailNotConfiguredError(
            "SMTP isn't configured yet. Set MAIL_USERNAME, MAIL_PASSWORD, "
            "MAIL_SERVER and MAIL_PORT in backend/.env, then restart the API."
        )


async def send_share_invite(
    to_email: str,
    file_name: str,
    preview_url: str,
    inviter_name: str,
    file_content: bytes | None = None,
) -> None:
    """Notify to_email that a file was shared with them. When file_content is
    provided, the actual HTML file is attached to the email (not just a
    link) so the recipient gets the file itself in their inbox."""
    _assert_configured()
    attachments = []
    if file_content is not None:
        attach_name = file_name if file_name.lower().endswith((".html", ".htm")) else f"{file_name}.html"
        attachments.append({
            "file": file_content,
            "headers": {"Content-Disposition": f"attachment; filename=\"{attach_name}\""},
            "mime_type": "text",
            "mime_subtype": "html",
        })
    message = MessageSchema(
        subject=f"{inviter_name} shared \u201c{file_name}\u201d with you on Upflow",
        recipients=[to_email],
        body=(
            f"<p>{inviter_name} shared an HTML file with you on Upflow.</p>"
            f"<p>The file is attached to this email, and you can also open the live preview:</p>"
            f"<p><a href=\"{preview_url}\">Open {file_name}</a></p>"
        ),
        subtype=MessageType.html,
        attachments=attachments or None,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_verification_code(to_email: str, code: str) -> None:
    _assert_configured()
    message = MessageSchema(
        subject="Your Upflow verification code",
        recipients=[to_email],
        body=(
            f"<p>Your Upflow verification code is:</p>"
            f"<p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">{code}</p>"
            f"<p>This code expires in 10 minutes. If you didn\u2019t request this, you can ignore this email.</p>"
        ),
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_email_change_code(to_email: str, code: str) -> None:
    _assert_configured()
    message = MessageSchema(
        subject="Confirm your new Upflow email address",
        recipients=[to_email],
        body=(
            f"<p>Enter this code in Upflow to confirm this is your new email address:</p>"
            f"<p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">{code}</p>"
            f"<p>This code expires in 10 minutes. If you didn\u2019t request this change, you can ignore this email \u2014 your account email won\u2019t be changed.</p>"
        ),
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_password_change_code(to_email: str, code: str) -> None:
    _assert_configured()
    message = MessageSchema(
        subject="Confirm your Upflow password change",
        recipients=[to_email],
        body=(
            f"<p>We received a request to change your Upflow password. Use the code below to confirm:</p>"
            f"<p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">{code}</p>"
            f"<p>This code expires in 10 minutes. If you didn\u2019t request this, you can ignore this email \u2014 your password won\u2019t be changed.</p>"
        ),
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_password_reset_code(to_email: str, code: str) -> None:
    _assert_configured()
    message = MessageSchema(
        subject="Reset your Upflow password",
        recipients=[to_email],
        body=(
            f"<p>We received a request to reset your Upflow password. Use the code below to continue:</p>"
            f"<p style=\"font-size:28px;font-weight:700;letter-spacing:4px;\">{code}</p>"
            f"<p>This code expires in 10 minutes. If you didn\u2019t request a password reset, you can safely ignore this email \u2014 your password won\u2019t be changed.</p>"
        ),
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)