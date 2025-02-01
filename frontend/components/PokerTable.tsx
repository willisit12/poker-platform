import { useGame } from '@/context/GameContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
// src/components/PokerTable.tsx
export default function PokerTable() {
  const { state } = useGame();

    useEffect(()=>{
      // console.log(state)
      toast.error("Increase the Bet Amount");
    },[state])

  return (
    <div className="poker-table">
      {/* // For each player seat: */}
      
      {/* Community cards */}
      <div className="community-cards">
        {state.communityCards.map((card, i) => (
          <div key={i} className="card">{card}</div>
        ))}
      </div>

      {/* Player cards */}
      {state.players.map((player, index) => (
        <div 
          key={player.id}
          className={`player-seat ${index === state.activePlayerIndex ? 'active' : ''}`}
          style={getPositionStyle(index)}
        >
          <div className="player-info">
            <span>{player.name}</span>
            <span>${player.stack}</span>
            {index === state.dealerPosition && <div className="dealer-marker">D</div>}
          </div>
          <div className="player-cards">
            {player.cards.map((card, i) => (
              <div key={i} className="card">
                {player.isFolded ? '🂠' : card}
              </div>
            ))}
          </div>
        </div>
      ))}
      {
        state.winner && (
          <div  className={`player-seat`} style={{position: "absolute", bottom:"25%", left: "50%", padding: "2px"}}>
            <div style={{textAlign: "center"}}>WINNINGS</div>
            {
              state.players.map(p => (
                state.winner && (
                  <span>
                    {state.winner[p.name]}, 
                  </span>
                )
              ))
            }
          </div>
        )
      }
      <div style={{position: "absolute", bottom:"0px", left: "20px", color: "white"}}>
      {state.players.map((player, index) => (
        <div key={player.id}>
          <span>{player.name} </span>
          <span>Contribution: {player.isFolded?"x":state.currentRoundContributions[index]}</span>
        </div>
      ))}
      </div>
    </div>
  );
}

const getPositionStyle = (index: number) => {
  const positions = [
    { bottom: '-80px', left: '50%' },   // Bottom
    { top: '80px', left: '50%' },      // Top
    { top: '50%', left: '80px' },      // Left
    { top: '50%', right: '-80px' },     // Right
    { top: '80px', left: '80px' },     // Top-Left
    { top: '80px', right: '-80px' },    // Top-Right
  ];
  return positions[index % positions.length];
};