from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import psycopg2
from psycopg2 import extras

@dataclass
class Hand:
    id: str
    players: List[str]
    starting_stacks: List[int]
    uniform_antes: bool
    antes: int
    blinds: Tuple[int, int]
    min_bet: int
    hole_cards: Dict[str, str]
    actions: Dict[str, List[Dict]]
    board: Dict[str, str]
    dealer_position: int
    created_at: datetime
    winnings: Optional[Dict[str, int]] = None

class HandRepository:
    def __init__(self, db):
        self.db = db

    def create(self, hand: Hand):
        with self.db.get_cursor() as cur:
            cur.execute("""
                INSERT INTO hands (
                    id, players, starting_stacks, uniform_antes, antes,
                    blinds, min_bet, hole_cards, actions, board,
                    dealer_position, winnings
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s
                )
            """, (
                hand['id'],
                extras.Json(hand["players"]),
                extras.Json(hand["starting_stacks"]),
                hand["uniform_antes"],
                hand["antes"],
                extras.Json(hand["blinds"]),
                hand["min_bet"],
                extras.Json(hand["hole_cards"]),
                extras.Json(hand["actions"]),
                extras.Json(hand["board"]),
                hand["dealer_position"],
                extras.Json(hand["winnings"]) if hand["winnings"] else None
            ))
            self.db.commit()

    def get(self, hand_id: str) -> Optional[Hand]:
        with self.db.get_cursor() as cur:
            cur.execute("""
                SELECT * FROM hands WHERE id = %s
            """, (hand_id,))
            result = cur.fetchone()
            if result:
                return Hand(
                    id=result['id'],
                    players=result['players'],
                    starting_stacks=result['starting_stacks'],
                    uniform_antes=result['uniform_antes'],
                    antes=result['antes'],
                    blinds=tuple(result['blinds']),
                    min_bet=result['min_bet'],
                    hole_cards=result['hole_cards'],
                    actions=result['actions'],
                    board=result['board'],
                    dealer_position=result['dealer_position'],
                    created_at=result['created_at'],
                    winnings=result.get('winnings')
                )
            return None

    def get_recent(self, limit: int = 10) -> List[Hand]:
        with self.db.get_cursor() as cur:
            cur.execute("""
                SELECT * FROM hands 
                ORDER BY created_at DESC 
                LIMIT %s
            """, (limit,))
            return [Hand(
                id=row['id'],
                players=row['players'],
                starting_stacks=row['starting_stacks'],
                uniform_antes=row['uniform_antes'],
                antes=row['antes'],
                blinds=tuple(row['blinds']),
                min_bet=row['min_bet'],
                hole_cards=row['hole_cards'],
                actions=row['actions'],
                board=row['board'],
                dealer_position=row['dealer_position'],
                created_at=row['created_at'],
                winnings=row.get('winnings')
            ) for row in cur.fetchall()]