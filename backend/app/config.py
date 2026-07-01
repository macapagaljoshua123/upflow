from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://upflow:upflow@localhost:5432/upflow"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"

    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = "no-reply@upflow.app"
    mail_server: str = "smtp.example.com"
    mail_port: int = 587

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()