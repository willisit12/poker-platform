"use client"

// src/context/GameContext.tsx
import { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameAPI } from '../services/api';

type Card = {
  value: number;
  display: string;
};

export enum ActionType {
  FOLD = "FOLD",
  CHECK = 'CHECK',
  BET = 'BET',
  CALL = "CALL",
  RAISE = 'RAISE',
  ALLIN = 'ALLIN'

}

type Player = {
  id: string;
  playerIndex: number;
  name: string;
  stack: number;
  cards: string[];
  isFolded: boolean;
  // isActive: boolean;
};

type Action = {
  id: string | undefined,
  type: ActionType;
  amount?: number;
  playerIndex: number;
  street: string;
};

enum CurrentStreetType  {
  pre_flop = 'pre_flop', 
  flop = 'flop',
  turn = 'turn',
  river = 'river',
  showdown = 'showdown'
}

type GameState = {
  handId: string | null;
  players: Player[];
  communityCards: string[];
  currentStreet: CurrentStreetType;
  pot: number;
  currentBet: number;
  dealerPosition: number;
  smallBlind: number;
  smallBlindId: string;
  bigBlind: number;
  bigBlindId: string;
  actionLog: string[];
  actions: Action[];
  activePlayerIndex: number;
  remainingDeck: Card[];
  actingPlayers: number[];
  winner?: Record<string, number>;
  currentRoundContributions: number[];
  contributions: number[];
  number_of_rounds: number;
  stackSize: number
};

type GameContextType = {
  state: GameState;
  startNewHand: (stackSize: number) => void;
  submitAction: (action: Omit<Action, 'street'>) => void;
  completeHand: () => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  handId: null,
  players: [], 
  communityCards: [],
  currentStreet: CurrentStreetType.pre_flop,
  pot: 0,
  currentBet: 0,
  dealerPosition: 0,
  smallBlind: 20,
  smallBlindId: '0',
  bigBlind: 40,
  bigBlindId: '0',
  actionLog: [],
  actions: [],
  activePlayerIndex: 0,
  remainingDeck: [],
  actingPlayers: [],
  currentRoundContributions: Array(6).fill(0),
  contributions: Array(6).fill(0),
  number_of_rounds: 0,
  stackSize: 0
};

function gameReducer(state: GameState, action: any): GameState {
  switch (action.type) {
    case 'NEW_HAND':
      return { ...initialState, ...action.payload };
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  // const []

  useEffect(()=>{
    console.log(state.handId)
  },[state])

  const createDeck = (): Card[] => {
    const suits = ['s', 'c', 'h', 'd'];
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (let num = 1; num <= 13; num++) {
        let value = num === 1 ? 14 : num;
        let display = '';
        
        switch(num) {
          case 1: display = 'A'; break;
          case 11: display = 'J'; break;
          case 12: display = 'Q'; break;
          case 13: display = 'K'; break;
          default: display = num.toString();
        }
        
        deck.push({ value, display: `${display}${suit}` });
      }
    }
    // deck.map(card => card.display.replace('10','T'))
    const updatedDeck = deck.map(card => ({
      ...card,
      display: card.display.replace('10','T')
  }));
    // console.log(updatedDeck);
    return updatedDeck;
  };

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewHand = async(stackSize: number) => {
    const handId = uuidv4();
    const fullDeck = createDeck();
    const shuffledDeck = shuffleDeck(fullDeck);
    
    // Deal cards to players
    const players: Player[] = [];
    let cardIndex = 0;
    for (let i = 0; i < 6; i++) {
      const cards = shuffledDeck.slice(cardIndex, cardIndex + 2)
        .sort((a, b) => b.value - a.value)
        .map(c => c.display);
      cardIndex += 2;
      
      players.push({
        id: `player${i+1}`,
        playerIndex: i,
        name: `Player ${i+1}`,
        stack: stackSize,
        cards,
        isFolded: false,
        // isActive: true
      });
    }

    // Select random dealer for first hand, then rotate
    const dealerPosition = state.handId 
      ? (state.dealerPosition + 1) % 6 
      : Math.floor(Math.random() * 6);

    const sbIndex = (dealerPosition + 1) % 6;
    const bbIndex = (dealerPosition + 2) % 6;
    const firstActor = (dealerPosition + 3) % 6;

    // Post blinds
    const updatedPlayers = players.map((p, i) => ({
      ...p,
      stack: p.stack - (i === sbIndex ? 20 : 0) - (i === bbIndex ? 40 : 0)
    }));

    // Create action log
    const actionLog = [
      ...players.map((p, i) => `Player ${i+1} is dealt ${p.cards.join(' ')}`),
      '---',
      `Player ${dealerPosition + 1} is the dealer`,
      `Player ${sbIndex + 1} posts small blind 20`,
      `Player ${bbIndex + 1} posts big blind 40`,

      '---'
    ];
    // console.log("Actor: ", firstActor+1)
    // console.log("Initial Players: ", updatedPlayers)

    await dispatch({
      type: 'NEW_HAND',
      payload: {
        handId,
        players: updatedPlayers,
        communityCards: [],
        currentStreet: 'pre_flop',
        pot: 60,
        currentBet: 40,
        dealerPosition,
        smallBlind: 20,
        bigBlind: 40,
        actionLog,
        actions: [],
        remainingDeck: shuffledDeck.slice(12),
        actingPlayers: Array.from({ length: 6 }, (_, i) => i),
        activePlayerIndex: firstActor,
        winner: undefined,
        currentRoundContributions: Array.from({ length: 6 }, (_, i) => {
          if (i === sbIndex) return 20;
          if (i === bbIndex) return 40;
          return 0;
        }),
        contributions: Array.from({ length: 6 }, (_, i) => {
          if (i === sbIndex) return 20;
          if (i === bbIndex) return 40;
          return 0;
        }),
        stackSize
      }
    });
  };

  const completeHand = async () => {
    // Transform players data
  const players = state.players.map(p => p.name);
  const starting_stacks = state.players.map(p => state.stackSize);
  const id = state.handId
  const dealer_position = state.dealerPosition
  // Transform actions by street
  const actionsByStreet: Record<string, Array<{ player: string, action: string, amount?: number }>> = {};
  state.actions.forEach(action => {
    const street = action.street.toLowerCase()
    // .replace('pre_', '');
    if (!actionsByStreet[street]) actionsByStreet[street] = [];
    
    const playerName = state.players.find(p => p.playerIndex === action.playerIndex)?.name || '';
    
    actionsByStreet[street].push({
      player: playerName,
      action: action.type.toLowerCase(),
      amount: action.amount
    });

    
  });

  // Transform board data
  const board = {
    flop: state.communityCards.slice(0, 3).join(''),
    turn: state.communityCards[3] || '',
    river: state.communityCards[4] || ''
  };

  const handData = {
    id,
    players,
    starting_stacks,
    uniform_antes: false, // Assuming constant value
    antes: 0, // Assuming constant value
    blinds: [state.smallBlind, state.bigBlind],
    min_bet: 40, // Assuming constant value
    hole_cards: state.players.reduce((acc, player) => {
      acc[player.name] = player.cards.join('');
      return acc;
    }, {} as Record<string, string>),
    actions: actionsByStreet,
    board,
    dealer_position
  };


    // console.log(handData)

    try {
      const result = await GameAPI.postHand(handData);
      console.log(result.winners)

    } catch (error) {
      console.error('Error submitting hand:', error);
    }
  };

  // Update handleStreetTransition to reset contributions and bets
  const handleStreetTransition = async (log: string[], contributions: number[], fullAction: Action, newPlayers:Player[]) => {
    // console.log("Full Action: ", fullAction)
    // ... existing transition logic
    let newCommunityCards = [...state.communityCards];
    let newStreet: GameState['currentStreet'] = state.currentStreet;
    let newLog = [...state.actionLog, ...log];
    switch (state.currentStreet) {
      case CurrentStreetType.pre_flop:
        newCommunityCards = state.remainingDeck.splice(0, 3).map(c => c.display);
        newStreet = CurrentStreetType.flop;
        newLog.push(`Flop: ${newCommunityCards.join(' ')}`);
        break;
        
      case CurrentStreetType.flop:
        newCommunityCards.push(state.remainingDeck.shift()!.display);
        newStreet = CurrentStreetType.turn;
        newLog.push(`Turn: ${newCommunityCards[3]}`);
        break;

      case 'turn':
        newCommunityCards.push(state.remainingDeck.shift()!.display);
        newStreet = CurrentStreetType.river;
        newLog.push(`River: ${newCommunityCards[4]}`);
        break;

      case 'river':
        newStreet = CurrentStreetType.showdown;
        newLog.push('Showdown');
        newLog.push( `Hand ID: ${state.handId}`)
        newLog.push(`Full pot was ${state.pot}`)
        completeHand();
        break;
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        communityCards: newCommunityCards,
        currentStreet: newStreet,
        actionLog: newLog,
        actions: [...state.actions, fullAction],
        currentBet: 40,
        activePlayerIndex: state.players.filter(p=>!p.isFolded)[0].playerIndex,
        currentRoundContributions: Array(6).fill(0),
        contributions,
        number_of_rounds: state.number_of_rounds + 1,
        players: newPlayers
      }
    });
  };

  const submitAction = async (action: Omit<Action, 'street'>) => {
    // console.log("Action Perform: ",action)
    const fullAction = { ...action, street: state.currentStreet };
    let newPlayers = [...state.players];
    let newCurrentBet = state.currentBet;
    let newCurrentRoundContributions = [...state.currentRoundContributions];
    let contributions =  [...state.contributions];
    // pre_flip_count +=1;
    
    switch (action.type) {
      case ActionType.FOLD: {
        newPlayers = newPlayers.map(p => 
          p.playerIndex === action.playerIndex ? { ...p, isFolded: true, isActive: false } : p
        );
        break;
      }

    case ActionType.CALL: {
      const player = newPlayers.find(p => p.playerIndex === action.playerIndex)!;
      const currentContribution = newCurrentRoundContributions[action.playerIndex];
      
      const callAmount =  (Math.max(...newCurrentRoundContributions) - currentContribution)===0? state.currentBet: Math.max(...newCurrentRoundContributions) - currentContribution;
      // console.log("Call Amount: ", callAmount, " Current Contribution: ", currentContribution, "Max: ", Math.max(...newCurrentRoundContributions));
      contributions[action.playerIndex] = contributions[action.playerIndex] + newCurrentBet;
      newPlayers = newPlayers.map(p => 
        p.playerIndex === action.playerIndex ? { ...p, stack: p.stack - callAmount } : p
      );
      newCurrentRoundContributions[action.playerIndex] += callAmount;
      break;
    }

    case ActionType.BET:
    case ActionType.RAISE: {
      const player = newPlayers.find(p => p.playerIndex === action.playerIndex)!;
      const currentContribution = newCurrentRoundContributions[action.playerIndex];
      const amountToAdd = action.amount! - currentContribution;
      newPlayers = newPlayers.map(p => 
        p.playerIndex === action.playerIndex ? { ...p, stack: p.stack - amountToAdd } : p
      );
      newCurrentRoundContributions[action.playerIndex] += action.amount!;
      newCurrentBet = (state.currentBet>=action.amount!)?state.currentBet:action.amount!

      contributions[action.playerIndex] = contributions[action.playerIndex] + amountToAdd;
      break;
    }
  }

    const sum = newCurrentRoundContributions.reduce((acc, val) => acc + val, 0);

    const allMatched = state.players.filter(p=>!newPlayers[p.playerIndex].isFolded)
        .every(p => 
          newCurrentRoundContributions[p.playerIndex] === Math.max(...newCurrentRoundContributions) && sum!=0
        );
    
    // console.log("All Methods: ", allMatched, "Counter_Pre_Fold: ", state.number_of_rounds)
    
      const _play = state.players.find(player=>player.playerIndex === action.playerIndex)?.name
    if (allMatched) {
      const log = [
        `${_play} ${action.type}${action.amount ? ' ' + action.amount : ''}`,
        `----------------------------`
      ]
      handleStreetTransition(log, contributions, fullAction, newPlayers);
    } else {
      // Determine next player to act
      const nextPlayerIndex = findNextPlayer(
        state.activePlayerIndex,
        state.players,
        newCurrentRoundContributions,
        newCurrentBet,
        state.currentStreet
      );

      let newPot = contributions.reduce((acc, val) => acc + val, 0);
      

      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          players: newPlayers,
          pot: newPot,
          currentBet: newCurrentBet,
          actions: [...state.actions, fullAction],
          actionLog: [...state.actionLog, 
            `${_play} ${action.type}${action.amount ? ' ' + action.amount : ''}`
          ],
          activePlayerIndex: nextPlayerIndex,
          currentRoundContributions: newCurrentRoundContributions,
          contributions,
          number_of_rounds: state.number_of_rounds + 1
        }
      });
    }
    // console.log("Contributions: ", state.contributions)
  };

  return (
    <GameContext.Provider value={{ state, startNewHand, submitAction, completeHand }}>
      {children}
    </GameContext.Provider>
  );
}

// Helper function to find next player
const findNextPlayer = (
  currentIndex: number,
  players: Player[],
  contributions: number[],
  currentBet: number,
  currentStreet: string
): number => {
  for (let i = 1; i <= players.length; i++) {
    const nextIndex = (currentIndex + i) % players.length;
    const player = players[nextIndex];
    // if (!player.isFolded && currentStreet===CurrentStreetType.pre_flop)
    //   return nextIndex;
    if (!player.isFolded && contributions[nextIndex] < Math.max(...contributions)) {
      return nextIndex;
    }
    if (!player.isFolded && currentBet === 0) {
      return nextIndex;
    }
  }
  return -1; // Should not happen if allMatched check is correct
};


export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};