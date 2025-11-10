import React, { useState, useEffect } from 'react';
import { SelectionMode, AtomSpec, IntersectionPoints, IntersectionDistances, ProjectivePointInfo, PlaneIntersectionPoint, TriangleAnalysis, TrianglePlaneAnalysis, HoveredProjectivePointInfo, InspectionData, Lattice } from '../types';

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
  const [activeNodeTab, setActiveNodeTab] = useState<'node' | 'projective'>('node');
  const [activeDistanceTab, setActiveDistanceTab] = useState<'node1' | 'node2' | 'dist' | 'projective'>('node1');
  const [activeTriangleTab, setActiveTriangleTab] = useState<'node1' | 'node2' | 'node3' | 'dist' | 'projective'>('node1');
  
  const selectionModes: { mode: SelectionMode; label: string }[] = [
      { mode: 'node', label: 'Node' },
      { mode: 'distance', label: 'Distance' },
      { mode: 'triangle', label: 'Triangle' },
      { mode: 'inspection', label: 'Inspection' },
  ];
  
  useEffect(() => {
    const isActive = 
        (selectionMode === 'node' && activeNodeTab === 'projective') ||
        (selectionMode === 'distance' && activeDistanceTab === 'projective') ||
        (selectionMode === 'triangle' && activeTriangleTab === 'projective') ||
        (selectionMode === 'inspection');
    onSetProjectivePointModeActive(isActive);
  }, [selectionMode, activeNodeTab, activeDistanceTab, activeTriangleTab, onSetProjectivePointModeActive]);

  useEffect(() => {
    setActiveNodeTab('node');
    setActiveDistanceTab('node1');
    setActiveTriangleTab('node1');
  }, [selectionMode]);


  const getSelectionInfoText = () => {
    if (isProjectivePointModeActive) {
        if (selectionMode === 'inspection') {
            return 'Click a projected point on a plane to inspect it.';
        }
        return 'Click a projective point on the plane.';
    }
    if (selectionMode === 'none') {
      return 'Enable an interaction mode to begin.';
    }
     if (selectionMode === 'node') {
      return 'Click on a single node in the viewer.';
    }
    if (selectionMode === 'distance') {
      return `Click on ${selectedAtoms.length < 2 ? 'two' : ''} nodes in the viewer.`;
    }
    if (selectionMode === 'triangle') {
      return `Click on ${selectedAtoms.length < 3 ? 'three' : ''} nodes in the viewer.`;
    }
    if (selectionMode === 'inspection') {
      return 'Enable clicking on projected points to begin inspection.';
    }
    return '';
  };
  
  const calculateAngles = (d12: number, d23: number, d13: number): [number, number, number] | null => {
    // Law of Cosines to find angles
    const cosAngle1 = (d12 * d12 + d13 * d13 - d23 * d23) / (2 * d12 * d13);
    const cosAngle2 = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
    const cosAngle3 = (d23 * d23 + d13 * d13 - d12 * d12) / (2 * d23 * d13);
  
    if ([cosAngle1, cosAngle2, cosAngle3].some(cos => cos < -1.00001 || cos > 1.00001)) {
        return null; // Invalid triangle
    }
  
    const clamp = (val: number) => Math.max(-1, Math.min(1, val));

    const angle1 = Math.acos(clamp(cosAngle1)) * (180 / Math.PI);
    const angle2 = Math.acos(clamp(cosAngle2)) * (180 / Math.PI);
    const angle3 = Math.acos(clamp(cosAngle3)) * (180 / Math.PI);
  
    return [angle1, angle2, angle3];
  };

  const ProjectivePointDetails: React.FC<{ point: ProjectivePointInfo }> = ({ point }) => {
      const { coords, distanceToOrigin, plane, relativeCoords, distanceToPlaneCenter } = point;
      return (
        <div className="space-y-2">
            <div>
                <div className="font-bold text-cyan-400">Selected Projective Point:</div>
                <div className="pl-2">
                    <div>Coords: ({(coords.x / latticeFactor).toFixed(3)}, {(coords.y / latticeFactor).toFixed(3)}, {(coords.z / latticeFactor).toFixed(3)})</div>
                    <div>Distance to Origin: {(distanceToOrigin / latticeFactor).toFixed(3)}</div>
                </div>
            </div>
            <div>
                <div className="font-bold text-cyan-400">Relative to {plane === 'primary' ? 'Primary' : 'Antipodal'} Plane Center:</div>
                <div className="pl-2">
                    <div>Coords: ({(relativeCoords.x / latticeFactor).toFixed(3)}, {(relativeCoords.y / latticeFactor).toFixed(3)}, {(relativeCoords.z / latticeFactor).toFixed(3)})</div>
                    <div>Distance: {(distanceToPlaneCenter / latticeFactor).toFixed(3)}</div>
                </div>
            </div>
        </div>
      );
  };

  const TriangleAnalysisDisplay: React.FC<{
      label: string;
      analysis: TrianglePlaneAnalysis | undefined;
      labelColor?: string;
    }> = ({ label, analysis, labelColor = 'text-gray-200' }) => {
      if (!analysis) {
        return (
          <div>
            <div className={`font-bold ${labelColor}`}>{label}</div>
            <div className="pl-2 text-gray-500">No projected triangle</div>
          </div>
        );
      }
      const { sideLengths, angles } = analysis;
      // Note: angles array is [angle at p1, angle at p2, angle at p3]
      // angle opposite side 1-2 (p3) is angles[2]
      // angle opposite side 2-3 (p1) is angles[0]
      // angle opposite side 1-3 (p2) is angles[1]
      return (
        <div>
          <div className={`font-bold ${labelColor}`}>{label}</div>
          <ul className="text-sm list-inside pl-2 font-normal font-mono">
            <li>1-2: {(sideLengths[0] / latticeFactor).toFixed(3)} / <span className="text-yellow-300">{angles[2].toFixed(1)}°</span></li>
            <li>2-3: {(sideLengths[1] / latticeFactor).toFixed(3)} / <span className="text-yellow-300">{angles[0].toFixed(1)}°</span></li>
            <li>1-3: {(sideLengths[2] / latticeFactor).toFixed(3)} / <span className="text-yellow-300">{angles[1].toFixed(1)}°</span></li>
          </ul>
        </div>
      );
  };
  
  const angles = (distances && distances.length === 3) ? calculateAngles(distances[0], distances[1], distances[2]) : null;

  const getDistanceWithSqrt = (distance: number): string => {
    const normalizedDistance = distance / latticeFactor;
    const distSq = normalizedDistance * normalizedDistance;
    const roundedDistSq = Math.round(distSq);
    let sqrtDisplay = '';
    if (Math.abs(distSq - roundedDistSq) < 0.01 && roundedDistSq > 0) {
        sqrtDisplay = ` = √${roundedDistSq}`;
    }
    return `${normalizedDistance.toFixed(3)}${sqrtDisplay}`;
  };

  const generateInfoText = () => {
    let text = `CPS Geometry Pad - Saved Info\n`;
    text += `Date: ${new Date().toLocaleString()}\n`;
    text += `File: ${currentPdbName}\n`;
    text += `==================================\n\n`;
    text += `Selection Mode: ${selectionMode}\n\n`;

    const formatPoint = (p: { coords: { x: number; y: number; z: number; }; distance: number; }) => `(${(p.coords.x / latticeFactor).toFixed(3)}, ${(p.coords.y / latticeFactor).toFixed(3)}, ${(p.coords.z / latticeFactor).toFixed(3)}) D = ${(p.distance / latticeFactor).toFixed(3)}`;
    const formatPointList = (data: any[] | { coords: { x: number; y: number; z: number; }; distance: number; }) => Array.isArray(data) ? data.map(p => `  ${formatPoint(p)}`).join('\n') : `  ${formatPoint(data)}`;

    const formatPlanePoint = (p: PlaneIntersectionPoint) => {
        let text = `  Abs: (${(p.coords.x / latticeFactor).toFixed(3)}, ${(p.coords.y / latticeFactor).toFixed(3)}, ${(p.coords.z / latticeFactor).toFixed(3)}) D_o = ${(p.distanceToOrigin / latticeFactor).toFixed(3)}\n`;
        text += `    Rel: (${(p.relativeCoords.x / latticeFactor).toFixed(3)}, ${(p.relativeCoords.y / latticeFactor).toFixed(3)}) D_c = ${(p.distanceToPlaneCenter / latticeFactor).toFixed(3)}`;
        return text;
    };

    if ((selectionMode === 'node' || selectionMode === 'distance' || selectionMode === 'triangle') && intersectionPoints && intersectionPoints.length > 0) {
      intersectionPoints.forEach((points, index) => {
        text += `--- Node ${selectedAtoms[index]?.serial || `[${index + 1}]`} Details ---\n`;
        if (points.node) text += `Selected Node: ${formatPoint(points.node)}\n`;
        if (points.antipodalNode) text += `Antipodal Point: ${formatPoint(points.antipodalNode)}\n`;
        text += `Primary Plane Int: ${points.primaryPlane ? `\n${formatPlanePoint(points.primaryPlane)}` : 'No intersection'}\n`;
        text += `Antipodal Plane Int: ${points.antipodalPlane ? `\n${formatPlanePoint(points.antipodalPlane)}` : 'No intersection'}\n`;
        text += `Elliptical Sphere Int:\n${points.ellipticalSphere ? formatPointList(points.ellipticalSphere) : '  No intersection'}\n`;
        const filteredPrimary = filterOrigin(points.primaryRiemannSphere);
        text += `Primary Riemann Int:\n${filteredPrimary ? formatPointList(filteredPrimary) : '  No intersection'}\n`;
        const filteredAntipodal = filterOrigin(points.antipodalRiemannSphere);
        text += `Antipodal Riemann Int:\n${filteredAntipodal ? formatPointList(filteredAntipodal) : '  No intersection'}\n\n`;
      });
    } else if (selectedAtoms.length > 0) {
      selectedAtoms.forEach(atom => {
        text += `Node ${atom.serial}: (${(atom.x / latticeFactor).toFixed(3)}, ${(atom.y / latticeFactor).toFixed(3)}, ${(atom.z / latticeFactor).toFixed(3)})\n`;
      });
    }

    if (selectedProjectivePoint) {
      const { coords, distanceToOrigin, plane, relativeCoords, distanceToPlaneCenter } = selectedProjectivePoint;
      text += `\n--- Selected Projective Point ---\n`;
      text += `Absolute Coords: (${(coords.x / latticeFactor).toFixed(3)}, ${(coords.y / latticeFactor).toFixed(3)}, ${(coords.z / latticeFactor).toFixed(3)})\n`;
      text += `Distance to Origin: ${(distanceToOrigin / latticeFactor).toFixed(3)}\n\n`;
      text += `Relative to ${plane === 'primary' ? 'Primary' : 'Antipodal'} Plane Center:\n`;
      text += `  Relative Coords: (${(relativeCoords.x / latticeFactor).toFixed(3)}, ${(relativeCoords.y / latticeFactor).toFixed(3)}, ${(relativeCoords.z / latticeFactor).toFixed(3)})\n`;
      text += `  Distance to Center: ${(distanceToPlaneCenter / latticeFactor).toFixed(3)}\n`;
    }

    if (distances && distances.length > 0) {
      text += `\n--- Measurements ---\n`;
      if (selectionMode === 'distance') {
        if (nodeAngle !== null) text += `Angle between selected nodes: ${nodeAngle.toFixed(1)}°\n\n`;
        text += `Distances between:\n`;
        text += `  Selected Nodes: ${(distances[0] / latticeFactor).toFixed(3)}\n`;
        if (intersectionDistances?.primaryPlane != null) {
          text += `  Primary Plane Int Points: ${(intersectionDistances.primaryPlane / latticeFactor).toFixed(3)}\n`;
          if (intersectionDistances.primaryPlaneAngle3D != null) {
              text += `    3D Angle: ${intersectionDistances.primaryPlaneAngle3D.toFixed(1)}°\n`;
          }
          if (intersectionDistances.primaryPlaneAngle2D != null) {
              text += `    2D Angle: ${intersectionDistances.primaryPlaneAngle2D.toFixed(1)}°\n`;
          }
        }
        if (intersectionDistances?.antipodalPlaneAngle3D != null || intersectionDistances?.antipodalPlaneAngle2D != null) {
            text += `  Antipodal Plane Angles:\n`;
            if (intersectionDistances.antipodalPlaneAngle3D != null) {
                text += `    3D Angle: ${intersectionDistances.antipodalPlaneAngle3D.toFixed(1)}°\n`;
            }
            if (intersectionDistances.antipodalPlaneAngle2D != null) {
                text += `    2D Angle: ${intersectionDistances.antipodalPlaneAngle2D.toFixed(1)}°\n`;
            }
        }
        if (projectivePointsDistance?.primary) text += `  Primary Proj. Distance: ${(projectivePointsDistance.primary / latticeFactor).toFixed(3)}\n`;
        if (projectivePointsDistance?.antipodal) text += `  Antipodal Proj. Distance: ${(projectivePointsDistance.antipodal / latticeFactor).toFixed(3)}\n`;
      }
      if (selectionMode === 'triangle' && distances.length === 3 && angles) {
        text += `Original Triangle:\n`;
        text += `  1-2: ${(distances[0] / latticeFactor).toFixed(3)} / ${angles[2].toFixed(1)}°\n`;
        text += `  2-3: ${(distances[1] / latticeFactor).toFixed(3)} / ${angles[0].toFixed(1)}°\n`;
        text += `  1-3: ${(distances[2] / latticeFactor).toFixed(3)} / ${angles[1].toFixed(1)}°\n\n`;
        if (triangleAnalysis?.primary) {
            const { sideLengths: s, angles: a } = triangleAnalysis.primary;
            text += `Primary Plane Triangle:\n`;
            text += `  1-2: ${(s[0] / latticeFactor).toFixed(3)} / ${a[2].toFixed(1)}°\n`;
            text += `  2-3: ${(s[1] / latticeFactor).toFixed(3)} / ${a[0].toFixed(1)}°\n`;
            text += `  1-3: ${(s[2] / latticeFactor).toFixed(3)} / ${a[1].toFixed(1)}°\n\n`;
        }
        if (triangleAnalysis?.antipodal) {
            const { sideLengths: s, angles: a } = triangleAnalysis.antipodal;
            text += `Antipodal Plane Triangle:\n`;
            text += `  1-2: ${(s[0] / latticeFactor).toFixed(3)} / ${a[2].toFixed(1)}°\n`;
            text += `  2-3: ${(s[1] / latticeFactor).toFixed(3)} / ${a[0].toFixed(1)}°\n`;
            text += `  1-3: ${(s[2] / latticeFactor).toFixed(3)} / ${a[1].toFixed(1)}°\n\n`;
        }
        if (trianglePlaneEquation) {
            text += `Plane Equation: ${trianglePlaneEquation}\n\n`;
        }
      }
    }

    return text;
  };

  const handleSaveInfo = () => {
    const content = generateInfoText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cps_geometry_info.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const hasDataToSave = selectedAtoms.length > 0 || !!selectedProjectivePoint || !!distances || !!intersectionPoints;
  
  const tabButtonClass = (isActive: boolean) => 
    `px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-cyan-500 rounded-t-md flex-1 text-center
    ${isActive ? 'bg-gray-700 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'}`;

  let angleAtSecondNode: number | null = null;
  if (hoveredAtom && showHoveredAtomDistance && selectionMode === 'triangle' && selectedAtoms.length === 2 && hoveredAtom.serial !== selectedAtoms[0].serial && hoveredAtom.serial !== selectedAtoms[1].serial) {
    const p1 = vec(selectedAtoms[0]);
    const p2 = vec(selectedAtoms[1]);
    const p3 = vec(hoveredAtom);

    const v1 = sub(p1, p2); // Vector from p2 to p1
    const v2 = sub(p3, p2); // Vector from p2 to p3

    const v1Len = len(v1);
    const v2Len = len(v2);

    if (v1Len > 1e-6 && v2Len > 1e-6) {
        const cosAngle = dot(v1, v2) / (v1Len * v2Len);
        const clampedCos = Math.max(-1, Math.min(1, cosAngle)); // Clamp to avoid Math.acos errors
        angleAtSecondNode = Math.acos(clampedCos) * (180 / Math.PI);
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Measurements and Inspection:</h3>
      
      <div className="mb-4 p-3 bg-gray-700/50 rounded-md border border-gray-600">
        <h4 className="text-md font-semibold mb-2 text-cyan-400">Hover Info</h4>
        <div className="flex gap-4 mb-2">
            <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                    type="checkbox"
                    checked={showHoveredAtomLabel}
                    onChange={(e) => onShowHoveredAtomLabelChange(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">Show Node Label</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                    type="checkbox"
                    checked={showHoveredAtomDistance}
                    onChange={(e) => onShowHoveredAtomDistanceChange(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">Show Details</span>
            </label>
        </div>
        <div className="text-sm text-gray-400 font-mono min-h-[40px]">
            {hoveredAtom ? (
                <div className="space-y-1">
                    {(showHoveredAtomLabel || showHoveredAtomDistance) && (
                      <div>
                        {showHoveredAtomLabel && (
                            <span className="mr-4">
                                Node: <span className="text-white font-semibold">#{hoveredAtom.serial}</span>
                            </span>
                        )}
                        {showHoveredAtomDistance && (
                            <span>
                                Distance²(Origin): <span className="text-white font-semibold">
                                    {(((hoveredAtom.x / latticeFactor)**2) + ((hoveredAtom.y / latticeFactor)**2) + ((hoveredAtom.z / latticeFactor)**2)).toFixed(3)}
                                </span>
                            </span>
                        )}
                      </div>
                    )}
                    
                    {showHoveredAtomDistance && (selectionMode === 'distance' || selectionMode === 'triangle') && selectedAtoms.length >= 1 && hoveredAtom.serial !== selectedAtoms[0].serial && (
                      <div>
                        Dist² to #{selectedAtoms[0].serial}:{' '}
                        <span className="text-white font-semibold">
                          {distSq(selectedAtoms[0], hoveredAtom, latticeFactor).toFixed(3)}
                        </span>
                      </div>
                    )}

                    {showHoveredAtomDistance && selectionMode === 'triangle' && selectedAtoms.length === 2 && hoveredAtom.serial !== selectedAtoms[1].serial && (
                      <div>
                        Dist² to #{selectedAtoms[1].serial}:{' '}
                        <span className="text-white font-semibold">
                          {distSq(selectedAtoms[1], hoveredAtom, latticeFactor).toFixed(3)}
                        </span>
                      </div>
                    )}
                    {angleAtSecondNode !== null && (
                      <div>
                        Angle at #{selectedAtoms[1].serial}:{' '}
                        <span className="text-white font-semibold">
                          {angleAtSecondNode.toFixed(1)}°
                        </span>
                      </div>
                    )}
                </div>
            ) : (
                <p className="italic">Hover over a node in the viewer.</p>
            )}
        </div>
      </div>

      <div className="space-y-3 flex-grow flex flex-col">
         <div className="flex flex-wrap gap-2">
            {selectionModes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onSelectionModeChange(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                  ${
                    selectionMode === mode
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        
        <div className="bg-gray-700 p-3 rounded-md flex-grow border border-gray-600 overflow-y-auto">
          {(() => {
            if (selectionMode === 'triangle') {
               if (!intersectionPoints || intersectionPoints.length === 0) {
                 return <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>;
               }
               return (
                <div className="text-sm text-gray-300 font-mono">
                    <div className="flex border-b border-gray-600 mb-2">
                        <button onClick={() => setActiveTriangleTab('node1')} className={tabButtonClass(activeTriangleTab === 'node1')}>
                          {selectedAtoms[0] ? `Node #${selectedAtoms[0].serial}` : 'Node 1'}
                        </button>
                        <button onClick={() => setActiveTriangleTab('node2')} className={tabButtonClass(activeTriangleTab === 'node2')} disabled={!intersectionPoints[1]}>
                          {selectedAtoms[1] ? `Node #${selectedAtoms[1].serial}` : 'Node 2'}
                        </button>
                        <button onClick={() => setActiveTriangleTab('node3')} className={tabButtonClass(activeTriangleTab === 'node3')} disabled={!intersectionPoints[2]}>
                          {selectedAtoms[2] ? `Node #${selectedAtoms[2].serial}` : 'Node 3'}
                        </button>
                        <button onClick={() => setActiveTriangleTab('dist')} className={tabButtonClass(activeTriangleTab === 'dist')} disabled={!distances}>Dist./Angles</button>
                        <button onClick={() => setActiveTriangleTab('projective')} className={tabButtonClass(activeTriangleTab === 'projective')}>Projected Points</button>
                    </div>
                    <div>
                      {activeTriangleTab === 'node1' && intersectionPoints[0] && selectedAtoms[0] && <IntersectionDetailsDisplay points={intersectionPoints[0]} title={`Selected Node: #${selectedAtoms[0].serial}`} showNodeInfo={true} latticeFactor={latticeFactor} />}
                      {activeTriangleTab === 'node2' && intersectionPoints[1] && selectedAtoms[1] && <IntersectionDetailsDisplay points={intersectionPoints[1]} title={`Selected Node: #${selectedAtoms[1].serial}`} showNodeInfo={true} latticeFactor={latticeFactor} />}
                      {activeTriangleTab === 'node3' && intersectionPoints[2] && selectedAtoms[2] && <IntersectionDetailsDisplay points={intersectionPoints[2]} title={`Selected Node: #${selectedAtoms[2].serial}`} showNodeInfo={true} latticeFactor={latticeFactor} />}
                      {activeTriangleTab === 'dist' && distances && distances.length === 3 && angles && (
                          <div className="space-y-4">
                            <div>
                              <div className="font-bold text-red-400">Original Triangle</div>
                              <ul className="text-sm list-inside pl-2 text-red-300 font-normal font-mono">
                                <li>1-2: {getDistanceWithSqrt(distances[0])} / <span className="text-yellow-300">{angles[2].toFixed(1)}°</span></li>
                                <li>2-3: {getDistanceWithSqrt(distances[1])} / <span className="text-yellow-300">{angles[0].toFixed(1)}°</span></li>
                                <li>1-3: {getDistanceWithSqrt(distances[2])} / <span className="text-yellow-300">{angles[1].toFixed(1)}°</span></li>
                              </ul>
                            </div>

                            {closestNodeOnNormal && (
                                <div className="pt-4 border-t border-gray-600 mt-4">
                                    <div className="font-bold text-white">
                                        Closest Node on Plane Normal:
                                        <span className="text-yellow-300 font-semibold ml-2">Node #{closestNodeOnNormal.serial}</span>
                                    </div>
                                    <div className="pl-2 text-sm font-mono text-gray-300">
                                        <div>Coords: <span className="text-yellow-300">
                                            ({(closestNodeOnNormal.x / latticeFactor).toFixed(3)}, 
                                             {(closestNodeOnNormal.y / latticeFactor).toFixed(3)}, 
                                             {(closestNodeOnNormal.z / latticeFactor).toFixed(3)})
                                        </span></div>
                                    </div>
                                </div>
                            )}
                            <TriangleAnalysisDisplay label="Primary Plane Triangle" analysis={triangleAnalysis?.primary} labelColor="text-purple-300" />
                            <TriangleAnalysisDisplay label="Antipodal Plane Triangle" analysis={triangleAnalysis?.antipodal} labelColor="text-teal-300" />
                            
                            {trianglePlaneEquation && (
                                <div className="pt-4 border-t border-gray-600 mt-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white">Triangle Plane:</h4>
                                        <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                            <input
                                              type="checkbox"
                                              checked={showTrianglePlane}
                                              onChange={(e) => onShowTrianglePlaneChange(e.target.checked)}
                                              className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                                            />
                                            <span className="text-gray-300">Show</span>
                                        </label>
                                    </div>
                                    <div className="pl-2 text-sm font-mono text-gray-300">
                                        <div>Eq: <span className="text-cyan-300">{trianglePlaneEquation}</span></div>
                                        {trianglePlaneAzimuth !== null && trianglePlaneInclination !== null && (
                                            <div>Orient: <span className="text-cyan-300">Az: {trianglePlaneAzimuth.toFixed(1)}°, Inc: {trianglePlaneInclination.toFixed(1)}°</span></div>
                                        )}
                                        {trianglePlaneDistanceToOrigin !== null && (
                                            <div>Dist to Origin: <span className="text-cyan-300">{(trianglePlaneDistanceToOrigin / latticeFactor).toFixed(3)}</span></div>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                            <input
                                              type="checkbox"
                                              checked={hideNodesNotOnTrianglePlane}
                                              onChange={(e) => onHideNodesNotOnTrianglePlaneChange(e.target.checked)}
                                              className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                                            />
                                            <span className="text-gray-300">Isolate nodes ON this plane</span>
                                        </label>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-white">Parallel Plane:</h4>
                                            <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                                <input
                                                  type="checkbox"
                                                  checked={showParallelPlane}
                                                  onChange={(e) => onShowParallelPlaneChange(e.target.checked)}
                                                  className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                                                />
                                                <span className="text-gray-300">Show</span>
                                            </label>
                                        </div>
                                        <div className="pl-2">
                                            <label htmlFor="parallel-plane-distance-slider" className="block text-xs font-medium text-gray-300">
                                                Distance from Origin: <span className="font-bold text-cyan-400">{(parallelPlaneDistance / latticeFactor).toFixed(2)}</span>
                                            </label>
                                            <input
                                                id="parallel-plane-distance-slider"
                                                type="range"
                                                min={-2 * latticeFactor}
                                                max={2 * latticeFactor}
                                                step="0.05"
                                                value={parallelPlaneDistance}
                                                onChange={(e) => onParallelPlaneDistanceChange(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!showParallelPlane}
                                            />
                                        </div>
                                         <div className="mt-2 pl-2">
                                            <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                                <input
                                                  type="checkbox"
                                                  checked={isolateNodesOnParallelPlane}
                                                  onChange={(e) => onIsolateNodesOnParallelPlaneChange(e.target.checked)}
                                                  className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                                                />
                                                <span className="text-gray-300">Isolate nodes ON parallel plane</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor="normal-line-length-slider" className="block text-xs font-medium text-gray-300">
                                            Normal Line Length: <span className="font-bold text-cyan-400">{normalLineLength.toFixed(1)}</span>
                                        </label>
                                        <input
                                            id="normal-line-length-slider"
                                            type="range"
                                            min="1"
                                            max="20"
                                            step="0.5"
                                            value={normalLineLength}
                                            onChange={(e) => onNormalLineLengthChange(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                </div>
                            )}
                          </div>
                      )}
                      {activeTriangleTab === 'projective' && (
                          selectedProjectivePoint
                            ? <ProjectivePointDetails point={selectedProjectivePoint} />
                            : <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>
                      )}
                    </div>
                </div>
               );
            }

            if (selectionMode === 'distance') {
                if (!intersectionPoints || intersectionPoints.length === 0) {
                 return <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>;
               }
               return (
                <div className="text-sm text-gray-300 font-mono">
                    <div className="flex border-b border-gray-600 mb-2">
                        <button onClick={() => setActiveDistanceTab('node1')} className={tabButtonClass(activeDistanceTab === 'node1')}>
                          {selectedAtoms[0] ? `Node #${selectedAtoms[0].serial}` : 'Node 1'}
                        </button>
                        <button onClick={() => setActiveDistanceTab('node2')} className={tabButtonClass(activeDistanceTab === 'node2')} disabled={!intersectionPoints[1]}>
                          {selectedAtoms[1] ? `Node #${selectedAtoms[1].serial}` : 'Node 2'}
                        </button>
                        <button onClick={() => setActiveDistanceTab('dist')} className={tabButtonClass(activeDistanceTab === 'dist')} disabled={!distances}>Dist./Angles</button>
                        <button onClick={() => setActiveDistanceTab('projective')} className={tabButtonClass(activeDistanceTab === 'projective')}>Projected Points</button>
                    </div>
                     <div>
                      {activeDistanceTab === 'node1' && intersectionPoints[0] && selectedAtoms[0] && <IntersectionDetailsDisplay points={intersectionPoints[0]} title={`Selected Node: #${selectedAtoms[0].serial}`} showNodeInfo={true} latticeFactor={latticeFactor}/>}
                      {activeDistanceTab === 'node2' && intersectionPoints[1] && selectedAtoms[1] && <IntersectionDetailsDisplay points={intersectionPoints[1]} title={`Selected Node: #${selectedAtoms[1].serial}`} showNodeInfo={true} latticeFactor={latticeFactor}/>}
                      {activeDistanceTab === 'dist' && (
                          <div className="space-y-2">
                            {distances && <div className="font-normal">Distance: <span className="font-bold text-white">{getDistanceWithSqrt(distances[0])}</span></div>}
                            {nodeAngle !== null && <div className="font-normal">Angle: <span className="font-bold text-white">{nodeAngle.toFixed(1)}°</span></div>}

                            {(projectivePointsDistance?.primary || projectivePointsDistance?.antipodal) && (
                                <div className="pt-2 mt-2 border-t border-gray-600">
                                  {projectivePointsDistance.primary && <div>Primary Proj. Dist: <span className="font-bold text-purple-300">{(projectivePointsDistance.primary / latticeFactor).toFixed(3)}</span></div>}
                                  {projectivePointsDistance.antipodal && <div>Antipodal Proj. Dist: <span className="font-bold text-teal-300">{(projectivePointsDistance.antipodal / latticeFactor).toFixed(3)}</span></div>}
                                </div>
                            )}

                            {intersectionDistances && (
                                <div className="pt-2 mt-2 border-t border-gray-600 space-y-2">
                                    {intersectionDistances.primaryPlane != null && (
                                        <div>
                                            <div className="font-semibold text-purple-300">Primary Plane:</div>
                                            <div className="pl-2">
                                                <div>Dist: <span className="font-bold text-purple-200">{(intersectionDistances.primaryPlane / latticeFactor).toFixed(3)}</span></div>
                                                {intersectionDistances.primaryPlaneAngle3D != null && <div>3D Angle: <span className="font-bold text-purple-200">{intersectionDistances.primaryPlaneAngle3D.toFixed(1)}°</span></div>}
                                                {intersectionDistances.primaryPlaneAngle2D != null && <div>2D Angle: <span className="font-bold text-purple-200">{intersectionDistances.primaryPlaneAngle2D.toFixed(1)}°</span></div>}
                                            </div>
                                        </div>
                                    )}
                                    {(intersectionDistances.antipodalPlaneAngle3D != null || intersectionDistances.antipodalPlaneAngle2D != null) && (
                                         <div>
                                            <div className="font-semibold text-teal-300">Antipodal Plane:</div>
                                            <div className="pl-2">
                                                {intersectionDistances.antipodalPlaneAngle3D != null && <div>3D Angle: <span className="font-bold text-teal-200">{intersectionDistances.antipodalPlaneAngle3D.toFixed(1)}°</span></div>}
                                                {intersectionDistances.antipodalPlaneAngle2D != null && <div>2D Angle: <span className="font-bold text-teal-200">{intersectionDistances.antipodalPlaneAngle2D.toFixed(1)}°</span></div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                          </div>
                      )}
                      {activeDistanceTab === 'projective' && (
                          selectedProjectivePoint
                            ? <ProjectivePointDetails point={selectedProjectivePoint} />
                            : <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>
                      )}
                    </div>
                </div>
               );
            }
            if (selectionMode === 'node') {
              if (!intersectionPoints || intersectionPoints.length === 0) {
                 return <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>;
              }
              return (
                 <div className="text-sm text-gray-300 font-mono">
                    <div className="flex border-b border-gray-600 mb-2">
                        <button onClick={() => setActiveNodeTab('node')} className={tabButtonClass(activeNodeTab === 'node')}>Node Info</button>
                        <button onClick={() => setActiveNodeTab('projective')} className={tabButtonClass(activeNodeTab === 'projective')}>Projected Points</button>
                    </div>
                    {activeNodeTab === 'node' && selectedAtoms[0] && (
                        <IntersectionDetailsDisplay points={intersectionPoints[0]} title={`Selected Node: #${selectedAtoms[0].serial}`} showNodeInfo={true} latticeFactor={latticeFactor} />
                    )}
                    {activeNodeTab === 'projective' && (
                        selectedProjectivePoint
                            ? <ProjectivePointDetails point={selectedProjectivePoint} />
                            : <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>
                    )}
                </div>
              );
            }
            if (selectionMode === 'inspection') {
              return (
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
                              {inspectionData.calculatedInvertedPoint && (
                                  <div className="mt-2">
                                     <h4 className="font-bold text-orange-400">Calculated Geometric Inversion:</h4>
                                     <IntersectionDetailsDisplay points={{ primaryPlane: inspectionData.calculatedInvertedPoint }} showNodeInfo={false} latticeFactor={latticeFactor} />
                                  </div>
                              )}
                              {inspectionData.calculatedComplexInvertedPoint && (
                                  <div className="mt-2">
                                     <h4 className="font-bold text-orange-400">Calculated Complex Inversion:</h4>
                                     <IntersectionDetailsDisplay points={{ primaryPlane: inspectionData.calculatedComplexInvertedPoint }} showNodeInfo={false} latticeFactor={latticeFactor} />
                                  </div>
                              )}
                          </>
                      )}
                      
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">{getSelectionInfoText()}</p>
                  )}
              </div>
              )
            }
            return <div className="text-sm text-gray-500">{getSelectionInfoText()}</div>;
          })()}
        </div>
        <div className="mt-3 flex gap-4">
          <button
            onClick={onClearSelection}
            disabled={selectedAtoms.length === 0 && !selectedProjectivePoint && !inspectionData}
            className="w-full bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
          <button
            onClick={handleSaveInfo}
            disabled={!hasDataToSave}
            className="w-full bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Save Info
          </button>
        </div>
      </div>
    </div>
  );
};
export default ControlsPanel2;
