"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GameAPI, HandHistory } from "@/services/api";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const [history, setHistory] = useState<HandHistory[]>([]);

  useEffect(() => {
    GameAPI.getHistory().then(setHistory);
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StreetActions = ({ street, actions }: { street: string; actions: any[] }) => (
    <div className="space-y-1">
      <h4 className="font-medium capitalize">{street.replace('_', ' ')}</h4>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => (
          <Badge 
            key={i}
            variant="outline" 
            className={cn(
              "px-2 py-1 text-xs font-mono",
              action.action === 'fold' ? 'bg-red-100' :
              action.action === 'raise' ? 'bg-blue-100' :
              'bg-green-100'
            )}
          >
            <span className="font-semibold">{action.player.split(' ')[1]}</span>
            <span className="mx-1">•</span>
            <span>{action.action}</span>
            {action.amount && <span className="ml-1">${action.amount}</span>}
          </Badge>
        ))}
      </div>
    </div>
  );

  console.log(history)

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Hand History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-4">
              {history.map((hand) => (
                <Accordion key={hand.id} type="single" collapsible>
                  <AccordionItem value={hand.id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex-1 text-left">
                          <div className="font-medium">
                            Hand #{hand.id} • {formatDate(hand.created_at)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Blinds: {hand.blinds[0]}/{hand.blinds[1]} • 
                            Dealer: {hand.players[hand.dealer_position]} • 
                            {/* Pot: {Object.values(hand.winnings).reduce((a: number, b: number) => a + Math.abs(b), 0)} */}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Players Section */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Players</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {hand.players.map((player, i) => (
                                <div key={player} className="text-sm">
                                  <div className="flex items-center justify-between">
                                    <span>
                                      {player} 
                                      <span className="text-muted-foreground ml-2">
                                        (${hand.starting_stacks[i]})
                                      </span>
                                    </span>
                                    {
                                        hand.winnings && (
                                            // <>Here</>
                                            hand.winnings[player] && (
                                                <span className={hand.winnings[player]>=0 ? 'text-green-500': 'text-red-500'}>
                                                  {hand.winnings[player]}
                                                </span>
                                              )
                                        )
                                    }
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {hand.hole_cards[`${player}`]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Board Cards */}
                          <div>
                            <h3 className="font-medium mb-2">Community Cards</h3>
                            <div className="flex gap-2">
                              {Object.entries(hand.board).map(([street, cards]) => (
                                <div key={street} className="text-sm">
                                  <div className="capitalize">{street}:</div>
                                  <div className="font-mono">{cards}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions Section */}
                        <div className="space-y-4">
                          {Object.entries(hand.actions).map(([street, actions]) => (
                            <StreetActions 
                              key={street}
                              street={street}
                              actions={actions as any[]}
                            />
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}