"use client";
import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { Button } from "./ui/button";

interface Props extends React.HTMLAttributes<HTMLDivElement>  {
    stackSize: number;
  };


  export default function GameCompleteModal({stackSize}: Props) {
    
  const { state, startNewHand } = useGame();
  return (
    <div className=" fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-30 z-50">
      <div className="bg-white p-8 rounded-md shadow-md">
        <p>
          {" "}
          Game Completed. Check History
        </p>
        <div className="mt-4 flex justify-end">
        <Link
          href={
            '/history'
          }
          className="p-4 hover:bg-gray-100 text-start border-b bg-black text-white hover:text-black rounded-lg mr-2"
          title="History"
        >History</Link>
        <Button onClick={async() => await startNewHand(stackSize)}>
              {state.handId ? "Reset Hand" : "Start Game"}
            </Button>
        </div>
      </div>
    </div>
  );
};
