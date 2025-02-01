"use client"
// src/pages/index.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import PokerTable from "@/components/PokerTable";
import PlayerActions from "@/components/PlayerActions";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { state, startNewHand } = useGame();
  const [stackSize, setStackSize] = useState(10000);

  useEffect(()=>{},[state])

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Game Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <div className="flex-1 flex gap-2 items-center">
            <Input
              type="number"
              value={stackSize}
              onChange={(e) => setStackSize(Number(e.target.value))}
              className="w-32"
            />
            <Button onClick={async() => await startNewHand(stackSize)}>
              {state.handId ? "Reset Hand" : "Start Game"}
            </Button>
          </div>
          {/* {state.winner && (
            <div className="text-lg font-semibold">
              Winner: {state.winner}
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Poker Table */}
      <PokerTable />

      {/* Player Actions */}
      {state.handId && state.currentStreet !== 'showdown' && (
        <PlayerActions />
      )}

      {/* Game Log */}
      <Card>
        <CardHeader>
          <CardTitle>Game Log</CardTitle>
        </CardHeader>
        <CardContent className="h-48 overflow-auto">
          {state.actionLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}