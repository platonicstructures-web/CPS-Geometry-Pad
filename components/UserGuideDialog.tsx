
import React from 'react';
import { getStyledUserGuideContent } from './UserGuideContent';

interface UserGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideDialog: React.FC<UserGuideDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="user-guide-dialog-title"
      onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-700 text-gray-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
          <h2 id="user-guide-dialog-title" className="text-xl font-bold text-cyan-400">Platonic Structures Geometry Pad - User Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl" aria-label="Close dialog">&times;</button>
        </header>
        <div 
          className="p-6 overflow-y-auto"
          style={{ lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: getStyledUserGuideContent() }}
        />
        <footer className="p-4 border-t border-gray-700 flex justify-end gap-4 shrink-0">
          <button 
            onClick={onClose} 
            className="bg-cyan-600 text-white hover:bg-cyan-500 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UserGuideDialog;
