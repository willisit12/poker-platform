from pydantic import BaseModel
from typing import Dict, List, Tuple

class Action(BaseModel):
    player: str
    action: str  # fold, check, call, bet, raise
    amount: int | None = None

class HandCreate(BaseModel):
    id: str
    players: List[str]
    starting_stacks: List[int]
    uniform_antes: bool
    antes: int
    blinds: Tuple[int, int]  # (small_blind, big_blind)
    min_bet: int
    hole_cards: Dict[str, str]  # Player name: card string
    actions: Dict[str, List[Action]]  # Key: pre_flop/flop/turn/river
    board: Dict[str, str]  # flop/turn/river as concatenated strings
    dealer_position: int

class HandResponse(HandCreate):
    winnings: Dict[str, int]