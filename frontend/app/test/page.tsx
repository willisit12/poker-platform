"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type Player = {
  id: number;
  name: string;
  hand: string[];
  chips: number;
  hasFolded?: boolean;
};

type ActionLog = string[];

const PokerGame: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Player 1", hand: [], chips: 10000 },
    { id: 2, name: "Player 2", hand: [], chips: 10000 },
    { id: 3, name: "Player 3", hand: [], chips: 10000 },
    { id: 4, name: "Player 4", hand: [], chips: 10000 },
    { id: 5, name: "Player 5", hand: [], chips: 10000 },
    { id: 6, name: "Player 6", hand: [], chips: 10000 },
  ]);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [actionLog, setActionLog] = useState<ActionLog>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);

  const deck = [
    "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s",
    "4c", "4d", "4h", "4s", "5c", "5d", "5h", "5s",
    "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s",
    "8c", "8d", "8h", "8s", "9c", "9d", "9h", "9s",
    "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js",
    "Qc", "Qd", "Qh", "Qs", "Kc", "Kd", "Kh", "Ks",
    "Ac", "Ad", "Ah", "As",
  ];

  const shuffleDeck = () => [...deck].sort(() => Math.random() - 0.5);

  const startGame = () => {
    setGameStarted(true);
    let shuffledDeck = shuffleDeck();
    let updatedPlayers = players.map((player, index) => ({
      ...player,
      hand: [shuffledDeck[index * 2], shuffledDeck[index * 2 + 1]],
    }));

    setPlayers(updatedPlayers);
    setActionLog(["Game started. Cards dealt."]);
  };

  const dealFlop = () => {
    setCommunityCards(deck.slice(12, 15));
    setActionLog((log) => [...log, `Flop dealt: ${deck.slice(12, 15).join(", ")}`]);
  };

  const dealTurn = () => {
    setCommunityCards((prev) => [...prev, deck[16]]);
    setActionLog((log) => [...log, `Turn card: ${deck[16]}`]);
  };

  const dealRiver = () => {
    setCommunityCards((prev) => [...prev, deck[18]]);
    setActionLog((log) => [...log, `River card: ${deck[18]}`]);
  };

  const handleAction = (action: string, amount?: number) => {
    let playerId = players[currentPlayerIndex].id;

    if (action === "Fold") {
      setPlayers((prev) =>
        prev.map((player) => (player.id === playerId ? { ...player, hasFolded: true } : player))
      );
    } else if (action === "Bet" && amount) {
      setPot((prev) => prev + amount);
    }

    setActionLog((log) => [...log, `Player ${playerId} ${action} ${amount ? amount + " chips" : ""}`]);
    
    // Move to the next player who hasn't folded
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while (players[nextIndex].hasFolded) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    setCurrentPlayerIndex(nextIndex);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Texas Hold'em Poker</h1>

      {!gameStarted ? (
        <Button onClick={startGame}>Start Game</Button>
      ) : (
        <>
          <h2 className="text-xl mt-4">Community Cards: {communityCards.join(", ")}</h2>
          <h3 className="text-lg mt-2">Pot: {pot} chips</h3>

          <div className="p-4 border rounded mt-4">
            <h2 className="text-lg font-bold">Current Player: {players[currentPlayerIndex].name}</h2>
            <p>Hand: {players[currentPlayerIndex].hand.join(", ")}</p>
            <p>Chips: {players[currentPlayerIndex].chips}</p>

            {!players[currentPlayerIndex].hasFolded ? (
              <div className="mt-2">
                <Button onClick={() => handleAction("Fold")}>Fold</Button>
                <Button onClick={() => handleAction("Check")}>Check</Button>
                <Button onClick={() => handleAction("Bet", 100)}>Bet 100</Button>
                <Button onClick={() => handleAction("Raise", 200)}>Raise 200</Button>
              </div>
            ) : (
              <p className="text-red-500">Folded</p>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={dealFlop}>Deal Flop</Button>
            <Button onClick={dealTurn}>Deal Turn</Button>
            <Button onClick={dealRiver}>Deal River</Button>
          </div>

          <div className="mt-6 p-4 border rounded">
            <h2 className="font-bold">Game Log</h2>
            <div className="overflow-auto max-h-60">
              {actionLog.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PokerGame;
