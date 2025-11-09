import React, { useState } from 'react';
import { PDB_FILES_DIALOG } from '../constants';

interface PdbSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const PdbSelectionDialog: React.FC<PdbSelectionDialogProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-700">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="dialog-title" className="text-xl font-bold text-cyan-400">Select Platonic Structure from Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl" aria-label="Close dialog">&times;</button>
        </header>
        <div className="p-4 overflow-y-auto">
          <table className="w-full text-left table-fixed">
            <thead className="sticky top-0 bg-gray-800 z-10">
              <tr className="border-b border-gray-600">
                <th className="py-2 px-2 text-sm font-semibold text-gray-300 w-12 text-center"></th>
                <th className="py-2 px-2 text-sm font-semibold text-gray-300 w-1/3">Name</th>
                <th className="py-2 px-2 text-sm font-semibold text-gray-300">Description</th>
              </tr>
            </thead>
            <tbody>
              {PDB_FILES_DIALOG.map((pdb, index) => {
                //const url = `https://platonicstructures.com/CPS_Geometry_Library/${pdb.id}.pdb`;
                const url = `public/${pdb.id}.pdb`;
                return (
                  <tr 
                    key={`${pdb.id}-${index}`} 
                    className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedUrl(url)}
                  >
                    <td className="py-1 px-2 align-middle text-center">
                      <input
                        type="radio"
                        name="pdb-selection"
                        value={url}
                        checked={selectedUrl === url}
                        onChange={(e) => setSelectedUrl(e.target.value)}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 cursor-pointer"
                        aria-label={`Select ${pdb.name}`}
                      />
                    </td>
                    <td className="py-1 px-2 align-middle">
                      <span className="font-semibold text-white text-sm">{pdb.name}</span>
                    </td>
                    <td className="py-1 px-2 text-xs text-gray-400 align-middle">{pdb.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className="p-4 border-t border-gray-700 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded-md font-medium transition-colors duration-200">
            Close
          </button>
          <button 
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="bg-cyan-600 text-white hover:bg-cyan-500 px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Copy URL
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PdbSelectionDialog;