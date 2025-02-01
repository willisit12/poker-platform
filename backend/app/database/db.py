import psycopg2
import psycopg2.extras
from app.config import settings

class Database:
    def __init__(self):
        self.conn = psycopg2.connect(
            dbname=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT
        )
    
    def get_cursor(self):
        return self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    def commit(self):
        self.conn.commit()

async def init_db():
    db = Database()
    with db.get_cursor() as cur:
        # cur.execute("DROP TABLE IF EXISTS hands CASCADE;")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS hands (
                id VARCHAR(36) PRIMARY KEY,
                players JSONB NOT NULL,
                starting_stacks JSONB NOT NULL,
                uniform_antes BOOLEAN NOT NULL,
                antes INTEGER NOT NULL,
                blinds JSONB NOT NULL,
                min_bet INTEGER NOT NULL,
                hole_cards JSONB NOT NULL,
                actions JSONB NOT NULL,
                board JSONB NOT NULL,
                dealer_position INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                winnings JSONB
            );
        """)
    db.commit()

def get_db():
    return Database()