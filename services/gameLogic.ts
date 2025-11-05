
import { Feedback } from '../types';
import { CODE_LENGTH } from '../constants';

export const generateSecretCode = (colors: string[], length: number): string[] => {
  const shuffled = [...colors].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, length);
};

export const checkGuess = (guess: string[], secret: string[]): Feedback => {
  let black = 0;
  let white = 0;
  
  const secretCopy = [...secret];
  const guessCopy = [...guess];

  // First pass for black pegs (correct color, correct position)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      black++;
      secretCopy[i] = 'used_secret';
      guessCopy[i] = 'used_guess';
    }
  }

  // Second pass for white pegs (correct color, wrong position)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== 'used_guess') {
      const secretIndex = secretCopy.indexOf(guessCopy[i]);
      if (secretIndex !== -1) {
        white++;
        secretCopy[secretIndex] = 'used_secret';
      }
    }
  }

  return { black, white };
};
