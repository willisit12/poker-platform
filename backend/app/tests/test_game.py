from fastapi.testclient import TestClient
from app.main import app
from app.schemas.game import Action

client = TestClient(app)

def test_full_hand_flow():
    test_hand = {
        "id": "test-hand-1",
        "players": {
            "player1": "Ac2d",
            "player2": "KdQh"
        },
        "actions": [
            Action(type="RAISE", amount=100, player="player1", street="pre_flop").dict(),
            Action(type="CALL", player="player2", street="pre_flop").dict(),
            Action(type="CHECK", player="player1", street="flop").dict(),
            Action(type="CHECK", player="player2", street="flop").dict(),
            Action(type="BET", amount=50, player="player1", street="turn").dict(),
            Action(type="FOLD", player="player2", street="turn").dict()
        ],
        "board": {
            "flop": ["2s", "3h", "4d"],
            "turn": ["5c"],
            "river": ["6s"]
        },
        "small_blind": 50,
        "big_blind": 100,
        "stacks": [1000, 1000],
        "dealer_position": 0
    }
    
    # Create hand
    response = client.post("/api/hands", json=test_hand)
    assert response.status_code == 200
    assert "winnings" in response.json()
    assert "player1" in response.json()['winnings']
    
    # Verify player1 wins after player2 folds
    assert response.json()['winnings']['player1'] > 0
    assert response.json()['winnings']['player2'] < 0