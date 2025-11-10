import React from 'react';
import { DisplayStyle, MoleculeMetadata, SelectionMode, Lattice, BondMode } from '../types';
import SphericalShellsGenerator from './SphericalShellsGenerator';
import Modal from './Modal';
import AllStructuresList from './AllStructuresList';

interface ControlsProps {
  onLocalFileLoad: (data: string, name: string) => void;
  onPdbUrlLoad: (url: string) => void;
  localPdbName: string | null;
  selectedStyle: DisplayStyle;
  onStyleChange: (style: DisplayStyle) => void;
  atomScale: number;
  onAtomScaleChange: (scale: number) => void;
  stickRadius: number;
  onStickRadiusChange: (radius: number) => void;
  bondScale: number;
  onBondScaleChange: (scale: number) => void;
  bondMode: BondMode;
  onBondModeChange: (mode: BondMode) => void;
  metadata: MoleculeMetadata | null;
  projectivePointRadius: number;
  onProjectivePointRadiusChange: (radius: number) => void;
  lineRadius: number;
  onLineRadiusChange: (radius: number) => void;
  selectionMode: SelectionMode;
  showProjectivePoints: boolean;
  showProjectivePointsSet2: boolean;
  showAntipodalProjectivePointsSet1: boolean;
  showAntipodalProjectivePointsSet2: boolean;
  lattice: Lattice;
  onLatticeChange: (lattice: Lattice) => void;
  onConvert: () => void;
  triangleLatticeFactor: number;
  onTriangleLatticeFactorChange: (factor: number) => void;
  squareLatticeFactor: number;
  onSquareLatticeFactorChange: (factor: number) => void;
  axesLength: number;
  onAxesLengthChange: (length: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  onLocalFileLoad,
  onPdbUrlLoad,
  localPdbName,
  selectedStyle,
  onStyleChange,
  atomScale,
  onAtomScaleChange,
  stickRadius,
  onStickRadiusChange,
  bondScale,
  onBondScaleChange,
  bondMode,
  onBondModeChange,
  metadata,
  projectivePointRadius,
  onProjectivePointRadiusChange,
  lineRadius,
  onLineRadiusChange,
  selectionMode,
  showProjectivePoints,
  showProjectivePointsSet2,
  showAntipodalProjectivePointsSet1,
  showAntipodalProjectivePointsSet2,
  lattice,
  onLatticeChange,
  onConvert,
  triangleLatticeFactor,
  onTriangleLatticeFactorChange,
  squareLatticeFactor,
  onSquareLatticeFactorChange,
  axesLength,
  onAxesLengthChange,
}) => {
  const [pdbUrl, setPdbUrl] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = React.useState(false);

  const displayStyles: { style: DisplayStyle; label: string }[] = [
    { style: 'sphere', label: 'Balls' },
    { style: 'ball and stick', label: 'Balls+Sticks' },
    { style: 'hidden', label: 'Hide' },
  ];

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
  
  const handleUrlLoadClick = () => {
    if (pdbUrl.trim()) {
      onPdbUrlLoad(pdbUrl.trim());
      setPdbUrl(''); // Clear after attempting to load
    }
  };

  const handleStructureSelect = (url: string) => {
    setIsDialogOpen(false);
    const transformUrl = (originalUrl: string): string => {
        const idMatch = originalUrl.match(/(\d{3}-\d{5}-\d{3})/);
        if (idMatch && idMatch[0]) {
            const id = idMatch[0];
            return `https://platonicstructures.com/PlatonicStructures/Catalog/${id}/${id}.pdb`;
        }
        console.warn('Could not transform URL, ID not found:', originalUrl);
        return originalUrl;
    };
    const transformedUrl = transformUrl(url);
    onPdbUrlLoad(transformedUrl);
  };


  return (
    <React.Fragment>
      <Modal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Load Platonic Structure from Library"
      >
          <AllStructuresList onStructureSelect={(url, title) => handleStructureSelect(url)} />
      </Modal>
      {isGeneratorOpen && (
        <SphericalShellsGenerator
          onClose={() => setIsGeneratorOpen(false)}
          onLoadPdb={(data, name) => {
              onLocalFileLoad(data, name);
              setIsGeneratorOpen(false);
          }}
        />
      )}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
        <div className="mb-2">
          <label className="block text-lg font-semibold mb-2 text-cyan-400">
            Load Platonic Structure:
          </label>

          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex-grow text-center cursor-pointer bg-teal-600 text-white hover:bg-teal-500 px-3 py-1.5 text-sm rounded-md font-medium transition-colors duration-200"
            >
              Spherical Shells...
            </button>
            <label 
                htmlFor="pdb-upload" 
                className="flex-grow text-center cursor-pointer bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1.5 text-sm rounded-md font-medium transition-colors duration-200"
            >
              Open...
            </label>
            <input 
              type="file" 
              id="pdb-upload" 
              className="hidden" 
              accept=".pdb"
              onChange={handleFileChange}
            />
            <button
                onClick={() => setIsDialogOpen(true)}
                className="flex-grow bg-gray-600 text-white hover:bg-gray-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                aria-label="Select PDB from list"
            >
                Select...
            </button>
          </div>

          <div className="flex gap-2">
              <input
                  type="url"
                  placeholder="Or load from URL..."
                  value={pdbUrl}
                  onChange={(e) => setPdbUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUrlLoadClick(); }}
                  className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md p-1.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  aria-label="Load PDB from URL"
              />
              <button
                  onClick={handleUrlLoadClick}
                  className="bg-cyan-600 text-white hover:bg-cyan-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 shrink-0"
                  aria-label="Load URL"
              >
                  Load
              </button>
          </div>

          <div className="text-gray-400 text-sm mt-2 min-h-[40px]">
            {localPdbName ? (
              <p>Loaded: <span className="font-semibold text-gray-200">{localPdbName}</span></p>
            ) : (
              <p>Please upload a structure or load from a URL.</p>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-700 p-3 rounded-md h-[120px] overflow-y-auto border border-gray-600 text-sm">
            {metadata ? (
              <ul className="text-gray-300">
                <li><strong className="text-gray-200">Title:</strong> <span className="text-gray-400">{metadata.title}</span></li>
                <li><strong className="text-gray-200">Classification:</strong> <span className="text-gray-400">{metadata.header}</span></li>
                <li><strong className="text-gray-200">Source:</strong> <span className="text-gray-400">{metadata.source}</span></li>
                <li><strong className="text-gray-200">Total Number Nodes:</strong> <span className="text-gray-400 font-mono">{metadata.numAtoms.toLocaleString()}</span></li>
              </ul>
            ) : localPdbName ? (
              <p className="text-gray-500 italic">Loading metadata...</p>
            ) : (
              <p className="text-gray-500 italic">Select and load a Platonic Structure to explore and analyze.</p>
            )}
          </div>
        </div>

        <div className="my-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-cyan-400 whitespace-nowrap">Display Style:</h3>
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
            <div className="pt-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bond Generation:</label>
                <div className="flex items-center gap-4 rounded-md bg-gray-900/50 p-2 border border-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm">
                    <input
                        type="radio"
                        name="bond-mode"
                        value="calculated"
                        checked={bondMode === 'calculated'}
                        onChange={() => onBondModeChange('calculated')}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    />
                    <span>Calculated</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm">
                    <input
                        type="radio"
                        name="bond-mode"
                        value="conect"
                        checked={bondMode === 'conect'}
                        onChange={() => onBondModeChange('conect')}
                        className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    />
                    <span>CONECT Only</span>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use distance ('Calculated') or only PDB file `CONECT` records.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="bond-scale-slider" className={`block text-sm font-medium ${bondMode === 'calculated' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Length Tolerance: <span className="font-bold text-cyan-400">{bondScale.toFixed(2)}</span>
                  </label>
                  <input
                    id="bond-scale-slider"
                    type="range"
                    min="0.3"
                    max="5.0"
                    step="0.05"
                    value={bondScale}
                    onChange={(e) => onBondScaleChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={bondMode !== 'calculated'}
                  />
                </div>
                <div>
                  <label htmlFor="axes-length-slider" className="block text-sm font-medium text-gray-300">
                    Axes Length: <span className="font-bold text-cyan-400">{axesLength.toFixed(0)}</span>
                  </label>
                  <input
                    id="axes-length-slider"
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={axesLength}
                    onChange={(e) => onAxesLengthChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="atom-size-slider" className="block text-sm font-medium text-gray-300">
                    Node Size: <span className="font-bold text-cyan-400">{atomScale.toFixed(2)}</span>
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
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={stickRadius}
                    onChange={(e) => onStickRadiusChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="projective-point-radius-slider" className="block text-sm font-medium text-gray-300">
                  Intersect Radius: <span className="font-bold text-cyan-400">{projectivePointRadius.toFixed(2)}</span>
                </label>
                <input
                  id="projective-point-radius-slider"
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={projectivePointRadius}
                  onChange={(e) => onProjectivePointRadiusChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!showProjectivePoints && !showProjectivePointsSet2 && !showAntipodalProjectivePointsSet1 && !showAntipodalProjectivePointsSet2 && !['node', 'distance', 'triangle'].includes(selectionMode)}
                />
              </div>
              <div>
                <label htmlFor="line-radius-slider" className="block text-sm font-medium text-gray-300">
                  Line Radius: <span className="font-bold text-cyan-400">{lineRadius.toFixed(2)}</span>
                </label>
                <input
                  id="line-radius-slider"
                  type="range"
                  min="0.01"
                  max="0.2"
                  step="0.01"
                  value={lineRadius}
                  onChange={(e) => onLineRadiusChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <div className="flex items-center gap-4 mb-3">
              <label className="block text-md font-semibold text-cyan-400">
                Lattice:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lattice-type"
                    value="triangle"
                    checked={lattice === 'triangle'}
                    onChange={() => onLatticeChange('triangle')}
                    className="h-4 w-4 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                  />
                  <span className="text-gray-300">Triangle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lattice-type"
                    value="square"
                    checked={lattice === 'square'}
                    onChange={() => onLatticeChange('square')}
                    className="h-4 w-4 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                  />
                  <span className="text-gray-300">Square</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="triangle-factor" className="block text-xs font-medium text-gray-400 mb-1">
                        Triangle Factor
                    </label>
                    <input
                        id="triangle-factor"
                        type="number"
                        step="0.01"
                        value={triangleLatticeFactor}
                        onChange={(e) => onTriangleLatticeFactorChange(parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="square-factor" className="block text-xs font-medium text-gray-400 mb-1">
                        Square Factor
                    </label>
                    <input
                        id="square-factor"
                        type="number"
                        step="0.01"
                        value={squareLatticeFactor}
                        onChange={(e) => onSquareLatticeFactorChange(parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 transition"
                    />
                </div>
            </div>
            <div className="mt-3">
              <button
                onClick={onConvert}
                disabled={!localPdbName}
                className="w-full bg-amber-600 text-white hover:bg-amber-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {lattice === 'triangle' ? 'Convert to Square' : 'Convert to Triangle'}
              </button>
            </div>
          </div>
      </div>
    </React.Fragment>
  );
};

export default Controls;