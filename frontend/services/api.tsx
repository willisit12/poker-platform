// src/services/api.ts
import axios, { AxiosResponse } from 'axios';
import { Key } from 'react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type HandHistory = {
  id: string;
  players: string[];
  starting_stacks: number[];
  blinds: [number, number];
  hole_cards: Record<string, string>;
  actions: Record<string, Array<{
    action: string;
    amount: number | null;
    player: string;
  }>>;
  board: {
    flop?: string;
    turn?: string;
    river?: string;
  };
  dealer_position: number;
  created_at: string;
  winnings: Record<string, number>;
};

export const GameAPI = {
  async postHand(handData: any) {
    const response = await axios.post(`${API_BASE}/hands`, handData);
    return response.data;
  },

  async getHistory() {
      const response = await axios.get<HandHistory[]>(`${API_BASE}/history`);
      // console.log(response)
      return response.data;
  }
};