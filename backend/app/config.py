from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ChurnGuard AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "secret-key-replace-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./churnguard.db"

    class Config:
        env_file = ".env"

settings = Settings()
