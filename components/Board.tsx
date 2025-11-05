
import React from 'react';
import { GameState, Guess } from '../types';
import { MAX_GUESSES } from '../constants';
import GuessRow from './GuessRow';
import ColorPalette from './ColorPalette';
import Controls from './Controls';
import SecretCodeDisplay from './SecretCodeDisplay';
import GameStatusModal from './GameStatusModal';

interface BoardProps {
  guesses: Guess[];
  currentGuess: string[];
  activeRow: number;
  secretCode: string[];
  gameState: GameState;
  onColorSelect: (color: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  onNewGame: () => void;
}

const DigitalDisplay: React.FC<{ value: number }> = ({ value }) => {
    const text = String(value).padStart(3, '0');
    return (
        <div className="bg-black/80 p-2 rounded-md shadow-inner">
            <p className="text-3xl sm:text-4xl text-red-500/90" style={{ textShadow: '0 0 5px #ef4444' }}>
                {text}
            </p>
        </div>
    )
}

const Board: React.FC<BoardProps> = ({
  guesses,
  currentGuess,
  activeRow,
  secretCode,
  gameState,
  onColorSelect,
  onDelete,
  onConfirm,
  onNewGame
}) => {
  const guessRows = Array.from({ length: MAX_GUESSES }).map((_, i) => {
    const guessData = guesses[i];
    const isCurrentRow = i === activeRow;
    return (
      <GuessRow
        key={i}
        guess={guessData?.combination}
        feedback={guessData?.feedback}
        currentGuess={isCurrentRow ? currentGuess : undefined}
        isActive={isCurrentRow && gameState === GameState.Playing}
      />
    );
  });

  return (
    <div className="relative font-sans">
      {gameState !== GameState.Playing && (
        <GameStatusModal gameState={gameState} onNewGame={onNewGame} />
      )}
      
      {/* Top light */}
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-green-400 rounded-md border-2 border-green-500 shadow-lg transition-all duration-500 ${gameState === GameState.Won ? 'animate-pulse' : ''}`} style={gameState === GameState.Won ? {boxShadow: '0 0 20px 10px rgba(74, 222, 128, 0.7)'} : {}}>
        <div className="absolute inset-0.5 bg-green-300/50 rounded"></div>
      </div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-4 bg-gray-700 rounded-b-md"></div>

      {/* Main Casing */}
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#4a4a4a] to-[#2b2b2b] p-2 sm:p-3 rounded-2xl shadow-[0_10px_0_#1a1a1a,0_15px_25px_rgba(0,0,0,0.6)]">
        <div className="bg-[#414141] p-1 sm:p-2 rounded-xl shadow-inner">
            <div className="bg-[#2d2d2d] p-2 sm:p-3 rounded-lg shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)]">
                {/* Screen Area */}
                <SecretCodeDisplay secretCode={secretCode} revealed={gameState !== GameState.Playing} />
                <div className="my-1 h-[2px] bg-black/30" />
                <div className="space-y-1">
                  {guessRows}
                </div>
                 <Controls onUndo={onDelete} onSubmit={onConfirm} />
                <div className="my-2 h-[2px] bg-black/30" />
                <div className="p-1.5 bg-black/20 rounded-lg shadow-[inset_0_3px_8px_rgba(0,0,0,0.5)]">
                    <ColorPalette onColorSelect={onColorSelect} />
                </div>
            </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-2 sm:mt-3 p-1 sm:p-2 flex items-center justify-between gap-3">
             <p className="flex-1 text-center text-3xl font-black text-gray-800/60" style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.2)'}}>
                GIIKER
            </p>

            <div className="flex-1 flex justify-center">
                <DigitalDisplay value={activeRow + 1 > MAX_GUESSES ? MAX_GUESSES : activeRow + 1} />
            </div>

            <div className="flex-1 flex justify-end">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full shadow-[0_5px_0_#b45309,0_8px_10px_rgba(0,0,0,0.5)] border-4 border-orange-600 active:shadow-[0_2px_0_#b45309] active:translate-y-px transition-all">
                    <div className="w-full h-full rounded-full" style={{backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.1)_0%_5%,_transparent_5%_10%)'}}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
