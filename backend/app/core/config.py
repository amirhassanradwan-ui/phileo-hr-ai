from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Phileo HR AI"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://phileo:phileo@localhost:5432/phileo_hr"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 60
    upload_dir: str = "app/uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
