
import React from 'react';
import { PDB_FILES } from '../constants';
import { DisplayStyle, ColorScheme, MoleculeMetadata } from '../types';

interface ControlsProps {
  selectedPdbId: string | null;
  onPdbIdChange: (id: string) => void;
  onLocalFileLoad: (data: string, name: string) => void;
  localPdbName: string | null;
  selectedStyle: DisplayStyle;
  onStyleChange: (style: DisplayStyle) => void;
  selectedColorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  atomScale: number;
  onAtomScaleChange: (scale: number) => void;
  stickRadius: number;
  onStickRadiusChange: (radius: number) => void;
  bondScale: number;
  onBondScaleChange: (scale: number) => void;
  metadata: MoleculeMetadata | null;
}

const Controls: React.FC<ControlsProps> = ({
  selectedPdbId,
  onPdbIdChange,
  onLocalFileLoad,
  localPdbName,
  selectedStyle,
  onStyleChange,
  selectedColorScheme,
  onColorSchemeChange,
  atomScale,
  onAtomScaleChange,
  stickRadius,
  onStickRadiusChange,
  bondScale,
  onBondScaleChange,
  metadata,
}) => {
  const displayStyles: { style: DisplayStyle; label: string }[] = [
    { style: 'line', label: 'Lines' },
    { style: 'stick', label: 'Sticks' },
    { style: 'sphere', label: 'Spheres' },
    { style: 'ball and stick', label: 'Ball & Stick' },
    { style: 'hidden', label: 'Hide' },
  ];
  const colorSchemes: { scheme: ColorScheme; label: string }[] = [
    { scheme: 'spectrum', label: 'Spectrum' },
    { scheme: 'element', label: 'Element (CPK)' },
    { scheme: 'residue', label: 'Residue' },
  ];
  const selectedPdb = PDB_FILES.find(p => p.id === selectedPdbId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onLocalFileLoad(content, file.name);
        } else {
          console.error("Failed to read file as text.");
        }
      };
      reader.onerror = () => {
        console.error("Error reading file.");
      }
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
      <div className="mb-2">
        <label htmlFor="pdb-select" className="block text-lg font-semibold mb-2 text-cyan-400">
          Select Platonic Structure
        </label>
        <select
          id="pdb-select"
          value={selectedPdbId ?? ''}
          onChange={(e) => onPdbIdChange(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition mb-2"
        >
          <optgroup label="Load from RCSB PDB">
            {PDB_FILES.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name} ({file.id})
              </option>
            ))}
          </optgroup>
        </select>

        <label 
            htmlFor="pdb-upload" 
            className="w-full text-center cursor-pointer bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 rounded-md font-medium transition-colors duration-200 block"
        >
          Upload .pdb file
        </label>
        <input 
          type="file" 
          id="pdb-upload" 
          className="hidden" 
          accept=".pdb"
          onChange={handleFileChange}
        />

        <div className="text-gray-400 text-sm mt-2 min-h-[40px]">
          {localPdbName ? (
            <p>Loaded from file: <span className="font-semibold text-gray-200">{localPdbName}</span></p>
          ) : selectedPdb ? (
            <p>{selectedPdb.description}</p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="bg-gray-700 p-3 rounded-md min-h-[120px] border border-gray-600 text-sm">
          {metadata ? (
            <ul className="text-gray-300">
              <li><strong className="text-gray-200">Title:</strong> <span className="text-gray-400">{metadata.title}</span></li>
              <li><strong className="text-gray-200">Classification:</strong> <span className="text-gray-400">{metadata.header}</span></li>
              <li><strong className="text-gray-200">Source:</strong> <span className="text-gray-400">{metadata.source}</span></li>
              <li><strong className="text-gray-200">Atoms:</strong> <span className="text-gray-400 font-mono">{metadata.numAtoms.toLocaleString()}</span></li>
            </ul>
          ) : (selectedPdbId || localPdbName) ? (
            <p className="text-gray-500 italic">Loading metadata...</p>
          ) : (
            <p className="text-gray-500 italic">Select a molecule to view its information.</p>
          )}
        </div>
      </div>

      <div className="my-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Display Settings</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Style</h4>
            <div className="flex flex-wrap gap-2">
              {displayStyles.map(({ style, label }) => (
                <button
                  key={style}
                  onClick={() => onStyleChange(style)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                    ${
                      selectedStyle === style
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Color Scheme</h4>
            <div className="flex flex-wrap gap-2">
              {colorSchemes.map(({scheme, label}) => (
                <button
                  key={scheme}
                  onClick={() => onColorSchemeChange(scheme)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                    ${
                      selectedColorScheme === scheme
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <label htmlFor="bond-scale-slider" className="block text-sm font-medium text-gray-300">
              Bond Tolerance: <span className="font-bold text-cyan-400">{bondScale.toFixed(2)}</span>
            </label>
            <input
              id="bond-scale-slider"
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={bondScale}
              onChange={(e) => onBondScaleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Increase to show bonds between more distant atoms.
            </p>
          </div>
          <div>
            <label htmlFor="atom-size-slider" className="block text-sm font-medium text-gray-300">
              Atom Size: <span className="font-bold text-cyan-400">{atomScale.toFixed(2)}</span>
            </label>
            <input
              id="atom-size-slider"
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={atomScale}
              onChange={(e) => onAtomScaleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="stick-radius-slider" className="block text-sm font-medium text-gray-300">
              Stick Radius: <span className="font-bold text-cyan-400">{stickRadius.toFixed(2)}</span>
            </label>
            <input
              id="stick-radius-slider"
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={stickRadius}
              onChange={(e) => onStickRadiusChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
