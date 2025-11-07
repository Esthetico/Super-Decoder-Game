import React from 'react';
import { RoundState, GameMode, Player } from '../types';

interface GameStatusModalProps {
  roundState: RoundState;
  onNewGame: () => void;
  gameMode: GameMode;
  winner: Player | 'draw' | null;
  onNextRound: () => void;
  currentPlayer: Player;
}

const ModalButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-48 py-3 text-xl font-bold text-gray-200 rounded-lg bg-gradient-to-b from-gray-700 to-gray-800 shadow-[0_5px_0_#2d2d2d,0_6px_8px_rgba(0,0,0,0.5)] transition-all duration-100 active:shadow-[0_2px_0_#2d2d2d] active:translate-y-1 hover:from-gray-600 ${className}`}
  >
    {children}
  </button>
);

const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-2xl p-4">
    <div className="w-full max-w-sm bg-gray-900/40 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-6">
      {children}
    </div>
  </div>
);


const GameStatusModal: React.FC<GameStatusModalProps> = ({ roundState, onNewGame, gameMode, winner, onNextRound, currentPlayer }) => {
  
  if (winner !== null) {
    const isDraw = winner === 'draw';
    const message = isDraw ? "It's a Draw!" : `Player ${winner} Wins!`;
    const messageColor = isDraw ? "text-yellow-400" : (winner === 1 ? "text-green-400" : "text-red-400");
    const shadowColor = isDraw ? '#facc15' : (winner === 1 ? '#4ade80' : '#f87171');
    
    return (
      <ModalContainer>
        <h2 className={`text-4xl sm:text-5xl font-extrabold ${messageColor}`} style={{ textShadow: `0 0 10px ${shadowColor}, 2px 2px 4px rgba(0,0,0,0.7)` }}>
          {message}
        </h2>
        <ModalButton onClick={onNewGame}>New Game</ModalButton>
      </ModalContainer>
    );
  }

  if (gameMode === 'twoPlayer' && roundState !== RoundState.Playing && currentPlayer === 1) {
     return (
      <ModalContainer>
        <h2 className={`text-3xl sm:text-4xl font-extrabold text-gray-200`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
          Player 2's Turn
        </h2>
        <ModalButton onClick={onNextRound} className="from-purple-700 to-purple-900 shadow-[0_5px_0_#2c1145,0_6px_8px_rgba(0,0,0,0.5)] hover:from-purple-600">
          Start Round
        </ModalButton>
      </ModalContainer>
    );
  }

  // Default single player modal
  const isWin = roundState === RoundState.Won;
  const message = isWin ? "You cracked the code!" : "Game Over!";
  const messageColor = isWin ? "text-green-400" : "text-red-400";
  const shadowColor = isWin ? '#4ade80' : '#f87171';


  return (
    <ModalContainer>
        <h2 className={`text-4xl sm:text-5xl font-extrabold ${messageColor}`} style={{ textShadow: `0 0 10px ${shadowColor}, 2px 2px 4px rgba(0,0,0,0.7)` }}>
          {message}
        </h2>
        <ModalButton onClick={onNewGame}>New Game</ModalButton>
    </ModalContainer>
  );
};

export default GameStatusModal;