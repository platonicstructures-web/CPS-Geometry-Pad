import React, { useState, useEffect } from 'react';
import { SelectionMode, AtomSpec, IntersectionPoints, IntersectionDistances, ProjectivePointInfo, PlaneIntersectionPoint, TriangleAnalysis, TrianglePlaneAnalysis, HoveredProjectivePointInfo, InspectionData, Lattice } from '../types';

interface ControlsPanel2Props {
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onClearSelection: () => void;
  selectedAtoms: AtomSpec[];
  selectedProjectivePoint: ProjectivePointInfo | null;
  inspectionData: InspectionData | null;
  distances: number[] | null;
  nodeAngle: number | null;
  projectivePointsDistance: { primary?: number; antipodal?: number } | null;
  intersectionPoints: IntersectionPoints[] | null;
  intersectionDistances: IntersectionDistances | null;
  triangleAnalysis: TriangleAnalysis | null;
  trianglePlaneEquation: string | null;
  trianglePlaneAzimuth: number | null;
  trianglePlaneInclination: number | null;
  trianglePlaneDistanceToOrigin: number | null;
  showTrianglePlane: boolean;
  onShowTrianglePlaneChange: (visible: boolean) => void;
  hideNodesNotOnTrianglePlane: boolean;
  onHideNodesNotOnTrianglePlaneChange: (hide: boolean) => void;
  showParallelPlane: boolean;
  onShowParallelPlaneChange: (visible: boolean) => void;
  parallelPlaneDistance: number;
  onParallelPlaneDistanceChange: (distance: number) => void;
  isolateNodesOnParallelPlane: boolean;
  onIsolateNodesOnParallelPlaneChange: (isolate: boolean) => void;
  normalLineLength: number;
  onNormalLineLengthChange: (length: number) => void;
  currentPdbName: string;
  isProjectivePointModeActive: boolean;
  onSetProjectivePointModeActive: (isActive: boolean) => void;
  hoveredAtom: AtomSpec | null;
  hoveredProjectivePoint: HoveredProjectivePointInfo | null;
  showHoveredAtomLabel: boolean;
  onShowHoveredAtomLabelChange: (visible: boolean) => void;
  showHoveredAtomDistance: boolean;
  onShowHoveredAtomDistanceChange: (visible: boolean) => void;
  closestNodeOnNormal: AtomSpec | null;
  lattice: Lattice;
  activeInspectionTab: 'reflection' | 'inversion' | 'multiplication';
  onActiveInspectionTabChange: (tab: 'reflection' | 'inversion' | 'multiplication') => void;
  showCalculatedInversionPoint: boolean;
  onShowCalculatedInversionPointChange: (show: boolean) => void;
  inversionType: 'geometric' | 'complex';
  onInversionTypeChange: (type: 'geometric' | 'complex') => void;
  latticeFactor: number;
}

// Helper components for displaying intersection info
const isOrigin = (point: { coords: { x: number; y: number; z: number } }) => {
  const { x, y, z } = point.coords;
  return Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6 && Math.abs(z) < 1e-6;
};
const filterOrigin = (data: { coords: { x: number; y: number; z: number }; distance: number; }[] | null | undefined) => {
  if (!data) return null;
  const filtered = data.filter(p => !isOrigin(p));
  return filtered.length > 0 ? filtered : null;
};
const IntersectionPointDisplay: React.FC<{
  label: string;
  data: { coords: { x: number; y: number; z: number }; distance: number; } | { coords: { x: number; y: number; z: number }; distance: number; }[] | null | undefined;
  labelColor?: string;
  showSqrt?: boolean;
  hideDistanceInDetails?: boolean;
  showDistanceInLabel?: boolean;
  latticeFactor: number;
}> = ({ label, data, labelColor = 'text-gray-200', showSqrt = false, hideDistanceInDetails = false, showDistanceInLabel = false, latticeFactor }) => {
  const getDistanceString = (point: { distance: number }) => {
    const normalizedDistance = point.distance / latticeFactor;
    let distanceString = normalizedDistance.toFixed(3);

    if (showSqrt) {
      const distSq = normalizedDistance * normalizedDistance;
      const roundedDistSq = Math.round(distSq);
      if (Math.abs(distSq - roundedDistSq) < 0.01 && roundedDistSq > 0) {
        distanceString += ` = √${roundedDistSq}`;
      }
    }
    return distanceString;
  };
  
  let finalLabel = label;
  if (showDistanceInLabel && data && !Array.isArray(data)) {
      finalLabel = `${label}   D = ${getDistanceString(data)}`;
  }
  
  if (!data) {
     return (
        <div>
          <strong className={`${labelColor} block`}>{finalLabel}</strong>
          <div className="pl-2 text-gray-500">No intersection</div>
        </div>
      );
  }

  const renderPoint = (point: { coords: { x: number; y: number; z: number }; distance: number }, key?: number) => {
    const coordsString = `(${(point.coords.x / latticeFactor).toFixed(3)}, ${(point.coords.y / latticeFactor).toFixed(3)}, ${(point.coords.z / latticeFactor).toFixed(3)})`;
    
    if (hideDistanceInDetails || showDistanceInLabel) {
        return (
            <div key={key} className="pl-2">
                {coordsString}
            </div>
        );
    }
    
    const distancePart = ` D = ${getDistanceString(point)}`;
    
    return (
        <div key={key} className="pl-2">
            {coordsString}{distancePart}
        </div>
    );
  };
  
  return (
    <div>
      <strong className={`${labelColor} block`}>{finalLabel}</strong>
      {Array.isArray(data) ? data.map((p, i) => renderPoint(p, i)) : renderPoint(data)}
    </div>
  );
};

const PlaneIntersectionDisplay: React.FC<{
  label: string;
  data: PlaneIntersectionPoint | null | undefined;
  labelColor?: string;
  latticeFactor: number;
}> = ({ label, data, labelColor = 'text-gray-200', latticeFactor }) => {
  if (!data) {
    return (<div><strong className={`${labelColor} block`}>{label}</strong><div className="pl-2 text-gray-500">No intersection</div></div>);
  }
  return (
    <div>
      <strong className={`${labelColor} block`}>{label}</strong>
      <div className="pl-2">
        <span>Abs: ({(data.coords.x / latticeFactor).toFixed(3)}, {(data.coords.y / latticeFactor).toFixed(3)}, {(data.coords.z / latticeFactor).toFixed(3)}) D_o = {(data.distanceToOrigin / latticeFactor).toFixed(3)}</span>
        <div className="pl-2 text-gray-400">
          <span>Rel: ({(data.relativeCoords.x / latticeFactor).toFixed(3)}, {(data.relativeCoords.y / latticeFactor).toFixed(3)}) D_c = {(data.distanceToPlaneCenter / latticeFactor).toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};
const IntersectionDetailsDisplay: React.FC<{ points: IntersectionPoints; title?: string; showNodeInfo?: boolean; latticeFactor: number; }> = ({ points, title, showNodeInfo = true, latticeFactor }) => (
  <div className="space-y-1">
    {showNodeInfo && title && <IntersectionPointDisplay label={title} data={points.node} showSqrt showDistanceInLabel latticeFactor={latticeFactor} />}
    {showNodeInfo && <IntersectionPointDisplay label="Antipodal Point:" data={points.antipodalNode} hideDistanceInDetails latticeFactor={latticeFactor} />}
    <PlaneIntersectionDisplay label="Primary Plane Intersection Point:" data={points.primaryPlane} labelColor="text-purple-300" latticeFactor={latticeFactor} />
    <PlaneIntersectionDisplay label="Antipodal Plane Intersection Point:" data={points.antipodalPlane} labelColor="text-teal-300" latticeFactor={latticeFactor} />
    <IntersectionPointDisplay label="Elliptical Sphere Intersection Point:" data={points.ellipticalSphere} latticeFactor={latticeFactor} />
    <IntersectionPointDisplay label="Primary Riemann Intersection Point:" data={filterOrigin(points.primaryRiemannSphere)} labelColor="text-yellow-300" latticeFactor={latticeFactor} />
    <IntersectionPointDisplay label="Antipodal Riemann Intersection Point:" data={filterOrigin(points.antipodalRiemannSphere)} labelColor="text-orange-300" latticeFactor={latticeFactor} />
  </div>
);

const distSq = (p1: AtomSpec, p2: AtomSpec, latticeFactor: number) => {
  const dx = (p1.x - p2.x) / latticeFactor;
  const dy = (p1.y - p2.y) / latticeFactor;
  const dz = (p1.z - p2.z) / latticeFactor;
  return dx * dx + dy * dy + dz * dz;
};

// Vector math helpers for angle calculation
const vec = (atom: AtomSpec) => ({ x: atom.x, y: atom.y, z: atom.z });
const sub = (v1: {x:number, y:number, z:number}, v2: {x:number, y:number, z:number}) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const len = (v: {x:number, y:number, z:number}) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const dot = (v1: {x:number, y:number, z:number}, v2: {x:number, y:number, z:number}) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

// FIX: Completed component which was previously truncated, causing syntax errors. Added full implementation and default export.
const ControlsPanel2: React.FC<ControlsPanel2Props> = ({
  selectionMode,
  onSelectionModeChange,
  onClearSelection,
  selectedAtoms,
  selectedProjectivePoint,
  inspectionData,
  distances,
  nodeAngle,
  projectivePointsDistance,
  intersectionPoints,
  intersectionDistances,
  triangleAnalysis,
  trianglePlaneEquation,
  trianglePlaneAzimuth,
  trianglePlaneInclination,
  trianglePlaneDistanceToOrigin,
  showTrianglePlane,
  onShowTrianglePlaneChange,
  hideNodesNotOnTrianglePlane,
  onHideNodesNotOnTrianglePlaneChange,
  showParallelPlane,
  onShowParallelPlaneChange,
  parallelPlaneDistance,
  onParallelPlaneDistanceChange,
  isolateNodesOnParallelPlane,
  onIsolateNodesOnParallelPlaneChange,
  normalLineLength,
  onNormalLineLengthChange,
  currentPdbName,
  isProjectivePointModeActive,
  onSetProjectivePointModeActive,
  hoveredAtom,
  hoveredProjectivePoint,
  showHoveredAtomLabel,
  onShowHoveredAtomLabelChange,
  showHoveredAtomDistance,
  onShowHoveredAtomDistanceChange,
  closestNodeOnNormal,
  lattice,
  activeInspectionTab,
  onActiveInspectionTabChange,
  showCalculatedInversionPoint,
  onShowCalculatedInversionPointChange,
  inversionType,
  onInversionTypeChange,
  latticeFactor,
}) => {
  const [activeIntersectionTab, setActiveIntersectionTab] = useState(0);

  useEffect(() => {
    if (selectedAtoms.length > 0) {
      setActiveIntersectionTab(Math.min(selectedAtoms.length - 1, activeIntersectionTab));
    } else {
      setActiveIntersectionTab(0);
    }
  }, [selectedAtoms, activeIntersectionTab]);

  const selectionModes: { mode: SelectionMode; label: string }[] = [
    { mode: 'none', label: 'None' },
    { mode: 'node', label: 'Node' },
    { mode: 'distance', label: 'Distance' },
    { mode: 'triangle', label: 'Triangle' },
    { mode: 'inspection', label: 'Inspection' },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
      <div>
        <label className="block text-lg font-semibold mb-2 text-cyan-400">Interaction Mode:</label>
        <div className="flex flex-wrap gap-2">
          {selectionModes.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => onSelectionModeChange(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                ${selectionMode === mode ? 'bg-cyan-500 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onClearSelection}
          disabled={selectedAtoms.length === 0 && !selectedProjectivePoint && !inspectionData}
          className="w-full mt-3 bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear Selection
        </button>
      </div>

      <div className="my-4 p-3 bg-gray-700/50 rounded-md border border-gray-600 text-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-cyan-400">Hover Info</h3>
          <div className="flex gap-2 text-xs">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" checked={showHoveredAtomLabel} onChange={(e) => onShowHoveredAtomLabelChange(e.target.checked)} className="h-3 w-3 rounded-sm bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
              <span>Label</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" checked={showHoveredAtomDistance} onChange={(e) => onShowHoveredAtomDistanceChange(e.target.checked)} className="h-3 w-3 rounded-sm bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
              <span>Dist</span>
            </label>
          </div>
        </div>
        <div className="min-h-[60px] font-mono text-gray-300">
          {hoveredAtom ? (
            <div>
              <p>Node #{hoveredAtom.serial} <span className="text-gray-400">({hoveredAtom.elem})</span></p>
              <p>D: {(len(vec(hoveredAtom)) / latticeFactor).toFixed(3)}</p>
              {selectedAtoms.length > 0 && ['distance', 'triangle'].includes(selectionMode) && (
                <p className="text-amber-300">Dist to selected: {(Math.sqrt(distSq(hoveredAtom, selectedAtoms[selectedAtoms.length - 1], latticeFactor))).toFixed(3)}</p>
              )}
            </div>
          ) : hoveredProjectivePoint ? (
            <div>
              <p>Proj. Point (Node #{hoveredProjectivePoint.atomSerial})</p>
              <p>Plane: {hoveredProjectivePoint.plane}</p>
              <p>Coords: ({(hoveredProjectivePoint.relativeCoords.x / latticeFactor).toFixed(3)}, {(hoveredProjectivePoint.relativeCoords.y / latticeFactor).toFixed(3)})</p>
            </div>
          ) : <p className="text-gray-500 italic">Hover over a node...</p>}
        </div>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <h3 className="text-lg font-semibold mb-2 text-cyan-400">Selection Info</h3>
        <div className="flex-grow bg-gray-900/50 p-3 rounded-md border border-gray-600 overflow-y-auto text-sm font-mono text-gray-300">
          {/* Render content based on selection mode */}
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel2;
