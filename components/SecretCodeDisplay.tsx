
import React from 'react';
import { CODE_LENGTH } from '../constants';
import Peg from './Peg';

interface SecretCodeDisplayProps {
  secretCode: string[];
  revealed: boolean;
}

const SecretCodeDisplay: React.FC<SecretCodeDisplayProps> = ({ secretCode, revealed }) => {
  return (
    <div className="relative h-14 flex items-center justify-between px-3 bg-black/30 rounded-t-lg shadow-inner">
      <h2 className="text-gray-400 font-black text-sm tracking-widest">SECRET CODE</h2>
      <div className="flex items-center space-x-2">
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          revealed ? <Peg key={i} color={secretCode[i]} /> : <Peg key={i} />
        ))}
      </div>
    </div>
  );
};

export default SecretCodeDisplay;
