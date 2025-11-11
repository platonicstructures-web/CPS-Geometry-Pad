

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  size?: 'default' | 'fullscreen';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, theme = 'dark', size = 'default' }) => {
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  const themeClasses = {
    dark: {
      container: 'bg-slate-700 text-white',
      closeButton: 'bg-white/80 text-slate-800 hover:bg-white hover:text-black',
    },
    light: {
      container: 'bg-white text-gray-800',
      closeButton: 'bg-slate-800/80 text-gray-200 hover:bg-slate-900 hover:text-white',
    },
  };

  const currentTheme = themeClasses[theme];
  
  const backdropStyles = {
    default: 'flex items-center justify-center p-4',
    fullscreen: ''
  };

  const containerStyles = {
    default: 'w-full max-w-5xl h-full max-h-[90vh] rounded-lg',
    fullscreen: 'w-full h-full rounded-none'
  };

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={`fixed inset-0 z-50 bg-black bg-opacity-75 animate-fade-in ${backdropStyles[size]}`}
      onClick={onClose} // Close on backdrop click
    >
      <div
        className={`relative flex flex-col shadow-2xl overflow-hidden ${containerStyles[size]} ${currentTheme.container}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex justify-between items-center p-3 border-b border-slate-600 shrink-0">
            <h2 id="modal-title" className="text-xl font-bold text-sky-300">
            {title}
            </h2>
            <button
            onClick={onClose}
            aria-label="Close modal"
            className={`p-2 rounded-full transition-colors ${currentTheme.closeButton}`}
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
                />
            </svg>
            </button>
        </header>

        <main className="flex-grow overflow-auto">
          {children}
        </main>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;