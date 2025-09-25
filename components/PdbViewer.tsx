
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { DisplayStyle, AtomSpec, ColorScheme, SelectionMode, MoleculeMetadata } from '../types';

declare const $3Dmol: any;

export interface PdbViewerHandles {
  setView: (view: string) => void;
}

interface PdbViewerProps {
  pdbId: string | null;
  pdbData: string | null;
  style: DisplayStyle;
  colorScheme: ColorScheme;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  selectionMode: SelectionMode;
  selectedAtoms: AtomSpec[];
  setSelectedAtoms: React.Dispatch<React.SetStateAction<AtomSpec[]>>;
  selectedProjectivePoint: {x: number, y: number, z: number} | null;
  setSelectedProjectivePoint: (point: {x: number, y: number, z: number} | null) => void;
  setDistances: (distances: number[] | null) => void;
  atomScale: number;
  stickRadius: number;
  lineRadius: number;
  bondScale: number;
  setMetadata: React.Dispatch<React.SetStateAction<MoleculeMetadata | null>>;
  normalLineLength: number;
  showOriginSphere: boolean;
  originSphereOpacity: number;
  showSphere2: boolean;
  sphere2Opacity: number;
  showCylinder: boolean;
  cylinderRadius: number;
  cylinderHeight: number;
  viewerBackground: string;
  showAxes: boolean;
  showCpsLines: boolean;
  showProjectivePoints: boolean;
}

// Vector math helpers
const vec = (x: number, y: number, z: number) => ({ x, y, z });
const add = (v1: any, v2: any) => vec(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
const sub = (v1: any, v2: any) => vec(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
const scale = (v: any, s: number) => vec(v.x * s, v.y * s, v.z * s);
const len = (v: any) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const cross = (v1: any, v2: any) => vec(
  v1.y * v2.z - v1.z * v2.y,
  v1.z * v2.x - v1.x * v2.z,
  v1.x * v2.y - v1.y * v2.x
);
const normalize = (v: any) => {
  const l = len(v);
  if (l < 1e-6) return vec(0, 0, 0); // handle zero-length vector
  return scale(v, 1 / l);
};

const VIEW_MATRICES: { [key: string]: number[] } = {
  front:  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  back:   [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1],
  top:    [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1],
  bottom: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  right:  [0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1],
  left:   [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
};

const parsePdbMetadata = (pdbString: string): Omit<MoleculeMetadata, 'numAtoms'> => {
  const lines = pdbString.split('\n');
  let title = '';
  let header = '';
  let source = '';

  const titleRegex = /^TITLE\s*\d*\s*(.*)/;
  const sourceRegex = /^SOURCE\s*\d*\s*(.*)/;

  for (const line of lines) {
    const titleMatch = line.match(titleRegex);
    if (titleMatch) {
      title += titleMatch[1].trim() + ' ';
      continue;
    }

    const sourceMatch = line.match(sourceRegex);
    if (sourceMatch) {
      source += sourceMatch[1].trim() + ' ';
      continue;
    }
    
    if (line.startsWith('HEADER')) {
      header = line.substring(10, 50).trim();
    }

    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      break; 
    }
  }

  return {
    title: title.trim() || 'N/A',
    header: header.trim() || 'N/A',
    source: source.trim() || 'N/A',
  };
};


const PdbViewer = forwardRef<PdbViewerHandles, PdbViewerProps>(({ 
  pdbId, 
  pdbData,
  style, 
  colorScheme,
  setIsLoading, 
  setError,
  selectionMode,
  selectedAtoms,
  setSelectedAtoms,
  selectedProjectivePoint,
  setSelectedProjectivePoint,
  setDistances,
  atomScale,
  stickRadius,
  lineRadius,
  bondScale,
  setMetadata,
  normalLineLength,
  showOriginSphere,
  originSphereOpacity,
  showSphere2,
  sphere2Opacity,
  showCylinder,
  cylinderRadius,
  cylinderHeight,
  viewerBackground,
  showAxes,
  showCpsLines,
  showProjectivePoints,
}, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const glViewer = useRef<any>(null);

  const [modelData, setModelData] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    setView(view: string) {
      if (!glViewer.current) return;
      const matrix = VIEW_MATRICES[view];
      if (matrix) {
        glViewer.current.setView(matrix);
        glViewer.current.render();
      }
    },
  }));

  useEffect(() => {
    if (!viewerRef.current || glViewer.current) return;
    const config = { }; // Background color will be set dynamically
    glViewer.current = $3Dmol.createViewer(viewerRef.current, config);
  }, []);

  useEffect(() => {
    if (glViewer.current) {
      const backgroundHex: { [key: string]: string } = {
        dark: '0x1f2937',
        black: '0x000000',
        'light-blue': '0xe0f2fe',
        white: '0xffffff',
      };
      const colorHex = backgroundHex[viewerBackground] || '0x1f2937';
      glViewer.current.setBackgroundColor(colorHex);
      glViewer.current.render();
    }
  }, [viewerBackground]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setMetadata(null);
      setModelData(null);
      
      try {
        let data: string | null = null;
        if (pdbData) {
          data = pdbData;
        } else if (pdbId) {
          const url = `https://files.rcsb.org/download/${pdbId}.pdb`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDB file from RCSB. Status: ${response.status}`);
          }
          data = await response.text();
        }

        if (data) {
          const parsedMeta = parsePdbMetadata(data);
          setMetadata({ ...parsedMeta, numAtoms: 0 });
          setModelData(data);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDB file:', err);
        setError(err.message || 'An unknown error occurred.');
        setIsLoading(false);
      }
    };
    
    if (pdbId || pdbData) {
      fetchData();
    } else {
      setIsLoading(false);
      setModelData(null);
      if (glViewer.current) {
        glViewer.current.clear();
        glViewer.current.render();
      }
    }
  }, [pdbId, pdbData, setMetadata, setError, setIsLoading]);


  useEffect(() => {
    if (!glViewer.current) return;

    glViewer.current.clear();

    if (showAxes) {
      // DRAW AXES
      const axisDiameter = cylinderRadius * 2;
      const axisLength = axisDiameter * 1.2;
      const halfAxisLength = axisLength / 2;

      // X-axis (Red)
      glViewer.current.addCylinder({
        start: { x: -halfAxisLength, y: 0, z: 0 },
        end: { x: halfAxisLength, y: 0, z: 0 },
        radius: lineRadius,
        color: 'red',
      });
      glViewer.current.addLabel('X', {
        position: { x: halfAxisLength + 1, y: 0, z: 0 },
        fontColor: 'red',
        fontSize: 16,
        showBackground: false,
      });

      // Y-axis (Green)
      glViewer.current.addCylinder({
        start: { x: 0, y: -halfAxisLength, z: 0 },
        end: { x: 0, y: halfAxisLength, z: 0 },
        radius: lineRadius,
        color: 'green',
      });
      glViewer.current.addLabel('Y', {
        position: { x: 0, y: halfAxisLength + 1, z: 0 },
        fontColor: 'green',
        fontSize: 16,
        showBackground: false,
      });

      // Z-axis (Blue)
      glViewer.current.addCylinder({
        start: { x: 0, y: 0, z: -halfAxisLength },
        end: { x: 0, y: 0, z: halfAxisLength },
        radius: lineRadius,
        color: 'blue',
      });
      glViewer.current.addLabel('Z', {
        position: { x: 0, y: 0, z: halfAxisLength + 1 },
        fontColor: 'blue',
        fontSize: 16,
        showBackground: false,
      });

      // Reference Cylinder
      glViewer.current.addCylinder({
        start: { x: 0, y: 0, z: -cylinderHeight / 2 },
        end: { x: 0, y: 0, z: cylinderHeight / 2 },
        radius: cylinderRadius,
        color: 'cyan',
        opacity: 0.25,
        fromCap: 1,
        toCap: 1,
      });
    }

    if (!modelData) {
      glViewer.current.render();
      return;
    }

    setIsLoading(true);
    setDistances(null);

    glViewer.current.addModel(modelData, 'pdb', { bondScale });
    const modelSpec = { model: 0 };
    
    // Update metadata with the accurate atom count from the loaded molecule model.
    const atoms = glViewer.current.getModel(0)?.selectedAtoms({});
    if (atoms) {
      setMetadata(prev => prev ? { ...prev, numAtoms: atoms.length } : null);
    }

    // SET BASE STYLE, targeting only the molecule model
    let colorSchemeName: string;
    switch(colorScheme) {
      case 'element': colorSchemeName = 'Jmol'; break;
      case 'residue': colorSchemeName = 'amino'; break;
      case 'spectrum': default: colorSchemeName = 'spectrum'; break;
    }
    
    switch(style) {
      case 'line':
        glViewer.current.setStyle(modelSpec, { line: { colorscheme: colorSchemeName } });
        break;
      case 'stick':
        glViewer.current.setStyle(modelSpec, { stick: { colorscheme: colorSchemeName, radius: stickRadius } });
        break;
      case 'sphere':
        glViewer.current.setStyle(modelSpec, { sphere: { scale: atomScale, colorscheme: colorSchemeName } });
        break;
      case 'ball and stick':
        glViewer.current.setStyle(modelSpec, { 
          stick: { colorscheme: colorSchemeName, radius: stickRadius }, 
          sphere: { scale: atomScale * 0.6, colorscheme: colorSchemeName } 
        });
        break;
      case 'hidden':
        glViewer.current.setStyle(modelSpec, {
          line: { hidden: true },
          stick: { hidden: true },
          sphere: { hidden: true },
        });
        break;
      default:
        glViewer.current.setStyle(modelSpec, { stick: { colorscheme: colorSchemeName, radius: stickRadius } });
        break;
    }
    
    if (showOriginSphere) {
      glViewer.current.addSphere({
        center: { x: 0, y: 0, z: 0 },
        radius: 1.8 * Math.sqrt(2),
        color: 'white',
        opacity: originSphereOpacity
      });
    }

    if (showSphere2) {
      glViewer.current.addSphere({
        center: { x: 0, y: 0, z: -1.8 },
        radius: 1.8,
        color: 'yellow',
        opacity: sphere2Opacity
      });
    }
    
    if (showCylinder) {
      glViewer.current.addCylinder({
        start: { x: 0, y: 0, z: -1.8 - cylinderHeight / 2 },
        end: { x: 0, y: 0, z: -1.8 + cylinderHeight / 2 },
        radius: cylinderRadius,
        color: 'lightgreen',
        opacity: 0.7,
        fromCap: 1,
        toCap: 1,
      });

      const newCylinderHeight = cylinderHeight * 1.1;
      glViewer.current.addCylinder({
        start: { x: 0, y: 0, z: -1.8 - newCylinderHeight / 2 },
        end: { x: 0, y: 0, z: -1.8 + newCylinderHeight / 2 },
        radius: 1.8,
        color: 'lightpink',
        opacity: 0.7,
        fromCap: 1,
        toCap: 1,
      });
    }

    // Draw stereographic projection lines
    if (atoms && showCylinder) {
      const lineLength = cylinderRadius * 2;
      const origin = { x: 0, y: 0, z: 0 };

      atoms.forEach((atom: AtomSpec) => {
        if (atom.z <= 0) {
          const atomPos = { x: atom.x, y: atom.y, z: atom.z };
          if (len(atomPos) > 1e-6) { // Avoid drawing for atoms at the origin
            const direction = normalize(atomPos);
            const endPoint = scale(direction, lineLength);
            
            if (showCpsLines) {
              glViewer.current.addCylinder({
                start: origin,
                end: endPoint,
                radius: lineRadius,
                color: 'orange',
              });
            }

            // Calculate and draw the intersection sphere on the plane z = -1.8
            if (showProjectivePoints && atom.z < 0) { // Avoid division by zero for atoms on the xy-plane
              const ratio = -1.8 / atom.z;
              const intersectionX = atom.x * ratio;
              const intersectionY = atom.y * ratio;
              const center = { x: intersectionX, y: intersectionY, z: -1.8 };
              
              glViewer.current.addSphere({
                center: center,
                radius: 0.2, // A small, fixed radius for the sphere
                color: 'purple',
                clickable: selectionMode === 'projective',
                callback: () => { setSelectedProjectivePoint(center); }
              });
            }
          }
        }
      });
    }

    // HIGHLIGHT selected projective point
    if (selectionMode === 'projective' && selectedProjectivePoint) {
      glViewer.current.addSphere({
        center: selectedProjectivePoint,
        radius: 0.25,
        color: 'cyan'
      });
    }

    // HIGHLIGHT selected atoms
    if (selectedAtoms.length > 0) {
      const selectionSpec = { serial: selectedAtoms.map(a => a.serial) };
      glViewer.current.addStyle(selectionSpec, {
        sphere: { color: 'red', scale: atomScale + 0.1 },
        stick: { color: 'red', radius: stickRadius + 0.05 }
      });
    }
    
    // DRAW LABELS & SHAPES for selected atoms
    selectedAtoms.forEach(atom => {
      const labelText = `${atom.elem} ${atom.resi}`;
      glViewer.current.addLabel(labelText, {
        position: { x: atom.x, y: atom.y, z: atom.z },
        backgroundColor: '0xf87171',
        backgroundOpacity: 0.9,
        fontColor: '0x1f2937',
        borderColor: '0xdc2626',
        inFront: true,
      });
    });

    if (selectionMode === 'distance' && selectedAtoms.length === 2) {
      const [atom1, atom2] = selectedAtoms;
      const p1 = { x: atom1.x, y: atom1.y, z: atom1.z };
      const p2 = { x: atom2.x, y: atom2.y, z: atom2.z };
      const distVec = sub(p1, p2);
      setDistances([len(distVec)]);
      glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius, color: 'red', dashed: true });
    }

    if (selectionMode === 'triangle' && selectedAtoms.length === 3) {
      const [atom1, atom2, atom3] = selectedAtoms;
      const p1 = { x: atom1.x, y: atom1.y, z: atom1.z };
      const p2 = { x: atom2.x, y: atom2.y, z: atom2.z };
      const p3 = { x: atom3.x, y: atom3.y, z: atom3.z };
      
      const dist12 = len(sub(p1, p2));
      const dist23 = len(sub(p2, p3));
      const dist13 = len(sub(p1, p3));
      setDistances([dist12, dist23, dist13]);

      glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius, color: 'red', dashed: true });
      glViewer.current.addCylinder({ start: p2, end: p3, radius: lineRadius, color: 'red', dashed: true });
      glViewer.current.addCylinder({ start: p1, end: p3, radius: lineRadius, color: 'red', dashed: true });
      
      const center = {
        x: (p1.x + p2.x + p3.x) / 3,
        y: (p1.y + p2.y + p3.y) / 3,
        z: (p1.z + p2.z + p3.z) / 3,
      };

      glViewer.current.addSphere({
        center: center,
        radius: 0.25,
        color: 'blue'
      });

      // Calculate and draw the normal line
      const v1 = sub(p2, p1);
      const v2 = sub(p3, p1);
      const normal = cross(v1, v2);

      if (len(normal) > 1e-6) { // Avoid drawing if atoms are collinear
        const unitNormal = normalize(normal);
        const halfLengthVec = scale(unitNormal, normalLineLength / 2);
        const lineStart = sub(center, halfLengthVec);
        const lineEnd = add(center, halfLengthVec);
        glViewer.current.addCylinder({ start: lineStart, end: lineEnd, radius: lineRadius, color: 'magenta' });
      }
    }

    // SET UP CLICK HANDLER, targeting only the molecule model
    const handleClick = (atom: AtomSpec) => {
      if (!atom || typeof atom.x !== 'number') return;
      
      const maxAtoms = selectionMode === 'distance' ? 2 : selectionMode === 'triangle' ? 3 : 0;
      if (maxAtoms === 0) return;

      setSelectedAtoms(prev => {
        if (prev.length >= maxAtoms) return [atom];
        if (prev.find(a => a.serial === atom.serial)) return prev;
        return [...prev, atom];
      });
    };

    if (selectionMode === 'distance' || selectionMode === 'triangle') {
      glViewer.current.setClickable(modelSpec, true, handleClick);
    } else {
      glViewer.current.setClickable(modelSpec, false, null);
    }

    // FINALIZE RENDER
    glViewer.current.zoomTo();
    glViewer.current.render();
    setIsLoading(false);

    // Cleanup function for click handler
    return () => {
      if (glViewer.current?.setClickable) {
        glViewer.current.setClickable(modelSpec, false, null);
      }
    };
  }, [
    modelData, style, colorScheme, bondScale, 
    atomScale, stickRadius, lineRadius, 
    selectionMode, selectedAtoms, selectedProjectivePoint, normalLineLength, showOriginSphere,
    originSphereOpacity, showSphere2, sphere2Opacity,
    showCylinder, cylinderRadius, cylinderHeight, showAxes,
    showCpsLines, showProjectivePoints, setIsLoading, setDistances, setMetadata,
    setSelectedProjectivePoint, setSelectedAtoms,
  ]);

  return <div ref={viewerRef} className="w-full h-full" aria-label="3D Molecule Viewer" />;
});

export default PdbViewer;
