from pokerkit import NoLimitTexasHoldem, Automation, Mode
from app.schemas.game import Action

class GameService:
    def __init__(self):
        self.state = None

    def process_action(self, action: Action):
        # {'player': 'Player 3', 'action': 'bet', 'amount': 40}
        print("First", action["action"].upper())
        if action["action"].upper() == 'FOLD':
            self.state.fold()
        elif action["action"].upper() == 'CHECK':
            self.state.check_or_call()
        elif action["action"].upper() == 'CALL':
            self.state.check_or_call()
        elif action["action"].upper() == 'BET':
            self.state.complete_bet_or_raise_to(action["amount"])
        elif action["action"].upper() == 'RAISE':
            self.state.complete_bet_or_raise_to(action["amount"])
        else:
            print(action["action"].upper())
    
    def calculate_winnings(self, hand_data: dict) -> dict:
        try:
            
            self.state = NoLimitTexasHoldem.create_state(
                # Automations
                (
                    Automation.ANTE_POSTING,
                    Automation.BET_COLLECTION,
                    Automation.BLIND_OR_STRADDLE_POSTING,
                    Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                    Automation.HAND_KILLING,
                    Automation.CHIPS_PUSHING,
                    Automation.CHIPS_PULLING,
                ),
                False,  # Uniform antes?
                0,  # Antes
                tuple(hand_data['blinds']),  # Blinds or straddles
                20,  # Min-bet
                tuple(hand_data['starting_stacks']),  # Starting stacks
                len(hand_data['players']),  # Number of players
            )
            
            # Deal hole cards to each player in order
            for player_id in hand_data['players']:
                hole_cards = hand_data['hole_cards'][player_id]
                self.state.deal_hole(hole_cards)

            # Process actions by street
            streets = ['pre_flop', 'flop', 'turn', 'river']
            for street in streets:
                print(street)
                # Deal community cards after the street if applicable
                if street != 'pre_flop':
                    # print("Burning Card")
                    # if "BURN_CARD" in self.state.status:
                    self.state.burn_card()
                    if street == 'flop':
                        self.state.deal_board(hand_data['board']['flop'])
                    elif street == 'turn':
                        self.state.deal_board(hand_data['board']['turn'])
                    elif street == 'river':
                        self.state.deal_board(hand_data['board']['river'])
                        
                # Process each action in the current street
                for action in hand_data['actions'][street]:
                    # print(action)
                    self.process_action(action)
            # print("Here Done Playing")

            # Collect results
            payoffs = list(self.state.payoffs)
            winnings = {
                player_id: payoffs[i]
                for i, player_id in enumerate(hand_data['players'])
            }
            final_stacks = {
                player_id: self.state.stacks[i]
                for i, player_id in enumerate(hand_data['players'])
            }
            
            # print("Winnings: ", winnings)

            return {
                'winnings': winnings,
                'final_stacks': final_stacks
            }
        except Exception as e:
            print(e)
            raise RuntimeError(f"Game simulation failed: {str(e)}")
# # Calculate and print the winnings
# winnings = calculate_winnings(converted_hand_data)
# print(winnings)