
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RoundState, Guess, GameMode, Player } from '../types';
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
  roundState: RoundState;
  onColorSelect: (color: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  onNewGame: () => void;
  // 2-player props
  gameMode: GameMode;
  isSetupPhase: boolean;
  onModeToggle: () => void;
  onCountdownChange: (increment: number) => void;
  countdownValue: number;
  onNextRound: () => void;
  currentPlayer: Player;
  playerTimes: { [key in Player]?: number | null };
  winner: Player | 'draw' | null;
}

const TopLights: React.FC<Pick<BoardProps, 'gameMode' | 'onModeToggle' | 'isSetupPhase' | 'winner' | 'roundState'>> = ({ gameMode, onModeToggle, isSetupPhase, winner, roundState }) => {
  const isSinglePlayerWin = gameMode === 'single' && roundState === 'won';
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex justify-center h-12">
      <div 
        className={`relative flex items-end justify-center h-10 ${isSetupPhase ? 'cursor-pointer' : ''}`}
        onClick={isSetupPhase ? onModeToggle : undefined}
        title={isSetupPhase ? 'Toggle 2-Player Mode' : ''}
      >
        <div className={`absolute bottom-0 h-4 rounded-b-md bg-gray-700 transition-all ${gameMode === 'single' ? 'w-14' : 'w-24'}`}></div>
        <div className="relative z-10 flex gap-2">
          {gameMode === 'twoPlayer' && (
            <div className={`w-10 h-10 bg-red-400 rounded-md border-2 border-red-500 shadow-lg ${winner === 2 ? 'animate-pulse' : ''}`} style={winner === 2 ? {boxShadow: '0 0 20px 10px rgba(248, 113, 113, 0.7)'} : {}}>
               <div className="absolute inset-0.5 bg-red-300/50 rounded"></div>
            </div>
          )}
          <div className={`w-10 h-10 bg-green-400 rounded-md border-2 border-green-500 shadow-lg ${(winner === 1 || isSinglePlayerWin) ? 'animate-pulse' : ''}`} style={(winner === 1 || isSinglePlayerWin) ? {boxShadow: '0 0 20px 10px rgba(74, 222, 128, 0.7)'} : {}}>
             <div className="absolute inset-0.5 bg-green-300/50 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};


const DigitalDisplay: React.FC<{ value: number }> = ({ value }) => {
    const text = String(value).padStart(3, '0');
    return (
        <div className="bg-black/80 p-2 rounded-md shadow-inner">
            <p className="font-['Chakra_Petch',_sans-serif] text-4xl sm:text-5xl text-red-500/90" style={{ textShadow: '0 0 5px #ef4444' }}>
                {text}
            </p>
        </div>
    )
}

const Board: React.FC<BoardProps> = (props) => {
  const {
    guesses, currentGuess, activeRow, secretCode, roundState, onColorSelect, onDelete, onConfirm, onNewGame,
    gameMode, isSetupPhase, onModeToggle, onCountdownChange, countdownValue, onNextRound, currentPlayer, playerTimes, winner
  } = props;

  const knobRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const knobCenterRef = useRef<{ x: number; y: number } | null>(null);
  const rotationTracker = useRef({ startAngle: 0, lastSentAngle: 0 });

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!knobCenterRef.current) return 0;
    const { x, y } = knobCenterRef.current;
    return Math.atan2(y - clientY, clientX - x) * (180 / Math.PI);
  }, []);

  const handleKnobInteractionStart = useCallback((clientX: number, clientY: number) => {
    if (!isSetupPhase || gameMode !== 'twoPlayer') return;

    const knob = knobRef.current;
    if (!knob) return;
    
    document.body.style.overflow = 'hidden'; // Prevent scroll on mobile

    const { top, left, width, height } = knob.getBoundingClientRect();
    knobCenterRef.current = { x: left + width / 2, y: top + height / 2 };

    const startAngle = getAngle(clientX, clientY);
    
    rotationTracker.current.startAngle = startAngle - rotation;
    rotationTracker.current.lastSentAngle = rotation;

    const handleInteractionMove = (moveClientX: number, moveClientY: number) => {
        const currentAngle = getAngle(moveClientX, moveClientY);
        const newRotation = currentAngle - rotationTracker.current.startAngle;
        setRotation(newRotation);

        const ROTATION_SENSITIVITY = 15;
        const rotationDiff = newRotation - rotationTracker.current.lastSentAngle;

        if (Math.abs(rotationDiff) >= ROTATION_SENSITIVITY) {
            const ticks = Math.floor(rotationDiff / ROTATION_SENSITIVITY);
            onCountdownChange(-ticks * 10);
            rotationTracker.current.lastSentAngle += ticks * ROTATION_SENSITIVITY;
        }
    };

    const handleMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleInteractionEnd = () => {
        document.body.style.overflow = '';
        knobCenterRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleInteractionEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleInteractionEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
  }, [isSetupPhase, gameMode, rotation, onCountdownChange, getAngle]);
  
  const handleKnobMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleKnobInteractionStart(e.clientX, e.clientY);
  };

  const handleKnobTouchStart = (e: React.TouchEvent) => {
    handleKnobInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const guessRows = Array.from({ length: MAX_GUESSES }).map((_, i) => {
    const guessData = guesses[i];
    const isCurrentRow = i === activeRow;
    return (
      <GuessRow
        key={i}
        guess={guessData?.combination}
        feedback={guessData?.feedback}
        currentGuess={isCurrentRow ? currentGuess : undefined}
        isActive={isCurrentRow && roundState === RoundState.Playing}
      />
    );
  });

  const shouldShowModal = (roundState !== RoundState.Playing && winner === null) || (winner !== null);
  const isStartDisabled = isSetupPhase && gameMode === 'twoPlayer' && countdownValue === 0;
  const canToggleMode = isSetupPhase && currentGuess.length === 0;
  
  return (
    <div className="relative font-sans">
      {shouldShowModal && (
        <GameStatusModal 
          roundState={roundState} 
          onNewGame={onNewGame} 
          gameMode={gameMode}
          winner={winner}
          onNextRound={onNextRound}
          currentPlayer={currentPlayer}
        />
      )}
      
      <TopLights gameMode={gameMode} onModeToggle={onModeToggle} isSetupPhase={canToggleMode} winner={winner} roundState={roundState} />
      
      {/* Main Casing */}
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#98ce3d] to-[#78a52e] p-2 sm:p-3 rounded-2xl shadow-[0_10px_0_#54731f,0_15px_25px_rgba(0,0,0,0.6)]">
        <div className="bg-[#414141] p-1 sm:p-2 rounded-xl shadow-inner">
            <div className="bg-[#2d2d2d] p-2 sm:p-3 rounded-lg shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)]">
                {/* Screen Area */}
                <SecretCodeDisplay secretCode={secretCode} revealed={roundState !== RoundState.Playing && gameMode === 'single'} />
                <div className="my-1 h-[2px] bg-black/30" />
                <div className="grid gap-2">
                  {guessRows}
                </div>
                 <Controls onUndo={onDelete} onSubmit={onConfirm} isSetupPhase={isSetupPhase} gameMode={gameMode} isSubmitDisabled={isStartDisabled} />
                <div className="my-2 h-[2px] bg-black/30" />
                <div className="p-1.5 bg-black/20 rounded-lg shadow-[inset_0_3px_8px_rgba(0,0,0,0.5)]">
                    <ColorPalette onColorSelect={onColorSelect} disabled={isSetupPhase && gameMode === 'twoPlayer'} />
                </div>
            </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-2 sm:mt-3 p-1 sm:p-2 flex items-center justify-between gap-3">
             <p className="flex-1 text-center text-3xl font-black text-gray-200/90" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.3)'}}>
                GIIKER
            </p>

            <div className="flex-1 flex justify-center">
                <DigitalDisplay value={gameMode === 'twoPlayer' ? countdownValue : (activeRow + 1 > MAX_GUESSES ? MAX_GUESSES : activeRow + 1)} />
            </div>

            <div className="flex-1 flex justify-end">
                <div 
                  ref={knobRef}
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full shadow-[0_5px_0_#b45309,0_8px_10px_rgba(0,0,0,0.5)] border-4 border-orange-600 active:shadow-[0_2px_0_#b45309] active:translate-y-px transition-all select-none ${isSetupPhase && gameMode === 'twoPlayer' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onMouseDown={handleKnobMouseDown}
                  onTouchStart={handleKnobTouchStart}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="w-full h-full rounded-full" style={{backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.1)_0%_5%,_transparent_5%_10%)'}}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
