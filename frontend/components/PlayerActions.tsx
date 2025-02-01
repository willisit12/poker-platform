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
        {/* Player Actions */}
      <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="destructive" onClick={() => handleAction(ActionType.FOLD)}>Fold</Button>
          <Button variant="secondary" onClick={() => handleAction(ActionType.CHECK)}>Check</Button>
          <Button variant="default"
            onClick={() => handleAction(ActionType.CALL)}
          >Call ({Math.max(40, state.currentBet)})</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setBetAmount(p => Math.max(40, p - 40))}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Input type="number" className="w-24"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              step={40} 
            />
            <Button variant="ghost" size="icon" onClick={() => setBetAmount(p => p + 40)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => {
            if (betAmount>=80)
              handleAction(ActionType.RAISE)
            else {
              toast.error("Increase the Bet Amount to 80 or above");
              // console.log("Raise")
            }
            
            // setError("")
          }}>Raise</Button>
          <Button variant="secondary" onClick={() => toast.success("ALL IN")}>All-In</Button>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}