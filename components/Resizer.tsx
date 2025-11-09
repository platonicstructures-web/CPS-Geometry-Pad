import React from 'react';

interface ResizerProps {
  onMouseDown: (event: React.MouseEvent) => void;
}

const Resizer: React.FC<ResizerProps> = ({ onMouseDown }) => {
  return (
    <div
      className="w-1.5 h-full cursor-col-resize bg-gray-700 hover:bg-cyan-500 transition-colors duration-200 flex-shrink-0"
      onMouseDown={onMouseDown}
      style={{ touchAction: 'none' }} // Prevent scrolling on touch devices
    />
  );
};

export default Resizer;
