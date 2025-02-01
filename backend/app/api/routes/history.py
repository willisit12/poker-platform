from fastapi import APIRouter, Depends
from app.database.repositories import HandRepository
from app.database.db import get_db

router = APIRouter()

@router.get("/history")
async def get_history(db=Depends(get_db), limit: int = 10):
    repo = HandRepository(db)
    return repo.get_recent(limit)