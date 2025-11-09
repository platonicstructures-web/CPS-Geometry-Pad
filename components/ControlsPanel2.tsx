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

  const TriangleAnalysisDisplay: React.FC<{title: string; analysis: TrianglePlaneAnalysis; color: string; latticeFactor: number}> = ({title, analysis, color, latticeFactor}) => (
    <div>
      <h4 className={`font-bold text-${color}-300`}>{title}</h4>
      <div className="pl-2">
          <p>Sides: <span className="text-white">{(analysis.sideLengths[0]/latticeFactor).toFixed(3)}, {(analysis.sideLengths[1]/latticeFactor).toFixed(3)}, {(analysis.sideLengths[2]/latticeFactor).toFixed(3)}</span></p>
          <p>Angles: <span className="text-white">{analysis.angles[0].toFixed(2)}°, {analysis.angles[1].toFixed(2)}°, {analysis.angles[2].toFixed(2)}°</span></p>
      </div>
    </div>
  );

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
          {selectedAtoms.length === 0 && !selectedProjectivePoint && !inspectionData && (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Select a node, distance, or triangle to see details.</p>
            </div>
          )}
          
          {selectionMode === 'node' && intersectionPoints && intersectionPoints.length > 0 && selectedAtoms.length > 0 && (
            <div>
                <div className="flex border-b border-gray-600 mb-2">
                    {selectedAtoms.map((atom, index) => (
                        <button
                            key={atom.serial}
                            onClick={() => setActiveIntersectionTab(index)}
                            className={`px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-t-md flex-1 text-center
                                ${activeIntersectionTab === index ? 'bg-gray-700/80 text-cyan-400' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-700/50'}`}
                        >
                            Node #{atom.serial}
                        </button>
                    ))}
                </div>
                {intersectionPoints[activeIntersectionTab] && (
                    <IntersectionDetailsDisplay
                        points={intersectionPoints[activeIntersectionTab]}
                        title={`Node #${selectedAtoms[activeIntersectionTab]?.serial}`}
                        showNodeInfo={true}
                        latticeFactor={latticeFactor}
                    />
                )}
            </div>
          )}

          {selectionMode === 'distance' && distances && (
              <div className="space-y-2">
                  <p>Nodes: <span className="text-white">#{selectedAtoms[0]?.serial} & #{selectedAtoms[1]?.serial}</span></p>
                  <p>3D Distance: <span className="text-white">{(distances[0] / latticeFactor).toFixed(3)}</span></p>
                  {nodeAngle !== null && <p>Angle at Origin: <span className="text-white">{nodeAngle.toFixed(2)}°</span></p>}
                  {projectivePointsDistance && (
                      <>
                          {projectivePointsDistance.primary !== undefined && <p>Primary Plane Dist: <span className="text-purple-300">{(projectivePointsDistance.primary / latticeFactor).toFixed(3)}</span></p>}
                          {projectivePointsDistance.antipodal !== undefined && <p>Antipodal Plane Dist: <span className="text-teal-300">{(projectivePointsDistance.antipodal / latticeFactor).toFixed(3)}</span></p>}
                      </>
                  )}
                  {intersectionDistances && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                          {intersectionDistances.primaryPlane !== undefined && <p>Primary Plane Dist: <span className="text-purple-300">{(intersectionDistances.primaryPlane / latticeFactor).toFixed(3)}</span></p>}
                          {intersectionDistances.primaryPlaneAngle3D !== undefined && <p>Primary 3D Angle: <span className="text-purple-300">{intersectionDistances.primaryPlaneAngle3D.toFixed(2)}°</span></p>}
                          {intersectionDistances.primaryPlaneAngle2D !== undefined && <p>Primary 2D Angle: <span className="text-purple-300">{intersectionDistances.primaryPlaneAngle2D.toFixed(2)}°</span></p>}
                          {intersectionDistances.antipodalPlaneAngle3D !== undefined && <p className="mt-2">Antipodal 3D Angle: <span className="text-teal-300">{intersectionDistances.antipodalPlaneAngle3D.toFixed(2)}°</span></p>}
                          {intersectionDistances.antipodalPlaneAngle2D !== undefined && <p>Antipodal 2D Angle: <span className="text-teal-300">{intersectionDistances.antipodalPlaneAngle2D.toFixed(2)}°</span></p>}
                      </div>
                  )}
              </div>
          )}

          {selectionMode === 'triangle' && selectedAtoms.length === 3 && (
              <div className="space-y-3">
                  <div>
                      <h4 className="font-bold text-cyan-400">Selected Nodes:</h4>
                      <p className="pl-2">#{selectedAtoms[0].serial}, #{selectedAtoms[1].serial}, #{selectedAtoms[2].serial}</p>
                  </div>
                  {distances && (
                      <div>
                          <h4 className="font-bold text-cyan-400">Side Lengths (3D):</h4>
                          <p className="pl-2">d(1,2): <span className="text-white">{(distances[0]/latticeFactor).toFixed(3)}</span></p>
                          <p className="pl-2">d(2,3): <span className="text-white">{(distances[1]/latticeFactor).toFixed(3)}</span></p>
                          <p className="pl-2">d(1,3): <span className="text-white">{(distances[2]/latticeFactor).toFixed(3)}</span></p>
                      </div>
                  )}
                  {trianglePlaneEquation && (
                      <div>
                          <h4 className="font-bold text-cyan-400">3D Plane Equation:</h4>
                          <p className="pl-2 text-amber-300">{trianglePlaneEquation}</p>
                          <div className="pl-2 grid grid-cols-2 gap-x-2 text-xs">
                              <p>Azimuth: <span className="text-white">{trianglePlaneAzimuth?.toFixed(2)}°</span></p>
                              <p>Inclination: <span className="text-white">{trianglePlaneInclination?.toFixed(2)}°</span></p>
                              <p>Dist to Origin: <span className="text-white">{(trianglePlaneDistanceToOrigin !== null ? trianglePlaneDistanceToOrigin/latticeFactor : 0).toFixed(3)}</span></p>
                          </div>
                      </div>
                  )}
                  {closestNodeOnNormal && (
                      <div>
                          <h4 className="font-bold text-yellow-400">Closest Node on Normal:</h4>
                          <p className="pl-2 text-yellow-300">Node #{closestNodeOnNormal.serial} (Dist: {(len(vec(closestNodeOnNormal)) / latticeFactor).toFixed(3)})</p>
                      </div>
                  )}
                  {triangleAnalysis && (
                      <div className="mt-2 pt-2 border-t border-gray-700 space-y-3">
                          {triangleAnalysis.primary && <TriangleAnalysisDisplay title="Primary Plane Triangle" analysis={triangleAnalysis.primary} color="purple" latticeFactor={latticeFactor} />}
                          {triangleAnalysis.antipodal && <TriangleAnalysisDisplay title="Antipodal Plane Triangle" analysis={triangleAnalysis.antipodal} color="teal" latticeFactor={latticeFactor} />}
                      </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-700 space-y-2">
                      <h4 className="font-bold text-cyan-400">Plane Visualization:</h4>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showTrianglePlane} onChange={(e) => onShowTrianglePlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                        <span className="text-gray-300 text-sm">Show Triangle Plane</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={hideNodesNotOnTrianglePlane} onChange={(e) => onHideNodesNotOnTrianglePlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                        <span className="text-gray-300 text-sm">Hide nodes not on plane</span>
                      </label>
                      <div className="pt-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                              <input type="checkbox" checked={showParallelPlane} onChange={(e) => onShowParallelPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                              <span className="text-gray-300 text-sm">Show Parallel Plane</span>
                          </label>
                          <div className="mt-1">
                            <label htmlFor="parallel-plane-dist-slider" className="block text-xs font-medium text-gray-400">
                              Distance: <span className="font-bold text-cyan-400">{(parallelPlaneDistance / latticeFactor).toFixed(2)}</span>
                            </label>
                            <input
                              id="parallel-plane-dist-slider" type="range" min={-latticeFactor*5} max={latticeFactor*5} step="0.1" value={parallelPlaneDistance}
                              onChange={(e) => onParallelPlaneDistanceChange(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50" disabled={!showParallelPlane}
                            />
                          </div>
                           <label className="flex items-center space-x-2 cursor-pointer mt-2">
                            <input type="checkbox" checked={isolateNodesOnParallelPlane} onChange={(e) => onIsolateNodesOnParallelPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                            <span className="text-gray-300 text-sm">Isolate nodes on parallel plane</span>
                          </label>
                      </div>
                  </div>
              </div>
          )}

          {selectionMode === 'inspection' && (
              <div>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={isProjectivePointModeActive}
                        onChange={(e) => onSetProjectivePointModeActive(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                      />
                      <span className="text-gray-300">Click on projected points</span>
                  </label>
                  {inspectionData ? (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                      <div className="flex border-b border-gray-600 mb-2">
                          {(['reflection', 'inversion', 'multiplication'] as const).map(tab => (
                              <button
                                  key={tab}
                                  onClick={() => onActiveInspectionTabChange(tab)}
                                  disabled={tab !== 'reflection' && tab !== 'inversion'} // Multiplication not implemented
                                  className={`px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-t-md flex-1 text-center disabled:opacity-50
                                      ${activeInspectionTab === tab ? 'bg-gray-700/80 text-cyan-400' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-700/50'}`}
                              >
                                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </button>
                          ))}
                      </div>

                      {activeInspectionTab === 'reflection' && (
                          <>
                              <p>Selected Point on <span className="text-white">{inspectionData.selectedProjectedPoint.plane}</span> plane</p>
                              <p>Associated Node: <span className="text-white">#{inspectionData.associated3DNode.serial}</span></p>
                              {lattice === 'square' ? (
                                  <>
                                      <p>Inverted Node: <span className="text-white">{inspectionData.inverted3DNode ? `#${inspectionData.inverted3DNode.serial}` : 'Not found'}</span></p>
                                      <p>Inverted Projected Point: <span className="text-white">{inspectionData.invertedProjectedPoint ? 'Found' : 'Not found'}</span></p>
                                      <p>Test Result: <span className={inspectionData.inversionTestResult === "Passed" ? "text-green-400" : "text-red-400"}>{inspectionData.inversionTestResult}</span></p>
                                  </>
                              ) : (
                                  <p className="text-gray-500 italic">Inversion analysis only for Square lattice.</p>
                              )}
                          </>
                      )}

                      {activeInspectionTab === 'inversion' && (
                          <>
                              <div className="flex items-center gap-4 text-sm mb-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="inversion-type" value="geometric" checked={inversionType === 'geometric'} onChange={() => onInversionTypeChange('geometric')} className="h-4 w-4 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                                      <span>Geometric</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="inversion-type" value="complex" checked={inversionType === 'complex'} onChange={() => onInversionTypeChange('complex')} className="h-4 w-4 bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                                      <span>Complex</span>
                                  </label>
                              </div>
                              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                                  <input type="checkbox" checked={showCalculatedInversionPoint} onChange={(e) => onShowCalculatedInversionPointChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                                  <span className="text-gray-300">Show calculated point</span>
                              </label>
                              {/* FIX: Corrected typo in property name from 'calculatedInversionPoint' to 'calculatedInvertedPoint'. */}
                              {inspectionData.calculatedInvertedPoint && (
                                  <div className="mt-2">
                                     <h4 className="font-bold text-orange-400">Calculated Geometric Inversion:</h4>
                                     {/* FIX: Corrected typo in property name from 'calculatedInversionPoint' to 'calculatedInvertedPoint'. */}
                                     <PlaneIntersectionDisplay data={inspectionData.calculatedInvertedPoint} label="" labelColor="text-orange-300" latticeFactor={latticeFactor}/>
                                  </div>
                              )}
                              {inspectionData.calculatedComplexInvertedPoint && (
                                  <div className="mt-2">
                                     <h4 className="font-bold text-orange-400">Calculated Complex Inversion:</h4>
                                     <PlaneIntersectionDisplay data={inspectionData.calculatedComplexInvertedPoint} label="" labelColor="text-orange-300" latticeFactor={latticeFactor}/>
                                  </div>
                              )}
                          </>
                      )}
                      
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">Select a projected point to inspect.</p>
                  )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ControlsPanel2;