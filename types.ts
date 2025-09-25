export type DisplayStyle = 'line' | 'stick' | 'sphere' | 'ball and stick' | 'hidden';
export type ColorScheme = 'spectrum' | 'element' | 'residue';
export type SelectionMode = 'none' | 'distance' | 'triangle' | 'projective';

export interface PdbFile {
  id: string;
  name: string;
  description: string;
}

export interface AtomSpec {
  resn: string;
  resi: number;
  chain: string;
  atom: string;
  elem: string;
  x: number;
  y: number;
  z: number;
  serial: number;
}

export interface MoleculeMetadata {
  title: string;
  header: string;
  source: string;
  numAtoms: number;
}