

import React, { useState, useCallback } from 'react';
import { TRIANGLE_LATTICE, SQUARE_LATTICE } from './generator/constants';
import type { Coordinate, Shells, LatticeType } from './generator/types';

interface SphericalShellsGeneratorProps {
  onClose: () => void;
  onLoadPdb: (data: string, name: string) => void;
}

// A precision factor for creating a stable key for uniqueness checks.
const KEY_PRECISION_FACTOR = 10000; // 10^4 for 4 decimal places
// A higher precision for calculating the shell number from the distance.
const CALC_PRECISION = 10;

const stringifyCoord = (coord: Coordinate): string => {
  return coord.map(c => Math.round(c * KEY_PRECISION_FACTOR)).join(',');
};

const getPdbHeader = (title: string, useExpansion: boolean): string => {
    const getPdbRevdatDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };
    const revdatDate = getPdbRevdatDate();
    const keywords = useExpansion ? 'PDB_FILE' : 'PS_FILE';
    return `HEADER    SPHERICAL SHELLS GENERATOR - CPS GEOMETRY - ${new Date().toISOString().split('T')[0]}
TITLE     ${title}
KEYWDS    ${keywords}
AUTHOR    Nick Trif
REVDAT   1   ${revdatDate}
REMARK 1  Web Site: www.platonicstructures.com
REMARK 2  Email: platonicstructures@gmail.com
REMARK 3  Copyright: Nick Trif. All rights reserved.
`;
};

const generateConectRecords = (atoms: { index: number, coord: Coordinate }[], distanceThreshold: number): string => {
    const connections = new Map<number, number[]>();
    const tolerance = 0.001;
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const atom1 = atoms[i];
            const atom2 = atoms[j];
            const dx = atom1.coord[0] - atom2.coord[0];
            const dy = atom1.coord[1] - atom2.coord[1];
            const dz = atom1.coord[2] - atom2.coord[2];
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (Math.abs(distance - distanceThreshold) < tolerance) {
                if (!connections.has(atom1.index)) connections.set(atom1.index, []);
                if (!connections.has(atom2.index)) connections.set(atom2.index, []);
                connections.get(atom1.index)!.push(atom2.index);
                connections.get(atom2.index)!.push(atom1.index);
            }
        }
    }
    let conectContent = '';
    const sortedAtomIndices = Array.from(connections.keys()).sort((a, b) => a - b);
    for (const atomIndex of sortedAtomIndices) {
        const connectedIndices = connections.get(atomIndex)!.sort((a,b) => a - b);
        const chunks = [];
        for (let i = 0; i < connectedIndices.length; i += 4) {
            chunks.push(connectedIndices.slice(i, i + 4));
        }
        for (const chunk of chunks) {
            const atomStr = String(atomIndex).padStart(5, ' ');
            const connectedStr = chunk.map(idx => String(idx).padStart(5, ' ')).join('');
            conectContent += `CONECT${atomStr}${connectedStr}\n`;
        }
    }
    return conectContent;
};

// Icons
const LoaderIcon = () => (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const PdbIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const PdbFilesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const FullPdbIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>);
const SelectedPdbIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>);
const CountsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const LoadToViewerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);

const UserGuideDialog = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="user-guide-title">
      <div className="bg-gray-800 text-gray-300 rounded-lg shadow-2xl shadow-cyan-500/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm p-6 flex justify-between items-center border-b border-gray-700">
          <h2 id="user-guide-title" className="text-2xl font-bold text-cyan-400">Spherical Shells Generator - User Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none" aria-label="Close user guide">&times;</button>
        </div>
        <div className="p-6 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">1. How to Use the Generator</h3>
              <div className="space-y-4 text-gray-400">
                <p><strong>Step 1: Set Generation Parameters</strong></p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>Number of Shells:</strong> Input the maximum shell number you want to generate. Shell 0 (the origin) is always included.</li>
                  <li><strong>Lattice Selection:</strong> Choose between <code className="bg-gray-700 px-1 rounded">'Triangle'</code> and <code className="bg-gray-700 px-1 rounded">'Square'</code> lattices. These define the initial 12 points in Shell 1 and the vectors for expansion.</li>
                  <li><strong>Scale the output PDB file coordinates:</strong> Check this box to multiply the output coordinates in PDB files by a factor (1.8 for Triangle, 1.86 for Square). This is useful for visualization in other software, as it approximates standard bond lengths. This only affects downloaded PDB files, not the data loaded into the viewer.</li>
                </ul>
                <p><strong>Step 2: Generate Shells</strong></p>
                <p className="pl-4">Click the <strong>Generate</strong> button. The calculation may take a few moments for a large number of shells.</p>
                <p><strong>Step 3: Review and Select Results</strong></p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>The results table displays each generated shell, the number of spheres (nodes) it contains, and the cumulative total.</li>
                  <li>Use the checkboxes to select specific shells for your output. The <strong>Select/Unselect All</strong> button can be used for convenience.</li>
                </ul>
                <p><strong>Step 4: Output Files</strong></p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>Load to Viewer:</strong> Loads the <em>selected</em> shells directly into the main application viewer.</li>
                  <li><strong>Save Coordinates:</strong> A <code className="bg-gray-700 px-1 rounded">.txt</code> file with raw, unscaled `[x, y, z]` coordinates for all generated shells.</li>
                  <li><strong>Save Sphere Counts:</strong> A <code className="bg-gray-700 px-1 rounded">.csv</code> file listing the sphere count per shell.</li>
                  <li><strong>Generate PDB File:</strong> A single <code className="bg-gray-700 px-1 rounded">.pdb</code> containing *all* generated shells combined.</li>
                  <li><strong>Generate PDB files - Selected Shells:</strong> A single <code className="bg-gray-700 px-1 rounded">.pdb</code> containing only the shells you *selected*.</li>
                  <li><strong>Generate Shells PDB files:</strong> Downloads an individual <code className="bg-gray-700 px-1 rounded">.pdb</code> file for *each* generated shell.</li>
                  <li><strong>Generate Full Shells PDB files:</strong> Downloads a series of cumulative <code className="bg-gray-700 px-1 rounded">.pdb</code> files. For example, the file for Shell 5 will contain all spheres from shells 0 through 5.</li>
                </ul>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">2. The Generation Algorithm</h3>
              <div className="space-y-4 text-gray-400">
                <p>The generator uses a geometric expansion algorithm, a form of breadth-first search, to discover the coordinates of spheres in concentric shells.</p>
                <p><strong>Initialization:</strong></p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>The process starts with a single sphere at the origin <code className="bg-gray-700 px-1 rounded">(0,0,0)</code>, which defines <strong>Shell 0</strong>.</li>
                  <li><strong>Shell 1</strong> is defined by a base set of 12 coordinate vectors. These vectors correspond to the vertices of an icosahedron (for 'Triangle' lattice) or a cuboctahedron (for 'Square' lattice), normalized to a unit sphere.</li>
                  <li>A queue, called the "frontier", is initialized with the 12 spheres of Shell 1.</li>
                </ul>
                <p><strong>Expansion Loop:</strong></p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>The algorithm takes the first sphere from the frontier (the `center` sphere).</li>
                  <li>It generates 12 potential new neighbor spheres by adding each of the 12 base lattice vectors to the `center` sphere's coordinates.</li>
                  <li>For each potential new sphere, it checks if it has been discovered before. This uniqueness check is vital to prevent redundant calculations.</li>
                  <li>If the sphere is new:
                    <ul className="list-disc list-inside space-y-1 pl-6 mt-1">
                      <li>Its shell number is calculated based on its squared distance from the origin (<code className="bg-gray-700 px-1 rounded">d² = x² + y² + z²</code>), which is then rounded to the nearest integer.</li>
                      <li>The new sphere is added to the list for its calculated shell number.</li>
                      <li>The new sphere is also added to the end of the frontier queue to be processed later.</li>
                    </ul>
                  </li>
                  <li>This loop repeats until the frontier is empty, guaranteeing all connected spheres are discovered in an outward-expanding order.</li>
                </ol>
              </div>
            </section>
        </div>
        <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-sm p-4 text-right border-t border-gray-700"><button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md transition-colors">Close</button></div>
      </div>
    </div>
);

const SphericalShellsGenerator: React.FC<SphericalShellsGeneratorProps> = ({ onClose, onLoadPdb }) => {
  const [numShellsInput, setNumShellsInput] = useState('10');
  const [shells, setShells] = useState<Shells>(new Map());
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [latticeType, setLatticeType] = useState<LatticeType>('triangle');
  const [useExpansion, setUseExpansion] = useState(false);
  const [selectedShells, setSelectedShells] = useState<Set<number>>(new Set());
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  const handleGenerate = useCallback(() => {
    setError('');
    setIsCalculating(true);
    setShells(new Map());
    setSelectedShells(new Set());
    const targetShells = parseInt(numShellsInput, 10);
    if (isNaN(targetShells) || targetShells <= 0) {
      setError('Please enter a valid positive number of shells.');
      setIsCalculating(false);
      return;
    }
    const lattice = latticeType === 'triangle' ? TRIANGLE_LATTICE : SQUARE_LATTICE;
    setTimeout(() => {
        const calculatedShells: Shells = new Map();
        const allFoundCoords = new Set<string>();
        const frontier: Coordinate[] = [];
        const origin: Coordinate = [0, 0, 0];
        calculatedShells.set(0, [origin]);
        allFoundCoords.add(stringifyCoord(origin));
        const shell1Coords: Coordinate[] = lattice.map(c => [...c] as Coordinate);
        calculatedShells.set(1, []);
        for (const coord of shell1Coords) {
            const key = stringifyCoord(coord);
            if (!allFoundCoords.has(key)) {
                allFoundCoords.add(key);
                frontier.push(coord);
                calculatedShells.get(1)!.push(coord);
            }
        }
        let head = 0;
        while (head < frontier.length) {
            const center = frontier[head];
            head++;
            for (const transform of lattice) {
                // FIX: The redundant Number() calls were causing a type error. Since the types are already numbers, direct addition is sufficient and correct.
                const newCoord: Coordinate = [center[0] + transform[0], center[1] + transform[1], center[2] + transform[2]];
                const key = stringifyCoord(newCoord);
                if (!allFoundCoords.has(key)) {
                    allFoundCoords.add(key);
                    const distSq = newCoord[0] ** 2 + newCoord[1] ** 2 + newCoord[2] ** 2;
                    const newShellNum = Math.round(parseFloat(distSq.toFixed(CALC_PRECISION)));
                    if (newShellNum > 1 && newShellNum <= targetShells) {
                        frontier.push(newCoord);
                        if (!calculatedShells.has(newShellNum)) calculatedShells.set(newShellNum, []);
                        calculatedShells.get(newShellNum)!.push(newCoord);
                    }
                }
            }
        }
        setShells(calculatedShells);
        const maxShellWithCoords = Math.max(...Array.from(calculatedShells.keys()));
        const fullShellKeySet = new Set(Array.from({ length: maxShellWithCoords + 1 }, (_, i) => i));
        setSelectedShells(fullShellKeySet);
        setIsCalculating(false);
    }, 50);
  }, [numShellsInput, latticeType]);

  const handleDownload = useCallback(() => {
    if (shells.size === 0) return;
    let fileContent = 'Sphere Shell Coordinates\n';
    fileContent += `Lattice Type: ${latticeType.charAt(0).toUpperCase() + latticeType.slice(1)}\n`;
    fileContent += `Generated for ${numShellsInput} shells at: ${new Date().toISOString()}\n\n`;
    const sortedShells = [...shells.entries()].sort((a, b) => a[0] - b[0]);
    for (const [shellNum, coords] of sortedShells) {
        fileContent += `--- Shell ${shellNum} (${coords.length} spheres) ---\n`;
        coords.sort((a,b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
        for (const coord of coords) {
            fileContent += `${coord.map(c => c.toFixed(8).padStart(12, ' ')).join(', ')}\n`;
        }
        fileContent += '\n';
    }
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sphere_shells_${latticeType}_data.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [shells, numShellsInput, latticeType]);

  const generatePdbContent = useCallback((selectedOnly: boolean) => {
    if (shells.size === 0 || (selectedOnly && selectedShells.size === 0)) return null;

    const expansionFactor = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    const distanceThreshold = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    
    let pdbContent = '';
    const atomsForConect: { index: number, coord: Coordinate }[] = [];
    let atomIndex = 1;
    
    const shellsToProcess = (selectedOnly 
      ? Array.from(selectedShells).sort((a, b) => a - b).map((shellNum): [number, Coordinate[] | undefined] => [shellNum, shells.get(shellNum)]) 
      : [...shells.entries()].sort((a, b) => a[0] - b[0])) as [number, Coordinate[] | undefined][];

    for (const [shellNum, coords] of shellsToProcess) {
        if (!coords) continue;
        const sortedCoords = [...coords].sort((a,b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
        for (const coord of sortedCoords) {
            const expandedCoord: Coordinate = [coord[0] * expansionFactor, coord[1] * expansionFactor, coord[2] * expansionFactor];
            const [x, y, z] = expandedCoord;
            atomsForConect.push({ index: atomIndex, coord: expandedCoord });
            const line = 'ATOM  ' + String(atomIndex).padStart(5, ' ') + ' ' + ' C  '.padEnd(4, ' ') + ' ' + 'SHL'.padEnd(3, ' ') + ' ' + 'A' + String(shellNum).padStart(4, ' ') + ' ' + '   ' + x.toFixed(3).padStart(8, ' ') + y.toFixed(3).padStart(8, ' ') + z.toFixed(3).padStart(8, ' ') + '1.00'.padStart(6, ' ') + '0.00'.padStart(6, ' ') + '          ' + 'C'.padStart(2, ' ') + '  ';
            pdbContent += line + '\n';
            atomIndex++;
        }
    }
    pdbContent += generateConectRecords(atomsForConect, distanceThreshold);
    pdbContent += `END\n`;
    return pdbContent;
  }, [shells, latticeType, useExpansion, selectedShells]);

  const handlePdbDownload = useCallback(() => {
    const pdbContent = generatePdbContent(false);
    if (!pdbContent) return;

    const filenamePrefix = useExpansion ? 'PDB_' : 'PS_';
    const sortedShells = [...shells.entries()].sort((a, b) => a[0] - b[0]);
    const maxShell = sortedShells.length > 0 ? sortedShells[sortedShells.length - 1][0] : 0;
    const latticeSuffix = latticeType === 'triangle' ? 'TR' : 'SQ';
    const paddedShellNum = String(maxShell).padStart(3, '0');
    const newFilename = `${filenamePrefix}Sphere_${paddedShellNum}_${latticeSuffix}.pdb`;
    const title = `FULL SPHERE SHELLS 0-${maxShell} FOR ${latticeType.toUpperCase()} LATTICE`;
    
    const fullPdbContent = getPdbHeader(title, useExpansion) + pdbContent;
    
    const blob = new Blob([fullPdbContent], { type: 'chemical/x-pdb' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [shells, latticeType, useExpansion, generatePdbContent]);
  
  const handleLoadToViewer = useCallback(() => {
    const pdbContent = generatePdbContent(true);
    if (!pdbContent) return;

    const filenamePrefix = useExpansion ? 'PDB_' : 'PS_';
    const latticeSuffix = latticeType === 'triangle' ? 'TR' : 'SQ';
    const newFilename = `${filenamePrefix}Sphere_MUL_SHELLS_${latticeSuffix}.pdb`;
    const title = `SELECTED SPHERE SHELLS FOR ${latticeType.toUpperCase()} LATTICE`;
    
    const fullPdbContent = getPdbHeader(title, useExpansion) + pdbContent;
    onLoadPdb(fullPdbContent, newFilename);
  }, [generatePdbContent, useExpansion, latticeType, onLoadPdb]);

  const handleSelectedShellsPdbDownload = useCallback(() => {
    const pdbContent = generatePdbContent(true);
    if (!pdbContent) return;
    
    const filenamePrefix = useExpansion ? 'PDB_' : 'PS_';
    const latticeSuffix = latticeType === 'triangle' ? 'TR' : 'SQ';
    const newFilename = `${filenamePrefix}Sphere_MUL_SHELLS_${latticeSuffix}.pdb`;
    const title = `SELECTED SPHERE SHELLS FOR ${latticeType.toUpperCase()} LATTICE`;
    
    const fullPdbContent = getPdbHeader(title, useExpansion) + pdbContent;

    const blob = new Blob([fullPdbContent], { type: 'chemical/x-pdb' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [shells, latticeType, useExpansion, generatePdbContent]);

  const handleIndividualPdbDownload = useCallback(() => {
    if (shells.size === 0) return;
    const expansionFactor = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    const distanceThreshold = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    const filenamePrefix = useExpansion ? 'PDB_' : 'PS_';
    const sortedShells = [...shells.entries()].sort((a, b) => a[0] - b[0]);
    const latticeSuffix = latticeType === 'triangle' ? 'TR' : 'SQ';

    for (const [shellNum, coords] of sortedShells as [number, Coordinate[]][]) {
        if (!Array.isArray(coords) || coords.length === 0) continue;
        let pdbContent = getPdbHeader(`SHELL ${shellNum} FOR ${latticeType.toUpperCase()} LATTICE`, useExpansion);
        const atomsForConect: { index: number, coord: Coordinate }[] = [];
        let atomIndex = 1;
        const sortedCoords = [...coords].sort((a,b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
        for (const coord of sortedCoords) {
            const expandedCoord: Coordinate = [coord[0] * expansionFactor, coord[1] * expansionFactor, coord[2] * expansionFactor];
            const [x, y, z] = expandedCoord;
            atomsForConect.push({ index: atomIndex, coord: expandedCoord });
            const line = 'ATOM  ' + String(atomIndex).padStart(5, ' ') + ' ' + ' C  '.padEnd(4, ' ') + ' ' + 'SHL'.padEnd(3, ' ') + ' ' + 'A' + String(shellNum).padStart(4, ' ') + ' ' + '   ' + x.toFixed(3).padStart(8, ' ') + y.toFixed(3).padStart(8, ' ') + z.toFixed(3).padStart(8, ' ') + '1.00'.padStart(6, ' ') + '0.00'.padStart(6, ' ') + '          ' + 'C'.padStart(2, ' ') + '  ';
            pdbContent += line + '\n';
            atomIndex++;
        }
        pdbContent += generateConectRecords(atomsForConect, distanceThreshold);
        pdbContent += `END\n`;
        const blob = new Blob([pdbContent], { type: 'chemical/x-pdb' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const paddedShellNum = String(shellNum).padStart(3, '0');
        link.download = `${filenamePrefix}Shell_${paddedShellNum}_${latticeSuffix}.pdb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  }, [shells, latticeType, useExpansion]);

  const handleFullPdbDownload = useCallback(() => {
    if (shells.size === 0) return;
    const expansionFactor = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    const distanceThreshold = useExpansion ? (latticeType === 'triangle' ? 1.8 : 1.86) : 1;
    const filenamePrefix = useExpansion ? 'PDB_' : 'PS_';
    const sortedShells = [...shells.entries()].sort((a, b) => a[0] - b[0]);
    const maxShell = sortedShells.length > 0 ? sortedShells[sortedShells.length - 1][0] : 0;
    const latticeSuffix = latticeType === 'triangle' ? 'TR' : 'SQ';
    const cumulativeCoords: Coordinate[] = [];

    for (let i = 0; i <= maxShell; i++) {
        const shellCoords = shells.get(i);
        if (shellCoords) {
            cumulativeCoords.push(...shellCoords);
            let pdbContent = getPdbHeader(`FULL SHELLS 0-${i} FOR ${latticeType.toUpperCase()} LATTICE`, useExpansion);
            const atomsForConect: { index: number, coord: Coordinate }[] = [];
            let atomIndex = 1;
            const sortedCumulativeCoords = [...cumulativeCoords].sort((a,b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

            for (const coord of sortedCumulativeCoords) {
                const expandedCoord: Coordinate = [coord[0] * expansionFactor, coord[1] * expansionFactor, coord[2] * expansionFactor];
                const [x, y, z] = expandedCoord;
                atomsForConect.push({ index: atomIndex, coord: expandedCoord });
                const line = 'ATOM  ' + String(atomIndex).padStart(5, ' ') + ' ' + ' C  '.padEnd(4, ' ') + ' ' + 'SHL'.padEnd(3, ' ') + ' ' + 'A' + String(i).padStart(4, ' ') + ' ' + '   ' + x.toFixed(3).padStart(8, ' ') + y.toFixed(3).padStart(8, ' ') + z.toFixed(3).padStart(8, ' ') + '1.00'.padStart(6, ' ') + '0.00'.padStart(6, ' ') + '          ' + 'C'.padStart(2, ' ') + '  ';
                pdbContent += line + '\n';
                atomIndex++;
            }
            pdbContent += generateConectRecords(atomsForConect, distanceThreshold);
            pdbContent += `END\n`;

            const blob = new Blob([pdbContent], { type: 'chemical/x-pdb' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const paddedShellNum = String(i).padStart(3, '0');
            link.download = `${filenamePrefix}Full_${paddedShellNum}_${latticeSuffix}.pdb`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
  }, [shells, latticeType, useExpansion]);

  const handleCSVDownload = useCallback(() => {
    if (shells.size === 0) return;
    let csvContent = 'Shell,Sphere_Count,Cumulative_Count\n';
    const sortedShells = [...shells.entries()].sort((a, b) => a[0] - b[0]);
    let cumulativeCount = 0;
    for (const [shellNum, coords] of sortedShells) {
        const count = coords.length;
        cumulativeCount += count;
        csvContent += `${shellNum},${count},${cumulativeCount}\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sphere_shells_${latticeType}_counts.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [shells, latticeType]);
  
  const toggleShellSelection = (shellNum: number) => {
    setSelectedShells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(shellNum)) {
            newSet.delete(shellNum);
        } else {
            newSet.add(shellNum);
        }
        return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (shells.size > 0 && selectedShells.size === shells.size) {
        setSelectedShells(new Set());
    } else {
        setSelectedShells(new Set(shells.keys()));
    }
  };

  const sortedShells = shells.size > 0 ? [...shells.entries()].sort((a, b) => a[0] - b[0]) : [];
  let cumulativeSpheres = 0;

  return (
    <>
      {isUserGuideOpen && <UserGuideDialog onClose={() => setIsUserGuideOpen(false)} />}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-40 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-gray-800 text-gray-300 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <header className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-cyan-400">Spherical Shells Generator</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsUserGuideOpen(true)} className="text-sm text-cyan-400 hover:underline">User Guide</button>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none">&times;</button>
            </div>
          </header>

          <div className="flex-grow flex p-4 gap-4 overflow-hidden">
            {/* Left Panel: Controls */}
            <div className="w-1/3 flex flex-col gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-cyan-300 mb-3">1. Generation Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="num-shells" className="block text-sm font-medium text-gray-400 mb-1">Number of Shells</label>
                    <input type="number" id="num-shells" value={numShellsInput} onChange={(e) => setNumShellsInput(e.target.value)} min="1" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Lattice Selection</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="lattice" value="triangle" checked={latticeType === 'triangle'} onChange={() => setLatticeType('triangle')} className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500" /><span>Triangle</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="lattice" value="square" checked={latticeType === 'square'} onChange={() => setLatticeType('square')} className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500" /><span>Square</span></label>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400"><input type="checkbox" checked={useExpansion} onChange={(e) => setUseExpansion(e.target.checked)} className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500" /><span>Scale output PDB coordinates</span></label>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={isCalculating} className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-wait">
                {isCalculating ? <><LoaderIcon /> Calculating...</> : 'Generate'}
              </button>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex-grow">
                 <h3 className="font-semibold text-cyan-300 mb-3">3. Output Files</h3>
                 <div className="grid grid-cols-1 gap-2">
                    <button onClick={handleLoadToViewer} disabled={shells.size === 0 || selectedShells.size === 0} className="output-btn bg-green-600 hover:bg-green-500 disabled:bg-gray-600"><LoadToViewerIcon /> Load to Viewer</button>
                    <button onClick={handleDownload} disabled={shells.size === 0} className="output-btn bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600"><DownloadIcon /> Save Coordinates (.txt)</button>
                    <button onClick={handleCSVDownload} disabled={shells.size === 0} className="output-btn bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600"><CountsIcon /> Save Sphere Counts (.csv)</button>
                    <button onClick={handlePdbDownload} disabled={shells.size === 0} className="output-btn bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600"><PdbIcon /> PDB File (All Shells)</button>
                    <button onClick={handleSelectedShellsPdbDownload} disabled={shells.size === 0 || selectedShells.size === 0} className="output-btn bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600"><SelectedPdbIcon /> PDB File (Selected)</button>
                    <button onClick={handleIndividualPdbDownload} disabled={shells.size === 0} className="output-btn bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"><PdbFilesIcon /> Individual PDBs (Each)</button>
                    <button onClick={handleFullPdbDownload} disabled={shells.size === 0} className="output-btn bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"><FullPdbIcon /> Cumulative PDBs (Full)</button>
                 </div>
              </div>
            </div>

            {/* Right Panel: Results */}
            <div className="w-2/3 p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-cyan-300">2. Generation Results</h3>
                <button onClick={toggleSelectAll} disabled={shells.size === 0} className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50">
                  {shells.size > 0 && selectedShells.size === shells.size ? 'Unselect All' : 'Select All'}
                </button>
              </div>
              <div className="overflow-y-auto flex-grow">
                {shells.size > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-cyan-300 uppercase bg-gray-700 sticky top-0">
                      <tr>
                        <th scope="col" className="p-2 w-12"><input type="checkbox" checked={shells.size > 0 && selectedShells.size === shells.size} onChange={toggleSelectAll} className="h-4 w-4 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500" /></th>
                        <th scope="col" className="p-2">Shell #</th>
                        <th scope="col" className="p-2">Spheres</th>
                        <th scope="col" className="p-2">Cumulative Spheres</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                      {sortedShells.map(([shellNum, coords]) => {
                        cumulativeSpheres += coords.length;
                        return (
                          <tr key={shellNum} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="p-2"><input type="checkbox" checked={selectedShells.has(shellNum)} onChange={() => toggleShellSelection(shellNum)} className="h-4 w-4 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500" /></td>
                            <td className="p-2 font-medium text-white">{shellNum}</td>
                            <td className="p-2">{coords.length.toLocaleString()}</td>
                            <td className="p-2">{cumulativeSpheres.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 italic">
                    {isCalculating ? 'Generating shells...' : 'No data generated yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SphericalShellsGenerator;