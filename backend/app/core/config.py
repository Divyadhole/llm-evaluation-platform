from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    cors_origins: list[str] = [
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ]
    postgres_url: str = "postgresql://llm_eval:llm_eval@localhost:5433/llm_eval"
    redis_url: str = "redis://localhost:6380/0"
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
