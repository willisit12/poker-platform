// src/components/PlayerActions.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ActionType, useGame } from "../context/GameContext";
import { useState } from "react";
import { toast } from 'react-hot-toast';

export default function PlayerActions() {
  const { state, submitAction } = useGame();
  const [betAmount, setBetAmount] = useState(state.bigBlind);
  // const [error, setError] = useState('');

  const handleAction = (type: ActionType) => {
    // console.log("Players: 1: ", state.players)
    // console.log("Issue: 1: ", state.activePlayerIndex)
    // console.log("Issue: ", state.players[state.activePlayerIndex].playerIndex)
    submitAction({
      type,
      amount: type === 'BET' || type === 'RAISE' ? betAmount : undefined,
      id: state.players[state.activePlayerIndex].id,
      playerIndex: state.activePlayerIndex
      // state.players.find(player=>player.playerIndex===state.activePlayerIndex)?.playerIndex
      // [state.activePlayerIndex].playerIndex
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive" onClick={() => handleAction(ActionType.FOLD)}>
            Fold
          </Button>
          <Button variant="secondary" onClick={() => handleAction(ActionType.CHECK)}>
            Check
          </Button>
          <Button onClick={() => handleAction(ActionType.CALL)}>
            Call ({Math.max(40, state.currentBet)})
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => setBetAmount(p => Math.max(40, p - 40))}>
              <ChevronDown />
            </Button>
            <Input
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-32"
              step={40}
            />
            <Button variant="ghost" onClick={() => setBetAmount(p => p + 40)}>
              <ChevronUp />
            </Button>
          </div>
          <Button onClick={() => handleAction(ActionType.BET)}>
            Bet
          </Button>
          <Button onClick={() => {
            if (betAmount>40)
              handleAction(ActionType.RAISE)
            else {
              toast.error("Increase the Bet Amount");
              // console.log("Raise")
            }
            
            // setError("")
          }}>
            Raise
          </Button>
          <Button variant="ghost" onClick={() => handleAction(ActionType.ALLIN)}>
            All-In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}