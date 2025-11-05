
import React from 'react';
import { Feedback } from '../types';
import { CODE_LENGTH } from '../constants';
import Peg from './Peg';
import FeedbackPegDisplay from './FeedbackPegDisplay';

interface GuessRowProps {
  guess?: string[];
  feedback?: Feedback;
  currentGuess?: string[];
  isActive: boolean;
}

const GuessRow: React.FC<GuessRowProps> = ({ guess, feedback, currentGuess, isActive }) => {
  const pegsToDisplay = guess || currentGuess || [];
  
  const pegHoles = Array.from({ length: CODE_LENGTH }).map((_, i) => {
    const color = pegsToDisplay[i];
    return color ? <Peg key={i} color={color} /> : <Peg key={i} />;
  });

  return (
    <div className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all duration-300`}>
      <div className="flex items-center space-x-2">
        {pegHoles}
      </div>
      <FeedbackPegDisplay feedback={feedback} />
    </div>
  );
};

export default GuessRow;
