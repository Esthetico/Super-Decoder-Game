
import React from 'react';
import { GameState } from '../types';

interface GameStatusModalProps {
  gameState: GameState;
  onNewGame: () => void;
}

const GameStatusModal: React.FC<GameStatusModalProps> = ({ gameState, onNewGame }) => {
  const isWin = gameState === GameState.Won;
  const message = isWin ? "You cracked the code!" : "Game Over!";
  const messageColor = isWin ? "text-green-300" : "text-red-400";

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-2xl">
      <div className="text-center p-8">
        <h2 className={`text-5xl font-extrabold ${messageColor} mb-6`} style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>
          {message}
        </h2>
        <button
          onClick={onNewGame}
          className="px-8 py-4 text-2xl font-bold text-white bg-blue-600 border-b-4 border-blue-800 rounded-lg shadow-lg hover:bg-blue-500 transition-all duration-150 transform active:translate-y-px active:border-b-2"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameStatusModal;
