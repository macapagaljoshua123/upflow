from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from app.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_share_invite(to_email: str, file_name: str, preview_url: str, inviter_name: str) -> None:
    message = MessageSchema(
        subject=f"{inviter_name} shared \u201c{file_name}\u201d with you on Upflow",
        recipients=[to_email],
        body=(
            f"<p>{inviter_name} shared an HTML preview with you on Upflow.</p>"
            f"<p><a href=\"{preview_url}\">Open {file_name}</a></p>"
        ),
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)