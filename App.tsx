
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RoundState, Guess, GameMode, Player } from './types';
import { CODE_LENGTH, COLORS, MAX_GUESSES } from './constants';
import Board from './components/Board';
import { generateSecretCode, checkGuess } from './services/gameLogic';
import { playSelectSound, playDeleteSound, playConfirmSound, playWinSound, playLoseSound, playNewGameSound, playTickSound } from './services/audioService';

const App: React.FC = () => {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [roundState, setRoundState] = useState<RoundState>(RoundState.Playing);
  const [activeRow, setActiveRow] = useState<number>(0);

  // New states for 2-player mode
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [isSetupPhase, setIsSetupPhase] = useState<boolean>(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [countdownSetting, setCountdownSetting] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [playerTimes, setPlayerTimes] = useState<{ [key in Player]?: number | null }>({});
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  // FIX: Use ReturnType<typeof setInterval> for the timer ref to ensure browser compatibility.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSecretCode(generateSecretCode(COLORS, CODE_LENGTH));
    setGuesses([]);
    setCurrentGuess([]);
    setRoundState(RoundState.Playing);
    setActiveRow(0);
    setGameMode('single');
    setIsSetupPhase(true);
    setCurrentPlayer(1);
    setCountdownSetting(0);
    setTimeLeft(0);
    setPlayerTimes({});
    setWinner(null);
    playNewGameSound();
  }, []);
  
  const startNextRound = useCallback(() => {
    setSecretCode(generateSecretCode(COLORS, CODE_LENGTH));
    setGuesses([]);
    setCurrentGuess([]);
    setRoundState(RoundState.Playing);
    setActiveRow(0);
    setCurrentPlayer(2);
    setTimeLeft(countdownSetting);
  }, [countdownSetting]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (roundState === RoundState.Won) {
      playWinSound();
    } else if (roundState === RoundState.Lost) {
      playLoseSound();
    }
  }, [roundState]);
  
  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerTimes(prev => ({ ...prev, [currentPlayer]: null }));
    setRoundState(RoundState.Lost);
  }, [currentPlayer]);

  useEffect(() => {
    if (gameMode === 'twoPlayer' && !isSetupPhase && roundState === RoundState.Playing) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, isSetupPhase, roundState, handleTimeUp]);
  
  useEffect(() => {
    const p1Result = playerTimes[1];
    const p2Result = playerTimes[2];
    
    if (gameMode === 'twoPlayer' && p1Result !== undefined && p2Result !== undefined) {
        if (p1Result === null && p2Result === null) setWinner('draw');
        else if (p1Result === null) setWinner(2);
        else if (p2Result === null) setWinner(1);
        else if (p1Result !== null && p2Result !== null) {
            if (p1Result < p2Result) setWinner(1);
            else if (p2Result < p1Result) setWinner(2);
            else setWinner('draw');
        }
    }
  }, [playerTimes, gameMode]);


  const handleColorSelect = (color: string) => {
    if (roundState !== RoundState.Playing || currentGuess.length >= CODE_LENGTH || (isSetupPhase && gameMode === 'twoPlayer')) {
      return;
    }
    setCurrentGuess(prev => [...prev, color]);
    playSelectSound();
  };

  const handleDelete = () => {
    if (roundState !== RoundState.Playing || currentGuess.length === 0 || (isSetupPhase && gameMode === 'twoPlayer')) {
      return;
    }
    setCurrentGuess(prev => prev.slice(0, -1));
    playDeleteSound();
  };
  
  const handleConfirm = () => {
    if (roundState !== RoundState.Playing || currentGuess.length < CODE_LENGTH) {
      return;
    }
    playConfirmSound();

    const feedback = checkGuess(currentGuess, secretCode);
    const newGuess: Guess = { combination: currentGuess, feedback };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    if (feedback.black === CODE_LENGTH) {
      setRoundState(RoundState.Won);
      if (gameMode === 'twoPlayer') {
        if (timerRef.current) clearInterval(timerRef.current);
        const timeTaken = countdownSetting - timeLeft + 1;
        setPlayerTimes(prev => ({ ...prev, [currentPlayer]: timeTaken }));
      }
    } else if (newGuesses.length >= MAX_GUESSES) {
      setRoundState(RoundState.Lost);
      if (gameMode === 'twoPlayer') {
        if (timerRef.current) clearInterval(timerRef.current);
        setPlayerTimes(prev => ({ ...prev, [currentPlayer]: null }));
      }
    } else {
      setActiveRow(prev => prev + 1);
      setCurrentGuess([]);
    }
  };

  const handleConfirmOrStart = () => {
    if (gameMode === 'twoPlayer' && isSetupPhase) {
        if (countdownSetting === 0) return;
        setIsSetupPhase(false);
        playConfirmSound();
    } else {
        if (gameMode === 'single' && isSetupPhase) {
            setIsSetupPhase(false);
        }
        handleConfirm();
    }
  };

  const handleModeToggle = () => {
    if (isSetupPhase) {
      setGameMode(prev => prev === 'single' ? 'twoPlayer' : 'single');
      playSelectSound();
    }
  };
  
  const handleCountdownChange = (increment: number) => {
    if (isSetupPhase && gameMode === 'twoPlayer') {
      playTickSound();
      setCountdownSetting(prev => {
        const newTime = Math.max(0, Math.min(990, prev + increment));
        setTimeLeft(newTime);
        return newTime;
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-['Orbitron',_sans-serif]">
      <Board
        guesses={guesses}
        currentGuess={currentGuess}
        activeRow={activeRow}
        secretCode={secretCode}
        roundState={roundState}
        onColorSelect={handleColorSelect}
        onDelete={handleDelete}
        onConfirm={handleConfirmOrStart}
        onNewGame={startNewGame}
        // 2-player props
        gameMode={gameMode}
        isSetupPhase={isSetupPhase}
        onModeToggle={handleModeToggle}
        onCountdownChange={handleCountdownChange}
        countdownValue={gameMode === 'twoPlayer' && isSetupPhase ? countdownSetting : timeLeft}
        onNextRound={startNextRound}
        currentPlayer={currentPlayer}
        playerTimes={playerTimes}
        winner={winner}
      />
    </div>
  );
};

export default App;
