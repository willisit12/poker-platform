from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "db"
    DB_NAME: str = "poker_db"
    DB_USER: str = "poker"
    DB_PASSWORD: str = "pokerpass"
    DB_PORT: str = "5432"

    class Config:
        env_file = ".env"

settings = Settings()