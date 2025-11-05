
import React from 'react';
import Peg from './Peg';

interface ControlsProps {
  onUndo: () => void;
  onSubmit: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onUndo, onSubmit }) => {
  return (
    <div className="flex justify-center items-center space-x-4 pt-3">
        <Peg isGreyButton={true} onClick={onUndo}>DELETE</Peg>
        <Peg isGreyButton={true} onClick={onSubmit}>CONFIRM</Peg>
    </div>
  );
};

export default Controls;
