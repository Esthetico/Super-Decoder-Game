
import React from 'react';
import Peg from './Peg';
import { GameMode } from '../types';

interface ControlsProps {
  onUndo: () => void;
  onSubmit: () => void;
  isSetupPhase: boolean;
  gameMode: GameMode;
  isSubmitDisabled?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onUndo, onSubmit, isSetupPhase, gameMode, isSubmitDisabled = false }) => {
  const confirmText = gameMode === 'twoPlayer' && isSetupPhase ? 'START' : 'CONFIRM';
  return (
    <div className="flex justify-center items-center space-x-4 pt-3">
        <Peg isGreyButton={true} onClick={onUndo}>DELETE</Peg>
        <Peg isGreyButton={true} onClick={onSubmit} disabled={isSubmitDisabled}>{confirmText}</Peg>
    </div>
  );
};

export default Controls;
