
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Guess } from './types';
import { CODE_LENGTH, COLORS, MAX_GUESSES } from './constants';
import Board from './components/Board';
import { generateSecretCode, checkGuess } from './services/gameLogic';

const App: React.FC = () => {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [activeRow, setActiveRow] = useState<number>(0);

  const startNewGame = useCallback(() => {
    setSecretCode(generateSecretCode(COLORS, CODE_LENGTH));
    setGuesses([]);
    setCurrentGuess([]);
    setGameState(GameState.Playing);
    setActiveRow(0);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleColorSelect = (color: string) => {
    if (gameState !== GameState.Playing || currentGuess.length >= CODE_LENGTH) {
      return;
    }
    setCurrentGuess(prev => [...prev, color]);
  };

  const handleDelete = () => {
    if (gameState !== GameState.Playing || currentGuess.length === 0) {
      return;
    }
    setCurrentGuess(prev => prev.slice(0, -1));
  };
  
  const handleConfirm = () => {
    if (gameState !== GameState.Playing || currentGuess.length < CODE_LENGTH) {
      return;
    }

    const feedback = checkGuess(currentGuess, secretCode);
    const newGuess: Guess = { combination: currentGuess, feedback };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    if (feedback.black === CODE_LENGTH) {
      setGameState(GameState.Won);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState(GameState.Lost);
    } else {
      setActiveRow(prev => prev + 1);
      setCurrentGuess([]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-['Orbitron',_sans-serif]">
      <Board
        guesses={guesses}
        currentGuess={currentGuess}
        activeRow={activeRow}
        secretCode={secretCode}
        gameState={gameState}
        onColorSelect={handleColorSelect}
        onDelete={handleDelete}
        onConfirm={handleConfirm}
        onNewGame={startNewGame}
      />
    </div>
  );
};

export default App;
