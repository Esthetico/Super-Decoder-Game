
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RoundState, Guess, GameMode, Player } from './types';
import { CODE_LENGTH, COLORS, MAX_GUESSES } from './constants';
import Board from './components/Board';
import { generateSecretCode, checkGuess } from './services/gameLogic';
import { playSelectSound, playDeleteSound, playConfirmSound, playWinSound, playLoseSound, playNewGameSound, playTickSound, initAudio, setMusicVolume, getAnalyser } from './services/audioService';


const VolumeControl: React.FC<{ onVolumeChange: (volume: number) => void }> = ({ onVolumeChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [volume, setVolume] = useState(0.2);
    const lastVolumeRef = useRef(0.2);
    const sliderRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onVolumeChange(volume);
    }, [volume, onVolumeChange]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0) {
            lastVolumeRef.current = newVolume;
        }
    };

    const handleIconClick = () => {
        if (volume > 0) {
            // Mute by setting volume to 0
            setVolume(0);
        } else {
            // Unmute by restoring the last known volume
            const volumeToRestore = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5;
            setVolume(volumeToRestore);
        }
    };

    const getVolumeIcon = () => {
        if (volume === 0) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m-4 0l4 4" /></svg>
            );
        }
        if (volume < 0.5) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        );
    };

    return (
        <div
            className="absolute top-1/2 left-full -translate-y-1/2 ml-4 sm:ml-6 z-30 flex items-center p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 ease-in-out"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{ 
              width: isExpanded ? '180px' : '56px',
              height: '56px'
            }}
        >
            <button
                onClick={handleIconClick}
                className="text-white focus:outline-none flex-shrink-0 w-10 h-10 flex items-center justify-center"
                aria-label={volume > 0 ? 'Mute music' : 'Unmute music'}
            >
                {getVolumeIcon()}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-24 ml-2' : 'w-0'}`}>
                <input
                    ref={sliderRef}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/30"
                    aria-label="Music volume"
                />
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [roundState, setRoundState] = useState<RoundState>(RoundState.Playing);
  const [activeRow, setActiveRow] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [isSetupPhase, setIsSetupPhase] = useState<boolean>(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [countdownSetting, setCountdownSetting] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [playerTimes, setPlayerTimes] = useState<{ [key in Player]?: number | null }>({});
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const volumeRef = useRef(0.2);
  const animationFrameRef = useRef<number>();
  
  const handleUserInteraction = useCallback(() => {
    if (!isAudioInitialized) {
        initAudio();
        setIsAudioInitialized(true);
    }
  }, [isAudioInitialized]);


  const startNewGame = useCallback(() => {
    handleUserInteraction();
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
  }, [handleUserInteraction]);
  
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

  useEffect(() => {
    if (!isAudioInitialized) return;

    const analyser = getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const blobElements = [
        { el: document.getElementById('blob-1'), speedX: 0.2, speedY: 0.15 },
        { el: document.getElementById('blob-2'), speedX: -0.15, speedY: 0.2 },
        { el: document.getElementById('blob-3'), speedX: 0.1, speedY: -0.25 },
    ];

    const animate = (time: number) => {
        analyser.getByteFrequencyData(dataArray);
        
        const bass = dataArray.slice(0, 5).reduce((sum, value) => sum + value, 0) / 5;
        const normalizedBass = bass / 255;
        
        const scale = volumeRef.current > 0 ? 1 + normalizedBass * 0.15 : 1;

        blobElements.forEach((blob, index) => {
            if (blob.el) {
                const t = time * 0.0005;
                const x = Math.sin(t * blob.speedX + index * 2) * 60;
                const y = Math.cos(t * blob.speedY + index * 2) * 60;
                blob.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            }
        });

        animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };
  }, [isAudioInitialized]);


  const handleColorSelect = (color: string) => {
    handleUserInteraction();
    if (roundState !== RoundState.Playing || currentGuess.length >= CODE_LENGTH || (isSetupPhase && gameMode === 'twoPlayer')) {
      return;
    }
    setCurrentGuess(prev => [...prev, color]);
    playSelectSound();
  };

  const handleDelete = () => {
    handleUserInteraction();
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
    handleUserInteraction();
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
    handleUserInteraction();
    if (isSetupPhase) {
      setGameMode(prev => prev === 'single' ? 'twoPlayer' : 'single');
      playSelectSound();
    }
  };
  
  const handleCountdownChange = (increment: number) => {
    handleUserInteraction();
    if (isSetupPhase && gameMode === 'twoPlayer') {
      playTickSound();
      setCountdownSetting(prev => {
        const newTime = Math.max(0, Math.min(990, prev + increment));
        setTimeLeft(newTime);
        return newTime;
      });
    }
  };
  
  const handleVolumeChange = useCallback((volume: number) => {
      volumeRef.current = volume;
      setMusicVolume(volume);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-['Orbitron',_sans-serif]" onClick={handleUserInteraction}>
      <div className="relative">
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
        <VolumeControl onVolumeChange={handleVolumeChange} />
      </div>
    </div>
  );
};

export default App;
