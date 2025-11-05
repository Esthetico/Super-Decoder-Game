
import React from 'react';
import { COLORS } from '../constants';
import Peg from './Peg';

interface ColorPaletteProps {
  onColorSelect: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ onColorSelect }) => {
  return (
    <div className="flex justify-center items-center space-x-1 sm:space-x-2">
    {COLORS.map(color => (
        <Peg key={color} color={color} isSelectable={true} onClick={() => onColorSelect(color)} />
    ))}
    </div>
  );
};

export default ColorPalette;
