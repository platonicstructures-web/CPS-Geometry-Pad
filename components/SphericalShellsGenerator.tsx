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
          <h2 id="user-guide-title" className="text-2xl font-bold text-cyan-400">User Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none" aria-label="Close user guide">&times;</button>
        </div>
        <div className="p-6 space-y-6">
            <section><h3 className="text-xl font-semibold text-cyan-300 mb-2">How to Use the Applet</h3><div className="space-y-4 text-gray-400"><p><strong>1. Set Generation Parameters:</strong></p><ul className="list-disc list-inside space-y-2 pl-4"><li><strong>Number of Shells:</strong> Input the maximum shell number you want to generate. Shell 0 (the origin) is always included.</li><li><strong>Lattice Selection:</strong> Choose between <code className="bg-gray-700 px-1 rounded">'Triangle'</code> and <code className="bg-gray-700 px-1 rounded">'Square'</code> lattices. These define the initial 12 points in Shell 1 and the vectors for expansion.</li><li><strong>Scale the output PDB file coordinates:</strong> Check this box to scale the output PDB file coordinates by a factor (1.8 for Triangle, 1.86 for Square). This is useful for visualization in molecular modeling software, approximating standard bond lengths. This only affects PDB file downloads.</li></ul><p><strong>2. Generate Shells:</strong></p><p className="pl-4">Click the <strong>Generate</strong> button. The calculation may take a few moments for a large number of shells.</p><p><strong>3. Review and Select Results:</strong></p><ul className="list-disc list-inside space-y-2 pl-4"><li>The results table displays each generated shell, the number of spheres it contains, and the cumulative total.</li><li>Use the checkboxes to select specific shells for download. The <strong>Select/Unselect All</strong> button can be used for convenience.</li></ul><p><strong>4. Download Files:</strong></p><ul className="list-disc list-inside space-y-2 pl-4"><li><strong>Save Coordinates:</strong> A <code className="bg-gray-700 px-1 rounded">.txt</code> file with raw, unscaled `[x, y, z]` coordinates for all shells.</li><li><strong>Save Sphere Counts:</strong> A <code className="bg-gray-700 px-1 rounded">.csv</code> file listing the sphere count per shell.</li><li><strong>Generate PDB File:</strong> A single <code className="bg-gray-700 px-1 rounded">.pdb</code> file containing all generated shells combined.</li><li><strong>Generate PDB files - Selected Shells:</strong> A single <code className="bg-gray-700 px-1 rounded">.pdb</code> file containing only the shells you selected.</li><li><strong>Generate Shells PDB files:</strong> Downloads an individual <code className="bg-gray-700 px-1 rounded">.pdb</code> file for each shell.</li><li><strong>Generate Full Shells PDB files:</strong> Downloads a series of cumulative <code className="bg-gray-700 px-1 rounded">.pdb</code> files. For example, file <code className="bg-gray-700 px-1 rounded">Sphere_005_TR.pdb</code> will contain all spheres from shells 0 through 5.</li></ul></div></section>
            <section><h3 className="text-xl font-semibold text-cyan-300 mb-2">The Generation Algorithm</h3><div className="space-y-4 text-gray-400"><p>The generator uses a geometric expansion algorithm, which is a form of breadth-first search, to discover the coordinates of spheres in concentric shells.</p><p><strong>Initialization:</strong></p><ul className="list-disc list-inside space-y-2 pl-4"><li>The process starts with a single sphere at the origin <code className="bg-gray-700 px-1 rounded">(0,0,0)</code>, which defines <strong>Shell 0</strong>.</li><li><strong>Shell 1</strong> is defined by a base set of 12 coordinate vectors. These vectors correspond to the vertices of an icosahedron (for the 'Triangle' lattice) or a cuboctahedron (for the 'Square' lattice), normalized to a unit sphere.</li><li>A queue, called the "frontier", is initialized with the 12 spheres of Shell 1.</li></ul><p><strong>Expansion Loop:</strong></p><ol className="list-decimal list-inside space-y-2 pl-4"><li>The algorithm takes the first sphere from the frontier (the `center` sphere).</li><li>It generates 12 potential new neighbor spheres by adding each of the 12 base lattice vectors to the `center` sphere's coordinates.</li><li>For each potential new sphere, it checks if it has been discovered before. This uniqueness check is vital to prevent redundant calculations and ensure correctness.</li><li>If the sphere is new:<ul className="list-disc list-inside space-y-1 pl-6 mt-1"><li>Its shell number is calculated based on its squared distance from the origin (<code className="bg-gray-700 px-1 rounded">d² = x² + y² + z²</code>). This value is rounded to the nearest integer.</li><li>The new sphere is added to the list for its calculated shell number.</li><li>The new sphere is also added to the end of the frontier queue to be processed later.</li></ul></li><li>The algorithm repeats this loop, processing the next sphere in the frontier, until the frontier is empty. This process guarantees that all spheres are discovered in an outward-expanding order.</li></ol></div></section>
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
                // FIX: Explicitly cast Coordinate elements to number to resolve arithmetic operation error.
                const newCoord: Coordinate = [(center[0] as number) + (transform[0] as number), (center[1] as number) + (transform[1] as number), (center[2] as number) + (transform[2] as number)];
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
    for (const [shellNum, coords] of sortedShells) {
        // FIX: Add a type guard to ensure coords is an array before iterating over it.
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
    const allShellCoords = new Map(sortedShells);
    for (let currentMaxShell = 0; currentMaxShell <= maxShell; currentMaxShell++) {
        let pdbContent = getPdbHeader(`FULL SHELLS 0-${currentMaxShell} FOR ${latticeType.toUpperCase()} LATTICE`, useExpansion);
        let atomIndex = 1;
        const atomsForConect: { index: number, coord: Coordinate }[] = [];
        for (let i = 0; i <= currentMaxShell; i++) {
            const coords = allShellCoords.get(i);
            if (!coords) continue;
            const sortedCoords = [...coords].sort((a,b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
            for (const coord of sortedCoords) {
                const expandedCoord: Coordinate = [coord[0] * expansionFactor, coord[1] * expansionFactor, coord[2] * expansionFactor];
                const [x, y, z] = expandedCoord;
                atomsForConect.push({ index: atomIndex, coord: expandedCoord });
                const line = 'ATOM  ' + String(atomIndex).padStart(5, ' ') + ' ' + ' C  '.padEnd(4, ' ') + ' ' + 'SHL'.padEnd(3, ' ') + ' ' + 'A' + String(i).padStart(4, ' ') + ' ' + '   ' + x.toFixed(3).padStart(8, ' ') + y.toFixed(3).padStart(8, ' ') + z.toFixed(3).padStart(8, ' ') + '1.00'.padStart(6, ' ') + '0.00'.padStart(6, ' ') + '          ' + 'C'.padStart(2, ' ') + '  ';
                pdbContent += line + '\n';
                atomIndex++;
            }
        }
        if (atomIndex === 1) continue;
        pdbContent += generateConectRecords(atomsForConect, distanceThreshold);
        pdbContent += `END\n`;
        const blob = new Blob([pdbContent], { type: 'chemical/x-pdb' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const paddedShellNum = String(currentMaxShell).padStart(3, '0');
        link.download = `${filenamePrefix}Sphere_${paddedShellNum}_${latticeSuffix}.pdb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  }, [shells, latticeType, useExpansion]);

  const handleCountsDownload = useCallback(() => {
    if (shells.size === 0) return;
    let fileContent = 'Shell Number,Number of Spheres\n';
    fileContent += `# Lattice Type: ${latticeType.charAt(0).toUpperCase() + latticeType.slice(1)}\n`;
    const sortedShellKeys = [...shells.keys()].sort((a, b) => a - b);
    const maxShell = sortedShellKeys.length > 0 ? sortedShellKeys[sortedShellKeys.length - 1] : 0;
    for (let i = 0; i <= maxShell; i++) {
        const coords = shells.get(i);
        const count = coords ? coords.length : 0;
        fileContent += `${i},${count}\n`;
    }
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sphere_shell_${latticeType}_counts.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [shells, latticeType]);

  const handleCheckboxChange = (shellNum: number) => {
    setSelectedShells(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(shellNum)) newSelected.delete(shellNum); else newSelected.add(shellNum);
        return newSelected;
    });
  };

  const sortedShells = Array.from(shells.entries()).sort((a, b) => a[0] - b[0]);
  const maxShell = sortedShells.length > 0 ? sortedShells[sortedShells.length - 1][0] : 0;
  let cumulativeCount = 0;
  const fullShellList = Array.from({ length: maxShell + 1 }, (_, i) => {
      const shellData = shells.get(i);
      const count = shellData ? shellData.length : 0;
      cumulativeCount += count;
      return { shellNum: i, count: count, partialSum: cumulativeCount };
  });

  const handleSelectAllToggle = () => {
    if (selectedShells.size < fullShellList.length) setSelectedShells(new Set(fullShellList.map(s => s.shellNum)));
    else setSelectedShells(new Set());
  };
  const allShellsSelected = fullShellList.length > 0 && selectedShells.size === fullShellList.length;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
          <h1 className="text-2xl font-bold text-cyan-400">Spherical Shells Generator - CPS Geometry</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl" aria-label="Close dialog">&times;</button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-cyan-500/10 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label htmlFor="shells-input" className="block font-medium text-gray-300 mb-2">Number of Shells</label>
                <div className="flex gap-4"><input id="shells-input" type="number" value={numShellsInput} onChange={(e) => setNumShellsInput(e.target.value)} min="1" className="flex-grow w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="e.g., 10" disabled={isCalculating} /><button onClick={handleGenerate} disabled={isCalculating} className="flex-shrink-0 flex justify-center items-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition-all duration-300 transform hover:scale-105">{isCalculating ? <><LoaderIcon /> Calculating...</> : 'Generate'}</button></div>
                <div className="text-right mt-2"><button onClick={() => setIsUserGuideOpen(true)} className="text-sm text-cyan-400 hover:text-cyan-300 underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">User Guide...</button></div>
              </div>
              <fieldset><legend className="block font-medium text-gray-300 mb-2">Lattice Expansion Factor Selection</legend><div className="flex flex-col gap-4 rounded-md bg-gray-900 p-3 border border-gray-700"><div className="flex items-center gap-6"><label className="flex items-center gap-2 cursor-pointer text-gray-300"><input type="radio" name="lattice-type" value="triangle" checked={latticeType === 'triangle'} onChange={() => setLatticeType('triangle')} disabled={isCalculating} className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500" /><span>Triangle</span></label><label className="flex items-center gap-2 cursor-pointer text-gray-300"><input type="radio" name="lattice-type" value="square" checked={latticeType === 'square'} onChange={() => setLatticeType('square')} disabled={isCalculating} className="h-4 w-4 bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500" /><span>Square</span></label></div><div className="border-t border-gray-700/50 pt-3"><label className="flex items-center gap-2 cursor-pointer text-gray-300"><input type="checkbox" checked={useExpansion} onChange={(e) => setUseExpansion(e.target.checked)} disabled={isCalculating} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500" /><span>Scale the output PDB file coordinates</span></label></div></div></fieldset>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>
          {shells.size > 0 && !isCalculating && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-cyan-500/10 p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold text-cyan-400">Results</h2><button onClick={handleSelectAllToggle} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors">{allShellsSelected ? 'Unselect All Shells' : 'Select All Shells'}</button></div>
              <ul className="space-y-1 max-h-96 overflow-y-auto pr-2">{fullShellList.map(({ shellNum, count, partialSum }) => (<li key={shellNum} className="bg-gray-900/70 py-2 px-4 rounded-md grid grid-cols-[auto_1fr_1fr_1fr] items-center border border-gray-700 gap-4"><input type="checkbox" checked={selectedShells.has(shellNum)} onChange={() => handleCheckboxChange(shellNum)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 cursor-pointer" /><span className="font-medium text-gray-300">Shell {shellNum}</span><span className="text-cyan-400 font-mono bg-gray-800 px-2 py-1 rounded-full text-sm text-center">{count.toLocaleString()} spheres</span><span className="text-gray-400 font-mono text-sm text-right">Total: {partialSum.toLocaleString()}</span></li>))}</ul>
              <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                <button onClick={handleLoadToViewer} className="flex items-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><LoadToViewerIcon />Load to Viewer</button>
                <button onClick={handleDownload} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"><DownloadIcon />Save Coordinates</button>
                <button onClick={handleCountsDownload} className="flex items-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><CountsIcon />Save Sphere Counts</button>
                <button onClick={handlePdbDownload} className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PdbIcon />Generate PDB File</button>
                <button onClick={handleSelectedShellsPdbDownload} className="flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><SelectedPdbIcon />Generate PDB files - Selected Shells</button>
                <button onClick={handleIndividualPdbDownload} className="flex items-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PdbFilesIcon />Generate Shells PDB files</button>
                <button onClick={handleFullPdbDownload} className="flex items-center bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><FullPdbIcon />Generate Full Shells PDB files</button>
              </div>
            </div>
          )}
        </main>
        {isUserGuideOpen && <UserGuideDialog onClose={() => setIsUserGuideOpen(false)} />}
      </div>
    </div>
  );
}

export default SphericalShellsGenerator;
