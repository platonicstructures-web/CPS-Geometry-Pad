
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          CPS Geometry Pad
        </h1>
        <p className="text-gray-400 mt-1">
          A dynamic platform for exploring and understanding Platonic Structures and their Stereographic Projections. Visit:{' '}
          <a 
            href="https://www.platonicstructures.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            www.platonicstructures.com
          </a>
        </p>
      </div>
    </header>
  );
};

export default Header;