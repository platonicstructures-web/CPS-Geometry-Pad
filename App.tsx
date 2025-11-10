

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import RightControls from './components/RightControls';
import PdbViewer, { PdbViewerHandles } from './components/PdbViewer';
import { DisplayStyle, AtomSpec, SelectionMode, MoleculeMetadata, IntersectionPoints, IntersectionDistances, ProjectivePointInfo, TriangleAnalysis, HoveredProjectivePointInfo, InspectionData, Lattice, BondMode } from './types';
import Footer from './components/Footer';
import TopBar from './components/TopBar';
import LiveTranscription from './components/LiveTranscription';
import ControlsPanel2 from './components/ControlsPanel2';
import UserGuideDialog from './components/UserGuideDialog';
import Resizer from './components/Resizer';

// Vector math helpers
const vec = (x: number, y: number, z: number) => ({ x, y, z });
const add = (v1: any, v2: any) => vec(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
const scale = (v: any, s: number) => vec(v.x * s, v.y * s, v.z * s);
// FIX: Corrected typo 's.z' to 'v.z' to correctly calculate vector length.
const len = (v: any) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const dot = (v1: any, v2: any) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
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


const App: React.FC = () => {
  const [localPdbData, setLocalPdbData] = useState<string | null>(null);
  const [localPdbName, setLocalPdbName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DisplayStyle>('ball and stick');
  const [atomScale, setAtomScale] = useState(0.2);
  const [stickRadius, setStickRadius] = useState(0.05);
  const [bondScale, setBondScale] = useState(1.2);
  const [bondMode, setBondMode] = useState<BondMode>('calculated');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [selectedAtoms, setSelectedAtoms] = useState<AtomSpec[]>([]);
  const [selectedProjectivePoint, setSelectedProjectivePoint] = useState<ProjectivePointInfo | null>(null);
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [distances, setDistances] = useState<number[] | null>(null);
  const [nodeAngle, setNodeAngle] = useState<number | null>(null);
  const [projectivePointsDistance, setProjectivePointsDistance] = useState<{ primary?: number; antipodal?: number } | null>(null);
  const [intersectionPoints, setIntersectionPoints] = useState<IntersectionPoints[] | null>(null);
  const [intersectionDistances, setIntersectionDistances] = useState<IntersectionDistances | null>(null);
  const [metadata, setMetadata] = useState<MoleculeMetadata | null>(null);
  const [normalLineLength, setNormalLineLength] = useState(5);
  const [triangleAnalysis, setTriangleAnalysis] = useState<TriangleAnalysis | null>(null);
  const [isProjectivePointModeActive, setIsProjectivePointModeActive] = useState(false);
  const [trianglePlaneEquation, setTrianglePlaneEquation] = useState<string | null>(null);
  const [showTrianglePlane, setShowTrianglePlane] = useState(true);
  const [trianglePlaneAzimuth, setTrianglePlaneAzimuth] = useState<number | null>(null);
  const [trianglePlaneInclination, setTrianglePlaneInclination] = useState<number | null>(null);
  const [trianglePlaneDistanceToOrigin, setTrianglePlaneDistanceToOrigin] = useState<number | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<AtomSpec | null>(null);
  const [hoveredProjectivePoint, setHoveredProjectivePoint] = useState<HoveredProjectivePointInfo | null>(null);
  const [showHoveredAtomLabel, setShowHoveredAtomLabel] = useState(true);
  const [showHoveredAtomDistance, setShowHoveredAtomDistance] = useState(true);
  const [hideNodesNotOnTrianglePlane, setHideNodesNotOnTrianglePlane] = useState(false);
  const [showParallelPlane, setShowParallelPlane] = useState(false);
  const [parallelPlaneDistance, setParallelPlaneDistance] = useState(0);
  const [isolateNodesOnParallelPlane, setIsolateNodesOnParallelPlane] = useState(false);
  const [closestNodeOnNormal, setClosestNodeOnNormal] = useState<AtomSpec | null>(null);
  const [lattice, setLattice] = useState<Lattice>('triangle');
  const [activeInspectionTab, setActiveInspectionTab] = useState<'reflection' | 'inversion' | 'multiplication'>('reflection');
  const [showCalculatedInversionPoint, setShowCalculatedInversionPoint] = useState(true);
  const [inversionType, setInversionType] = useState<'geometric' | 'complex'>('geometric');
  const [triangleLatticeFactor, setTriangleLatticeFactor] = useState(1.8);
  const [squareLatticeFactor, setSquareLatticeFactor] = useState(1.86);

  // Scene and geometry settings
  const [showOriginSphere, setShowOriginSphere] = useState(false);
  const [originSphereOpacity, setOriginSphereOpacity] = useState(0.6);
  const [ellipticalRadiusInput, setEllipticalRadiusInput] = useState(2);
  const [isolateNodesOnEllipticalSphere, setIsolateNodesOnEllipticalSphere] = useState(false);
  const [hideNodesOutsideEllipticalSphere, setHideNodesOutsideEllipticalSphere] = useState(false);
  const [isolatedNodeCount, setIsolatedNodeCount] = useState<number | null>(null);
  const [visibleNodeCount, setVisibleNodeCount] = useState<number | null>(null);
  const [showSphere2, setShowSphere2] = useState(false);
  const [sphere2Opacity, setSphere2Opacity] = useState(1.0);
  const [showCylinder, setShowCylinder] = useState(false);
  const [cylinderRadius, setCylinderRadius] = useState(10);
  const [cylinderHeight, setCylinderHeight] = useState(0.01);
  const [cylinderAzimuth, setCylinderAzimuth] = useState(0);
  const [cylinderInclination, setCylinderInclination] = useState(0);
  const [viewerBackground, setViewerBackground] = useState('dark');
  const [showAxes, setShowAxes] = useState(true);
  const [axesLength, setAxesLength] = useState(20);
  const [showCpsLines, setShowCpsLines] = useState(false);
  const [showProjectivePoints, setShowProjectivePoints] = useState(false);
  const [showCpsLinesSet2, setShowCpsLinesSet2] = useState(false);
  const [showProjectivePointsSet2, setShowProjectivePointsSet2] = useState(false);
  const [projectivePointRadius, setProjectivePointRadius] = useState(0.10);
  const [lineRadius, setLineRadius] = useState(0.02);
  const [showAntipodalSphere, setShowAntipodalSphere] = useState(false);
  const [showAntipodalPlane, setShowAntipodalPlane] = useState(false);
  const [showAntipodalProjectivePointsSet1, setShowAntipodalProjectivePointsSet1] = useState(false);
  const [showAntipodalProjectivePointsSet2, setShowAntipodalProjectivePointsSet2] = useState(false);
  const [omega, setOmega] = useState({ x: 0, y: 0, z: 0 });
  const [showInspCpsLines, setShowInspCpsLines] = useState(true);
  const [showInspPrimaryPoints, setShowInspPrimaryPoints] = useState(true);
  const [showInspAntipodalPoints, setShowInspAntipodalPoints] = useState(true);
  const [showXYPlane, setShowXYPlane] = useState(false);
  const [showXZPlane, setShowXZPlane] = useState(false);
  const [showYZPlane, setShowYZPlane] = useState(false);

  // Panel visibility
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [isTranscriptionPanelVisible, setIsTranscriptionPanelVisible] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<'panel1' | 'panel2'>('panel1');
  const [activeRightPanel, setActiveRightPanel] = useState<'panel1' | 'panel2'>('panel1');
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [resizingPanel, setResizingPanel] = useState<'left' | 'right' | null>(null);

  // Synthetic Geometry state
  const [syntheticNodeInput, setSyntheticNodeInput] = useState({ x: '1', y: '0', z: '0' });
  const [syntheticNodeInput2, setSyntheticNodeInput2] = useState({ x: '0', y: '1', z: '0' });
  const [syntheticNode, setSyntheticNode] = useState<{ x: number; y: number; z: number; } | null>(null);
  const [syntheticNodeIntersections, setSyntheticNodeIntersections] = useState<IntersectionPoints | null>(null);
  const [syntheticLinePoints, setSyntheticLinePoints] = useState<{ p1: { x: number, y: number, z: number }, p2: { x: number, y: number, z: number } } | null>(null);
  const [syntheticLineIntersections, setSyntheticLineIntersections] = useState<IntersectionPoints | null>(null);
  const [syntheticPlaneEquation, setSyntheticPlaneEquation] = useState<string | null>(null);
  const [syntheticLinePoint1Intersections, setSyntheticLinePoint1Intersections] = useState<IntersectionPoints | null>(null);
  const [syntheticLinePoint2Intersections, setSyntheticLinePoint2Intersections] = useState<IntersectionPoints | null>(null);
  const [primaryPlaneLineEquation, setPrimaryPlaneLineEquation] = useState<string | null>(null);
  const [antipodalPlaneLineEquation, setAntipodalPlaneLineEquation] = useState<string | null>(null);
  const [syntheticNodeDualLineEquation, setSyntheticNodeDualLineEquation] = useState<string | null>(null);
  const [syntheticP1DualLineEquation, setSyntheticP1DualLineEquation] = useState<string | null>(null);
  const [syntheticP2DualLineEquation, setSyntheticP2DualLineEquation] = useState<string | null>(null);
  const [showSyntheticPlane, setShowSyntheticPlane] = useState(false);
  const [showSyntheticNodeDualPlane, setShowSyntheticNodeDualPlane] = useState(false);
  const [syntheticP1PlaneCoords, setSyntheticP1PlaneCoords] = useState<{ x: number; y: number; z: number; } | null>(null);
  const [syntheticP2PlaneCoords, setSyntheticP2PlaneCoords] = useState<{ x: number; y: number; z: number; } | null>(null);
  const [showSyntheticNodeDualLine, setShowSyntheticNodeDualLine] = useState(true);
  const [syntheticNodeDualPlaneEquation, setSyntheticNodeDualPlaneEquation] = useState<string | null>(null);

  const viewerRef = useRef<PdbViewerHandles>(null);
  const syntheticGeomType = useRef<'node' | 'line' | null>(null);

  const currentLatticeFactor = lattice === 'triangle' ? triangleLatticeFactor : squareLatticeFactor;

  const handleMouseDown = useCallback((panel: 'left' | 'right') => (event: React.MouseEvent) => {
      event.preventDefault();
      setResizingPanel(panel);
  }, []);

  useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
          if (!resizingPanel) return;

          const minWidth = 280;
          const maxWidth = 600;

          if (resizingPanel === 'left') {
              const newWidth = event.clientX;
              setLeftPanelWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
          } else if (resizingPanel === 'right') {
              const newWidth = window.innerWidth - event.clientX;
              setRightPanelWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
          }
      };

      const handleMouseUp = () => {
          setResizingPanel(null);
      };

      if (resizingPanel) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      };
  }, [resizingPanel]);

  useEffect(() => {
    const calculate2DLineEquation = (p1_rel: { x: number, y: number } | undefined, p2_rel: { x: number, y: number } | undefined): string | null => {
        if (!p1_rel || !p2_rel) return null;
        const { x: x1, y: y1 } = p1_rel;
        const { x: x2, y: y2 } = p2_rel;
        
        if (Math.abs(x1 - x2) < 1e-6 && Math.abs(y1 - y2) < 1e-6) {
            return "Points are coincident";
        }

        const A = y2 - y1;
        const B = x1 - x2;
        const C = x1 * y2 - x2 * y1;

        const mag = Math.sqrt(A*A + B*B);
        if (mag < 1e-6) return "Cannot define line";
        const normA = A / mag;
        const normB = B / mag;
        const normC = C / mag;

        const formatTerm = (coeff: number, axis: string, isFirst: boolean): string => {
            if (Math.abs(coeff) < 1e-6) return '';
            let sign = coeff > 0 ? '+' : '-';
            if (isFirst && sign === '+') sign = '';
            else if (!isFirst) sign = ` ${sign} `;
            const value = Math.abs(coeff).toFixed(3);
            return `${sign}${value}${axis}`;
        };

        let equation = '';
        const xTerm = formatTerm(normA, "X'", true);
        equation += xTerm;
        const yTerm = formatTerm(normB, "Y'", equation === '');
        equation += yTerm;

        return `${equation.trim()} = ${(normC).toFixed(3)}`;
    };

    if (syntheticLinePoint1Intersections?.primaryPlane && syntheticLinePoint2Intersections?.primaryPlane) {
        const eq = calculate2DLineEquation(
            syntheticLinePoint1Intersections.primaryPlane.relativeCoords,
            syntheticLinePoint2Intersections.primaryPlane.relativeCoords
        );
        setPrimaryPlaneLineEquation(eq);
    } else {
        setPrimaryPlaneLineEquation(null);
    }

    if (syntheticLinePoint1Intersections?.antipodalPlane && syntheticLinePoint2Intersections?.antipodalPlane) {
        const eq = calculate2DLineEquation(
            syntheticLinePoint1Intersections.antipodalPlane.relativeCoords,
            syntheticLinePoint2Intersections.antipodalPlane.relativeCoords
        );
        setAntipodalPlaneLineEquation(eq);
    } else {
        setAntipodalPlaneLineEquation(null);
    }
  }, [syntheticLinePoint1Intersections, syntheticLinePoint2Intersections]);

  // FIX: This effect was causing an infinite loop by depending on state it was setting (syntheticNode, syntheticLinePoints).
  // It is now refactored to depend only on the slider inputs and a ref that tracks which geometry type is active.
  useEffect(() => {
    if (!syntheticGeomType.current) return;

    const normalizeAndScale = (xStr: string, yStr: string, zStr:string) => {
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const z = parseFloat(zStr);
      if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
      
      const lenValue = Math.sqrt(x*x + y*y + z*z);
      if (lenValue > 1e-6) {
          return { x: x / lenValue * currentLatticeFactor, y: y / lenValue * currentLatticeFactor, z: z / lenValue * currentLatticeFactor };
      }
      return { x: currentLatticeFactor, y: 0, z: 0 };
    };
    
    if (syntheticGeomType.current === 'node') {
      const updatedNode = normalizeAndScale(syntheticNodeInput.x, syntheticNodeInput.y, syntheticNodeInput.z);
      if (updatedNode) {
          setSyntheticNode(updatedNode);
      }
    }

    if (syntheticGeomType.current === 'line') {
      const p1 = normalizeAndScale(syntheticNodeInput.x, syntheticNodeInput.y, syntheticNodeInput.z);
      const p2 = normalizeAndScale(syntheticNodeInput2.x, syntheticNodeInput2.y, syntheticNodeInput2.z);
      
      if (p1 && p2) {
        setSyntheticLinePoints({ p1, p2 });

        const normal = cross(p1, p2);
        const unitNormal = normalize(normal);

        if (len(unitNormal) < 1e-6) {
          setSyntheticPlaneEquation('Plane not defined (points are collinear with origin)');
        } else {
            const formatTerm = (coeff: number, axis: string, isFirst: boolean): string => {
                if (Math.abs(coeff) < 1e-6) return '';
                let sign = coeff > 0 ? '+' : '-';
                if (isFirst && sign === '+') sign = '';
                else if (!isFirst) sign = ` ${sign} `;
                const value = Math.abs(coeff).toFixed(3);
                return `${sign}${value}${axis}`;
            };

            let equation = '';
            const xTerm = formatTerm(unitNormal.x, 'x', true);
            equation += xTerm;
            const yTerm = formatTerm(unitNormal.y, 'y', equation === '');
            equation += yTerm;
            const zTerm = formatTerm(unitNormal.z, 'z', equation === '');
            equation += zTerm;

            setSyntheticPlaneEquation(`${equation.trim()} = 0`);
        }
      }
    }
  }, [syntheticNodeInput, syntheticNodeInput2, currentLatticeFactor]);


  const resetInteractionState = useCallback(() => {
    setSelectedAtoms([]);
    setSelectedProjectivePoint(null);
    setInspectionData(null);
    setDistances(null);
    setNodeAngle(null);
    setProjectivePointsDistance(null);
    setIntersectionPoints(null);
    setIntersectionDistances(null);
    setTriangleAnalysis(null);
    setIsProjectivePointModeActive(false);
    setTrianglePlaneEquation(null);
    setTrianglePlaneAzimuth(null);
    setTrianglePlaneInclination(null);
    setTrianglePlaneDistanceToOrigin(null);
    setHoveredAtom(null);
    setHoveredProjectivePoint(null);
    setHideNodesNotOnTrianglePlane(false);
    setShowParallelPlane(false);
    setParallelPlaneDistance(0);
    setIsolateNodesOnParallelPlane(false);
    setClosestNodeOnNormal(null);
  }, []);

  const handleSelectionModeChange = useCallback((mode: SelectionMode) => {
    setSelectionMode(mode);
    resetInteractionState();
  }, [resetInteractionState]);
  
  const handleClearSelection = useCallback(() => {
    resetInteractionState();
  }, [resetInteractionState]);
  
  const handleLocalFileLoad = (data: string, name: string) => {
    setLocalPdbData(data);
    setLocalPdbName(name);
    handleClearSelection();
  };
  
  const handlePdbUrlLoad = (url: string) => {
    if (!url.toLowerCase().endsWith('.pdb')) {
      setError("URL does not seem to point to a .pdb file.");
      return;
    }

    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    fetch(proxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        if (!data || data.trim().length === 0) {
            throw new Error("Received empty or invalid PDB file. The URL might be incorrect or the proxy failed.");
        }
        const name = url.substring(url.lastIndexOf('/') + 1);
        setError(null);
        handleLocalFileLoad(data, name);
      })
      .catch(error => {
        console.error('Failed to fetch PDB from URL:', error);
        setError(`Failed to fetch PDB from URL. Please check your network connection and ensure the URL is correct and accessible. Error: ${error.message}`);
      });
  };

  const handleOmegaChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setOmega(prev => ({ ...prev, [axis]: value }));
  };
  
  const handleSyntheticNodeInputChange = (axis: 'x' | 'y' | 'z', value: string) => {
    setSyntheticNodeInput(prev => ({ ...prev, [axis]: value }));
  };

  const handleSyntheticNodeInput2Change = (axis: 'x' | 'y' | 'z', value: string) => {
    setSyntheticNodeInput2(prev => ({ ...prev, [axis]: value }));
  };

  const handleCreateSyntheticNode = () => {
    handleClearSyntheticGeometry();
    syntheticGeomType.current = 'node';
    const x = parseFloat(syntheticNodeInput.x);
    const y = parseFloat(syntheticNodeInput.y);
    const z = parseFloat(syntheticNodeInput.z);
    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      const lenValue = Math.sqrt(x * x + y * y + z * z);
      if (lenValue > 1e-6) {
        setSyntheticNode({ x: x / lenValue * currentLatticeFactor, y: y / lenValue * currentLatticeFactor, z: z / lenValue * currentLatticeFactor });
      } else {
        setSyntheticNode({ x: currentLatticeFactor, y: 0, z: 0 });
      }
    } else {
      console.error("Invalid input for synthetic node");
    }
  };

  const handleCreateSyntheticLine = () => {
    handleClearSyntheticGeometry();
    syntheticGeomType.current = 'line';
    const p1_x = parseFloat(syntheticNodeInput.x);
    const p1_y = parseFloat(syntheticNodeInput.y);
    const p1_z = parseFloat(syntheticNodeInput.z);
    const p2_x = parseFloat(syntheticNodeInput2.x);
    const p2_y = parseFloat(syntheticNodeInput2.y);
    const p2_z = parseFloat(syntheticNodeInput2.z);

    if (![p1_x, p1_y, p1_z, p2_x, p2_y, p2_z].some(isNaN)) {
        const normalizeAndScale = (x: number, y: number, z: number) => {
            const lenValue = Math.sqrt(x*x + y*y + z*z);
            if (lenValue > 1e-6) {
                return { x: x / lenValue * currentLatticeFactor, y: y / lenValue * currentLatticeFactor, z: z / lenValue * currentLatticeFactor };
            }
            return { x: currentLatticeFactor, y: 0, z: 0 };
        };
        const p1 = normalizeAndScale(p1_x, p1_y, p1_z);
        const p2 = normalizeAndScale(p2_x, p2_y, p2_z);
        setSyntheticLinePoints({ p1, p2 });

        const normal = cross(p1, p2);
        const unitNormal = normalize(normal);

        if (len(unitNormal) < 1e-6) {
          setSyntheticPlaneEquation('Plane not defined (points are collinear with origin)');
        } else {
            const formatTerm = (coeff: number, axis: string, isFirst: boolean): string => {
                if (Math.abs(coeff) < 1e-6) return '';
                let sign = coeff > 0 ? '+' : '-';
                if (isFirst && sign === '+') sign = '';
                else if (!isFirst) sign = ` ${sign} `;
                
                const value = Math.abs(coeff).toFixed(3);
                return `${sign}${value}${axis}`;
            };

            let equation = '';
            const xTerm = formatTerm(unitNormal.x, 'x', true);
            equation += xTerm;
            
            const yTerm = formatTerm(unitNormal.y, 'y', equation === '');
            equation += yTerm;

            const zTerm = formatTerm(unitNormal.z, 'z', equation === '');
            equation += zTerm;

            setSyntheticPlaneEquation(`${equation.trim()} = 0`);
        }
    } else {
        console.error("Invalid input for synthetic line");
    }
  };

  const handleClearSyntheticGeometry = () => {
    syntheticGeomType.current = null;
    setSyntheticNode(null);
    setSyntheticNodeIntersections(null);
    setSyntheticLinePoints(null);
    setSyntheticLineIntersections(null);
    setSyntheticPlaneEquation(null);
    setSyntheticLinePoint1Intersections(null);
    setSyntheticLinePoint2Intersections(null);
    setPrimaryPlaneLineEquation(null);
    setAntipodalPlaneLineEquation(null);
    setSyntheticNodeDualLineEquation(null);
    setSyntheticP1DualLineEquation(null);
    setSyntheticP2DualLineEquation(null);
    setShowSyntheticPlane(false);
    setShowSyntheticNodeDualPlane(false);
    setSyntheticP1PlaneCoords(null);
    setSyntheticP2PlaneCoords(null);
    setShowSyntheticNodeDualLine(true);
    setSyntheticNodeDualPlaneEquation(null);
  };

  const handleIsolateNodesOnEllipticalSphereChange = (isolate: boolean) => {
      setIsolateNodesOnEllipticalSphere(isolate);
      if (isolate) {
          setHideNodesOutsideEllipticalSphere(false);
          setHideNodesNotOnTrianglePlane(false);
          setIsolateNodesOnParallelPlane(false);
      }
  };

  const handleHideNodesOutsideEllipticalSphereChange = (hide: boolean) => {
      setHideNodesOutsideEllipticalSphere(hide);
      if (hide) {
          setIsolateNodesOnEllipticalSphere(false);
          setHideNodesNotOnTrianglePlane(false);
          setIsolateNodesOnParallelPlane(false);
      }
  };

  const handleHideNodesNotOnTrianglePlaneChange = (hide: boolean) => {
      setHideNodesNotOnTrianglePlane(hide);
      if (hide) {
          setIsolateNodesOnParallelPlane(false);
          setIsolateNodesOnEllipticalSphere(false);
          setHideNodesOutsideEllipticalSphere(false);
      }
  };
  const handleIsolateNodesOnParallelPlaneChange = (isolate: boolean) => {
      setIsolateNodesOnParallelPlane(isolate);
      if (isolate) {
          setHideNodesNotOnTrianglePlane(false);
          setIsolateNodesOnEllipticalSphere(false);
          setHideNodesOutsideEllipticalSphere(false);
      }
  };

  const handleSaveCoordinates = useCallback(() => {
    viewerRef.current?.saveCoordinates();
  }, []);

  const handleConvert = useCallback(() => {
    if (!localPdbData) {
      alert("Please load a PDB file first.");
      return;
    }

    const isConvertingToSquare = lattice === 'triangle';
    const angleDeg = isConvertingToSquare ? 61.855 : -61.855;
    const downloadName = isConvertingToSquare ? 'converted_to_square.pdb' : 'converted_to_triangle.pdb';
    const scalingFactor = 1.0333;
    const axis = normalize({ x: 0.864, y: 0.231, z: -0.447 });
    
    const angleRad = angleDeg * (Math.PI / 180);
    const cosTheta = Math.cos(angleRad);
    const sinTheta = Math.sin(angleRad);

    const lines = localPdbData.split('\n');
    const newLines = lines.map(line => {
      if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
        try {
          const x = parseFloat(line.substring(30, 38));
          const y = parseFloat(line.substring(38, 46));
          const z = parseFloat(line.substring(46, 54));
          const v = { x, y, z };

          const term1 = scale(v, cosTheta);
          const term2 = scale(cross(axis, v), sinTheta);
          const term3 = scale(axis, dot(axis, v) * (1 - cosTheta));
          const v_rot = add(add(term1, term2), term3);
          
          let v_final;
          if (isConvertingToSquare) {
            v_final = scale(v_rot, scalingFactor);
          } else {
            v_final = scale(v_rot, 1/scalingFactor);
          }

          const newX = v_final.x.toFixed(3).padStart(8, ' ');
          const newY = v_final.y.toFixed(3).padStart(8, ' ');
          const newZ = v_final.z.toFixed(3).padStart(8, ' ');

          return line.substring(0, 30) + newX + newY + newZ + line.substring(54);
        } catch (e) {
          console.error("Could not parse atom line:", line, e);
          return line;
        }
      }
      return line;
    });

    const newPdbData = newLines.join('\n');
    
    const blob = new Blob([newPdbData], { type: 'chemical/x-pdb;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", downloadName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }, [localPdbData, lattice]);

  const currentPdbName = localPdbName || 'No file loaded';
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Header />
      <TopBar
        viewerBackground={viewerBackground}
        onViewerBackgroundChange={setViewerBackground}
        showAxes={showAxes}
        onShowAxesChange={setShowAxes}
        showXYPlane={showXYPlane}
        onShowXYPlaneChange={setShowXYPlane}
        showXZPlane={showXZPlane}
        onShowXZPlaneChange={setShowXZPlane}
        showYZPlane={showYZPlane}
        onShowYZPlaneChange={setShowYZPlane}
        onViewChange={(view) => viewerRef.current?.setView(view)}
        isLeftPanelVisible={isLeftPanelVisible}
        onToggleLeftPanel={() => setIsLeftPanelVisible(v => !v)}
        isRightPanelVisible={isRightPanelVisible}
        onToggleRightPanel={() => setIsRightPanelVisible(v => !v)}
        isTranscriptionPanelVisible={isTranscriptionPanelVisible}
        onToggleTranscriptionPanel={() => setIsTranscriptionPanelVisible(v => !v)}
        activeLeftPanel={activeLeftPanel}
        onActiveLeftPanelChange={setActiveLeftPanel}
        activeRightPanel={activeRightPanel}
        onActiveRightPanelChange={setActiveRightPanel}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
      />
      <main className="flex-1 px-4 py-2 min-h-0">
        <div className="flex gap-4 h-full">
          {isLeftPanelVisible && (
            <>
              <aside className="h-full overflow-y-auto flex-shrink-0" style={{ width: `${leftPanelWidth}px` }}>
                {activeLeftPanel === 'panel1' ? (
                  <Controls
                    onLocalFileLoad={handleLocalFileLoad}
                    onPdbUrlLoad={handlePdbUrlLoad}
                    localPdbName={localPdbName}
                    selectedStyle={selectedStyle}
                    onStyleChange={setSelectedStyle}
                    atomScale={atomScale}
                    onAtomScaleChange={setAtomScale}
                    stickRadius={stickRadius}
                    onStickRadiusChange={setStickRadius}
                    bondScale={bondScale}
                    onBondScaleChange={setBondScale}
                    bondMode={bondMode}
                    onBondModeChange={setBondMode}
                    metadata={metadata}
                    projectivePointRadius={projectivePointRadius}
                    onProjectivePointRadiusChange={setProjectivePointRadius}
                    lineRadius={lineRadius}
                    onLineRadiusChange={setLineRadius}
                    selectionMode={selectionMode}
                    showProjectivePoints={showProjectivePoints}
                    showProjectivePointsSet2={showProjectivePointsSet2}
                    showAntipodalProjectivePointsSet1={showAntipodalProjectivePointsSet1}
                    showAntipodalProjectivePointsSet2={showAntipodalProjectivePointsSet2}
                    lattice={lattice}
                    onLatticeChange={setLattice}
                    onConvert={handleConvert}
                    triangleLatticeFactor={triangleLatticeFactor}
                    onTriangleLatticeFactorChange={setTriangleLatticeFactor}
                    squareLatticeFactor={squareLatticeFactor}
                    onSquareLatticeFactorChange={setSquareLatticeFactor}
                    axesLength={axesLength}
                    onAxesLengthChange={setAxesLength}
                  />
                ) : (
                  <ControlsPanel2
                    selectionMode={selectionMode}
                    onSelectionModeChange={handleSelectionModeChange}
                    onClearSelection={handleClearSelection}
                    selectedAtoms={selectedAtoms}
                    selectedProjectivePoint={selectedProjectivePoint}
                    inspectionData={inspectionData}
                    distances={distances}
                    nodeAngle={nodeAngle}
                    projectivePointsDistance={projectivePointsDistance}
                    intersectionPoints={intersectionPoints}
                    intersectionDistances={intersectionDistances}
                    triangleAnalysis={triangleAnalysis}
                    trianglePlaneEquation={trianglePlaneEquation}
                    trianglePlaneAzimuth={trianglePlaneAzimuth}
                    trianglePlaneInclination={trianglePlaneInclination}
                    trianglePlaneDistanceToOrigin={trianglePlaneDistanceToOrigin}
                    showTrianglePlane={showTrianglePlane}
                    onShowTrianglePlaneChange={setShowTrianglePlane}
                    hideNodesNotOnTrianglePlane={hideNodesNotOnTrianglePlane}
                    onHideNodesNotOnTrianglePlaneChange={handleHideNodesNotOnTrianglePlaneChange}
                    showParallelPlane={showParallelPlane}
                    onShowParallelPlaneChange={setShowParallelPlane}
                    parallelPlaneDistance={parallelPlaneDistance}
                    onParallelPlaneDistanceChange={setParallelPlaneDistance}
                    isolateNodesOnParallelPlane={isolateNodesOnParallelPlane}
                    onIsolateNodesOnParallelPlaneChange={handleIsolateNodesOnParallelPlaneChange}
                    normalLineLength={normalLineLength}
                    onNormalLineLengthChange={setNormalLineLength}
                    currentPdbName={currentPdbName}
                    isProjectivePointModeActive={isProjectivePointModeActive}
                    onSetProjectivePointModeActive={setIsProjectivePointModeActive}
                    hoveredAtom={hoveredAtom}
                    hoveredProjectivePoint={hoveredProjectivePoint}
                    showHoveredAtomLabel={showHoveredAtomLabel}
                    onShowHoveredAtomLabelChange={setShowHoveredAtomLabel}
                    showHoveredAtomDistance={showHoveredAtomDistance}
                    onShowHoveredAtomDistanceChange={setShowHoveredAtomDistance}
                    closestNodeOnNormal={closestNodeOnNormal}
                    lattice={lattice}
                    activeInspectionTab={activeInspectionTab}
                    onActiveInspectionTabChange={setActiveInspectionTab}
                    showCalculatedInversionPoint={showCalculatedInversionPoint}
                    onShowCalculatedInversionPointChange={setShowCalculatedInversionPoint}
                    inversionType={inversionType}
                    onInversionTypeChange={setInversionType}
                    latticeFactor={currentLatticeFactor}
                  />
                )}
              </aside>
              <Resizer onMouseDown={handleMouseDown('left')} />
            </>
          )}

          <div className="flex-grow h-full min-w-0">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                <p className="text-xl text-cyan-400 animate-pulse">Loading Model...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center z-10 p-4">
                <p className="text-lg text-red-200 text-center">
                  <strong className="block mb-2">Error Loading Model</strong>
                  {error}
                </p>
              </div>
            )}
            <div className="relative w-full h-full bg-gray-800 rounded-lg shadow-inner border border-gray-700 overflow-hidden">
               <PdbViewer
                ref={viewerRef}
                pdbData={localPdbData}
                style={selectedStyle}
                setIsLoading={setIsLoading}
                setError={setError}
                selectionMode={selectionMode}
                selectedAtoms={selectedAtoms}
                setSelectedAtoms={setSelectedAtoms}
                selectedProjectivePoint={selectedProjectivePoint}
                setSelectedProjectivePoint={setSelectedProjectivePoint}
                inspectionData={inspectionData}
                setInspectionData={setInspectionData}
                setHoveredAtom={setHoveredAtom}
                setHoveredProjectivePoint={setHoveredProjectivePoint}
                setDistances={setDistances}
                setNodeAngle={setNodeAngle}
                setProjectivePointsDistance={setProjectivePointsDistance}
                setIntersectionPoints={setIntersectionPoints}
                setIntersectionDistances={setIntersectionDistances}
                setTriangleAnalysis={setTriangleAnalysis}
                setTrianglePlaneEquation={setTrianglePlaneEquation}
                setTrianglePlaneAzimuth={setTrianglePlaneAzimuth}
                setTrianglePlaneInclination={setTrianglePlaneInclination}
                setTrianglePlaneDistanceToOrigin={setTrianglePlaneDistanceToOrigin}
                showTrianglePlane={showTrianglePlane}
                hideNodesNotOnTrianglePlane={hideNodesNotOnTrianglePlane}
                showParallelPlane={showParallelPlane}
                parallelPlaneDistance={parallelPlaneDistance}
                isolateNodesOnParallelPlane={isolateNodesOnParallelPlane}
                atomScale={atomScale}
                stickRadius={stickRadius}
                lineRadius={lineRadius}
                bondScale={bondScale}
                bondMode={bondMode}
                setMetadata={setMetadata}
                normalLineLength={normalLineLength}
                showOriginSphere={showOriginSphere}
                originSphereOpacity={originSphereOpacity}
                ellipticalRadius={currentLatticeFactor * Math.sqrt(ellipticalRadiusInput)}
                isolateNodesOnEllipticalSphere={isolateNodesOnEllipticalSphere}
                hideNodesOutsideEllipticalSphere={hideNodesOutsideEllipticalSphere}
                setIsolatedNodeCount={setIsolatedNodeCount}
                setVisibleNodeCount={setVisibleNodeCount}
                showSphere2={showSphere2}
                sphere2Opacity={sphere2Opacity}
                showCylinder={showCylinder}
                cylinderRadius={cylinderRadius}
                cylinderHeight={cylinderHeight}
                cylinderAzimuth={cylinderAzimuth}
                cylinderInclination={cylinderInclination}
                viewerBackground={viewerBackground}
                showAxes={showAxes}
                axesLength={axesLength}
                showCpsLines={showCpsLines}
                showProjectivePoints={showProjectivePoints}
                showCpsLinesSet2={showCpsLinesSet2}
                showProjectivePointsSet2={showProjectivePointsSet2}
                projectivePointRadius={projectivePointRadius}
                showAntipodalSphere={showAntipodalSphere}
                showAntipodalPlane={showAntipodalPlane}
                showAntipodalProjectivePointsSet1={showAntipodalProjectivePointsSet1}
                showAntipodalProjectivePointsSet2={showAntipodalProjectivePointsSet2}
                omega={omega}
                showInspCpsLines={showInspCpsLines}
                showInspPrimaryPoints={showInspPrimaryPoints}
                showInspAntipodalPoints={showInspAntipodalPoints}
                showXYPlane={showXYPlane}
                showXZPlane={showXZPlane}
                showYZPlane={showYZPlane}
                isProjectivePointModeActive={isProjectivePointModeActive}
                syntheticNode={syntheticNode}
                setSyntheticNodeIntersections={setSyntheticNodeIntersections}
                syntheticLinePoints={syntheticLinePoints}
                setSyntheticLineIntersections={setSyntheticLineIntersections}
                setSyntheticLinePoint1Intersections={setSyntheticLinePoint1Intersections}
                setSyntheticLinePoint2Intersections={setSyntheticLinePoint2Intersections}
                showSyntheticPlane={showSyntheticPlane}
                showSyntheticNodeDualPlane={showSyntheticNodeDualPlane}
                setSyntheticNodeDualLineEquation={setSyntheticNodeDualLineEquation}
                setSyntheticP1DualLineEquation={setSyntheticP1DualLineEquation}
                setSyntheticP2DualLineEquation={setSyntheticP2DualLineEquation}
                setSyntheticP1PlaneCoords={setSyntheticP1PlaneCoords}
                setSyntheticP2PlaneCoords={setSyntheticP2PlaneCoords}
                showSyntheticNodeDualLine={showSyntheticNodeDualLine}
                setSyntheticNodeDualPlaneEquation={setSyntheticNodeDualPlaneEquation}
                setClosestNodeOnNormal={setClosestNodeOnNormal}
                lattice={lattice}
                activeInspectionTab={activeInspectionTab}
                showCalculatedInversionPoint={showCalculatedInversionPoint}
                inversionType={inversionType}
                latticeFactor={currentLatticeFactor}
              />
            </div>
          </div>

          {isRightPanelVisible && (
            <>
              <Resizer onMouseDown={handleMouseDown('right')} />
              <aside className="h-full overflow-y-auto flex-shrink-0" style={{ width: `${rightPanelWidth}px` }}>
                <RightControls
                  activeRightPanel={activeRightPanel}
                  selectionMode={selectionMode}
                  showOriginSphere={showOriginSphere}
                  onShowOriginSphereChange={setShowOriginSphere}
                  originSphereOpacity={originSphereOpacity}
                  onOriginSphereOpacityChange={setOriginSphereOpacity}
                  ellipticalRadiusInput={ellipticalRadiusInput}
                  onEllipticalRadiusInputChange={setEllipticalRadiusInput}
                  isolateNodesOnEllipticalSphere={isolateNodesOnEllipticalSphere}
                  onIsolateNodesOnEllipticalSphereChange={handleIsolateNodesOnEllipticalSphereChange}
                  hideNodesOutsideEllipticalSphere={hideNodesOutsideEllipticalSphere}
                  onHideNodesOutsideEllipticalSphereChange={handleHideNodesOutsideEllipticalSphereChange}
                  isolatedNodeCount={isolatedNodeCount}
                  visibleNodeCount={visibleNodeCount}
                  showSphere2={showSphere2}
                  onShowSphere2Change={setShowSphere2}
                  sphere2Opacity={sphere2Opacity}
                  onSphere2OpacityChange={setSphere2Opacity}
                  showCylinder={showCylinder}
                  onShowCylinderChange={setShowCylinder}
                  cylinderRadius={cylinderRadius}
                  onCylinderRadiusChange={setCylinderRadius}
                  cylinderHeight={cylinderHeight}
                  onCylinderHeightChange={setCylinderHeight}
                  cylinderAzimuth={cylinderAzimuth}
                  onCylinderAzimuthChange={setCylinderAzimuth}
                  cylinderInclination={cylinderInclination}
                  onCylinderInclinationChange={setCylinderInclination}
                  showCpsLines={showCpsLines}
                  onShowCpsLinesChange={setShowCpsLines}
                  showProjectivePoints={showProjectivePoints}
                  onShowProjectivePointsChange={setShowProjectivePoints}
                  showCpsLinesSet2={showCpsLinesSet2}
                  onShowCpsLinesSet2Change={setShowCpsLinesSet2}
                  showProjectivePointsSet2={showProjectivePointsSet2}
                  onShowProjectivePointsSet2Change={setShowProjectivePointsSet2}
                  showAntipodalSphere={showAntipodalSphere}
                  onShowAntipodalSphereChange={setShowAntipodalSphere}
                  showAntipodalPlane={showAntipodalPlane}
                  onShowAntipodalPlaneChange={setShowAntipodalPlane}
                  showAntipodalProjectivePointsSet1={showAntipodalProjectivePointsSet1}
                  onShowAntipodalProjectivePointsSet1Change={setShowAntipodalProjectivePointsSet1}
                  showAntipodalProjectivePointsSet2={showAntipodalProjectivePointsSet2}
                  onShowAntipodalProjectivePointsSet2Change={setShowAntipodalProjectivePointsSet2}
                  omega={omega}
                  onOmegaChange={handleOmegaChange}
                  showInspCpsLines={showInspCpsLines}
                  onShowInspCpsLinesChange={setShowInspCpsLines}
                  showInspPrimaryPoints={showInspPrimaryPoints}
                  onShowInspPrimaryPointsChange={setShowInspPrimaryPoints}
                  showInspAntipodalPoints={showInspAntipodalPoints}
                  onShowInspAntipodalPointsChange={setShowInspAntipodalPoints}
                  syntheticNodeInput={syntheticNodeInput}
                  onSyntheticNodeInputChange={handleSyntheticNodeInputChange}
                  syntheticNodeInput2={syntheticNodeInput2}
                  onSyntheticNodeInput2Change={handleSyntheticNodeInput2Change}
                  onCreateSyntheticNode={handleCreateSyntheticNode}
                  onCreateSyntheticLine={handleCreateSyntheticLine}
                  onClearSyntheticGeometry={handleClearSyntheticGeometry}
                  syntheticNodeIntersections={syntheticNodeIntersections}
                  syntheticLinePoints={syntheticLinePoints}
                  syntheticLineIntersections={syntheticLineIntersections}
                  syntheticPlaneEquation={syntheticPlaneEquation}
                  syntheticLinePoint1Intersections={syntheticLinePoint1Intersections}
                  syntheticLinePoint2Intersections={syntheticLinePoint2Intersections}
                  primaryPlaneLineEquation={primaryPlaneLineEquation}
                  antipodalPlaneLineEquation={antipodalPlaneLineEquation}
                  showSyntheticPlane={showSyntheticPlane}
                  onShowSyntheticPlaneChange={setShowSyntheticPlane}
                  showSyntheticNodeDualPlane={showSyntheticNodeDualPlane}
                  onShowSyntheticNodeDualPlaneChange={setShowSyntheticNodeDualPlane}
                  syntheticNodeDualLineEquation={syntheticNodeDualLineEquation}
                  syntheticP1DualLineEquation={syntheticP1DualLineEquation}
                  syntheticP2DualLineEquation={syntheticP2DualLineEquation}
                  syntheticP1PlaneCoords={syntheticP1PlaneCoords}
                  syntheticP2PlaneCoords={syntheticP2PlaneCoords}
                  showSyntheticNodeDualLine={showSyntheticNodeDualLine}
                  onShowSyntheticNodeDualLineChange={setShowSyntheticNodeDualLine}
                  syntheticNodeDualPlaneEquation={syntheticNodeDualPlaneEquation}
                  onSaveCoordinates={handleSaveCoordinates}
                  currentPdbName={currentPdbName}
                  lattice={lattice}
                  latticeFactor={currentLatticeFactor}
                />
              </aside>
            </>
          )}
        </div>
      </main>
      {isTranscriptionPanelVisible && <LiveTranscription />}
      <Footer />
      <UserGuideDialog isOpen={isUserGuideOpen} onClose={() => setIsUserGuideOpen(false)} />
    </div>
  );
};

export default App;