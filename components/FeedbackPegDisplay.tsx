
import React from 'react';
import { Feedback } from '../types';
import { CODE_LENGTH } from '../constants';

interface FeedbackPegDisplayProps {
  feedback?: Feedback;
}

const FeedbackPeg: React.FC<{type: 'black' | 'white' | 'empty'}> = ({ type }) => {
    const styles = {
        black: 'bg-green-500 shadow-[0_0_2px_#fff,0_0_4px_#22c55e,0_0_6px_#22c55e]',
        white: 'bg-yellow-400 shadow-[0_0_2px_#fff,0_0_3px_#facc15,0_0_5px_#facc15]',
        empty: 'bg-[#212121] shadow-inner'
    }[type];
    return <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${styles} transition-all duration-300`}></div>
}

const FeedbackPegDisplay: React.FC<FeedbackPegDisplayProps> = ({ feedback }) => {
  const pegs = [];
  if (feedback) {
    for (let i = 0; i < feedback.black; i++) pegs.push('black');
    for (let i = 0; i < feedback.white; i++) pegs.push('white');
  }
  
  while (pegs.length < CODE_LENGTH) {
    pegs.push('empty');
  }
  
  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-black/50 rounded-md shadow-inner">
      {pegs.map((type, i) => <FeedbackPeg key={i} type={type as 'black' | 'white' | 'empty'} />)}
    </div>
  );
};

export default FeedbackPegDisplay;
