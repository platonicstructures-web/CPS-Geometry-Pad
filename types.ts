// FIX: Removed self-import of PdbFile which was causing a conflict with the local declaration.
export type DisplayStyle = 'line' | 'stick' | 'sphere' | 'ball and stick' | 'hidden';

export interface AtomSpec {
  x: number;
  y: number;
  z: number;
  serial: number;
  [key: string]: any;
}

export type SelectionMode = 'none' | 'node' | 'distance' | 'triangle' | 'inspection';

export type Lattice = 'triangle' | 'square';

export interface MoleculeMetadata {
  title: string;
  header: string;
  source: string;
  numAtoms: number;
}

export interface Point3DWithDistance {
  coords: { x: number; y: number; z: number };
  distance: number;
}

export interface PlaneIntersectionPoint {
  coords: { x: number; y: number; z: number };
  distanceToOrigin: number;
  relativeCoords: { x: number; y: number; z: number; };
  distanceToPlaneCenter: number;
}

export interface IntersectionPoints {
  node?: Point3DWithDistance;
  antipodalNode?: Point3DWithDistance;
  primaryPlane?: PlaneIntersectionPoint;
  antipodalPlane?: PlaneIntersectionPoint;
  ellipticalSphere?: Point3DWithDistance[];
  primaryRiemannSphere?: Point3DWithDistance[];
  antipodalRiemannSphere?: Point3DWithDistance[];
}

export interface IntersectionDistances {
  primaryPlane?: number;
  primaryPlaneAngle3D?: number;
  primaryPlaneAngle2D?: number;
  antipodalPlaneAngle3D?: number;
  antipodalPlaneAngle2D?: number;
}

export interface ProjectivePointInfo {
  coords: { x: number; y: number; z: number };
  distanceToOrigin: number;
  plane: 'primary' | 'antipodal';
  relativeCoords: { x: number; y: number; z: number };
  distanceToPlaneCenter: number;
}

export interface TrianglePlaneAnalysis {
  sideLengths: [number, number, number];
  angles: [number, number, number];
}

export interface TriangleAnalysis {
  primary?: TrianglePlaneAnalysis;
  antipodal?: TrianglePlaneAnalysis;
}

export interface HoveredProjectivePointInfo {
  atomSerial: number;
  relativeCoords: { x: number; y: number; };
  plane: 'primary' | 'antipodal';
}

export interface InspectionData {
  selectedProjectedPoint: ProjectivePointInfo;
  associated3DNode: AtomSpec;
  inverted3DNode: AtomSpec | null;
  invertedProjectedPoint: ProjectivePointInfo | null;
  calculatedInvertedPoint: ProjectivePointInfo | null;
  calculatedComplexInvertedPoint: ProjectivePointInfo | null;
  inversionTestResult: string;
}


export interface PdbFile {
  id: string;
  name: string;
  description: string;
}

export interface TranscriptionEntry {
  type: 'user' | 'model';
  text: string;
}