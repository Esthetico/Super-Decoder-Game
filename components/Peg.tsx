
import React from 'react';

interface PegProps {
  color?: string;
  isSelectable?: boolean;
  onClick?: () => void;
  isGreyButton?: boolean;
  children?: React.ReactNode;
}

const Peg: React.FC<PegProps> = ({ color, isSelectable = false, onClick, isGreyButton = false, children }) => {
  const hexColorMap: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-orange-500': '#f97316',
    'bg-yellow-400': '#facc15',
    'bg-green-500': '#22c55e',
    'bg-sky-500': '#0ea5e9',
    'bg-purple-500': '#a855f7',
  };

  if (isGreyButton) {
    return (
        <button 
            onClick={onClick}
            className={`w-16 h-10 sm:w-20 sm:h-11 flex items-center justify-center rounded-md bg-gradient-to-b from-gray-700 to-gray-800 text-gray-300 font-bold text-xs sm:text-sm shadow-[0_4px_0_#222,0_5px_5px_#111] active:shadow-[0_2px_0_#222,0_3px_3px_#111] active:translate-y-px transition-all duration-100`}
        >
            {children}
        </button>
    );
  }
  
  if (!color) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-[#212121] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center">
         <div className="w-4 h-4 bg-black/50 rounded-full shadow-inner"></div>
      </div>
    );
  }

  const hex = hexColorMap[color] || '#ffffff';

  const pegClasses = "w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-[inset_0_2px_3px_rgba(0,0,0,0.5)] relative";
  const selectableClasses = isSelectable ? "cursor-pointer transform hover:scale-110 active:scale-95 transition-transform" : "";

  return (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-[#212121] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center">
      <button style={{'--peg-color': hex} as React.CSSProperties} onClick={onClick} className={`${pegClasses} ${color} ${selectableClasses}`} disabled={!isSelectable}>
        <div 
          className="absolute inset-0.5 rounded-full"
          style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), transparent 70%)` }}
        ></div>
         <div 
          className="absolute inset-0 rounded-full shadow-[0_0_8px_var(--peg-color),_inset_0_0_4px_var(--peg-color)]"
        ></div>
      </button>
    </div>
  );
};

export default Peg;
