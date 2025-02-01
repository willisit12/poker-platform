from fastapi import APIRouter, Depends, HTTPException
from app.schemas.game import HandCreate, HandResponse
from app.services.game_service import GameService
from app.database.repositories import HandRepository
from app.database.db import get_db

router = APIRouter()

@router.post("/hands", response_model=HandResponse)
async def create_hand(hand_data: HandCreate, db=Depends(get_db)):
    # print(hand_data)
    repo = HandRepository(db)
    service = GameService()
    
    try:
        # Convert Pydantic model to dict
        hand_dict = hand_data.dict()
        
        # Calculate winnings
        results = service.calculate_winnings(hand_dict)
        # print(hand_dict['id'])
        # Create hand record
        hand = {
            "id": hand_dict['id'],
            "players": hand_dict['players'],
            "actions": {k: [a.dict() for a in v] for k, v in hand_data.actions.items()},
            "board": hand_dict['board'],
            "starting_stacks": hand_dict["starting_stacks"],
            "uniform_antes": hand_dict["uniform_antes"],
            "min_bet": hand_dict["min_bet"],
            "hole_cards": hand_dict["hole_cards"],
            "board": hand_dict["board"],
            "dealer_position": hand_dict["dealer_position"],
            "antes": hand_dict["antes"],
            "blinds": hand_dict["blinds"],
            "winnings": results['winnings']
            
            
        }
        
        print(results)
        # 
        
        repo.create(hand)
        return {**hand_dict, **results}
        # return {**hand_dict}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))