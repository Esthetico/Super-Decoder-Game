
import React from 'react';
import { COLORS } from '../constants';
import Peg from './Peg';

interface ColorPaletteProps {
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ onColorSelect, disabled = false }) => {
  const handleSelect = (color: string) => {
    if (!disabled) {
      onColorSelect(color);
    }
  }
  return (
    <div className={`flex justify-center items-center space-x-1 sm:space-x-2 ${disabled ? 'opacity-50' : ''}`}>
    {COLORS.map(color => (
        <Peg key={color} color={color} isSelectable={!disabled} onClick={() => handleSelect(color)} />
    ))}
    </div>
  );
};

export default ColorPalette;
