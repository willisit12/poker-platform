from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import game, history
from app.config import settings

app = FastAPI(title="Poker Backend", version="0.1.0")

# Allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins for security (e.g., ["https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(game.router, prefix="/api", tags=["game"])
app.include_router(history.router, prefix="/api", tags=["history"])

@app.on_event("startup")
async def startup():
    # Initialize database connection
    from app.database.db import init_db
    await init_db()