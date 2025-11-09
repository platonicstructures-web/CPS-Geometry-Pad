import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { DisplayStyle, AtomSpec, SelectionMode, MoleculeMetadata, IntersectionPoints, IntersectionDistances, ProjectivePointInfo, PlaneIntersectionPoint, TriangleAnalysis, TrianglePlaneAnalysis, HoveredProjectivePointInfo, InspectionData, Lattice, BondMode } from '../types';

declare const $3Dmol: any;

export interface PdbViewerHandles {
  setView: (view: string) => void;
  saveCoordinates: () => void;
}

interface PdbViewerProps {
  pdbData: string | null;
  style: DisplayStyle;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  selectionMode: SelectionMode;
  selectedAtoms: AtomSpec[];
  setSelectedAtoms: React.Dispatch<React.SetStateAction<AtomSpec[]>>;
  selectedProjectivePoint: ProjectivePointInfo | null;
  setSelectedProjectivePoint: (info: ProjectivePointInfo | null) => void;
  inspectionData: InspectionData | null;
  setInspectionData: (data: InspectionData | null) => void;
  setHoveredAtom: (atom: AtomSpec | null) => void;
  setHoveredProjectivePoint: (info: HoveredProjectivePointInfo | null) => void;
  setDistances: (distances: number[] | null) => void;
  setNodeAngle: (angle: number | null) => void;
  setProjectivePointsDistance: (distances: { primary?: number; antipodal?: number } | null) => void;
  setIntersectionPoints: (points: IntersectionPoints[] | null) => void;
  setIntersectionDistances: (distances: IntersectionDistances | null) => void;
  setTriangleAnalysis: (analysis: TriangleAnalysis | null) => void;
  setTrianglePlaneEquation: (equation: string | null) => void;
  setTrianglePlaneAzimuth: (azimuth: number | null) => void;
  setTrianglePlaneInclination: (inclination: number | null) => void;
  setTrianglePlaneDistanceToOrigin: (distance: number | null) => void;
  showTrianglePlane: boolean;
  hideNodesNotOnTrianglePlane: boolean;
  showParallelPlane: boolean;
  parallelPlaneDistance: number;
  isolateNodesOnParallelPlane: boolean;
  atomScale: number;
  stickRadius: number;
  lineRadius: number;
  bondScale: number;
  bondMode: BondMode;
  setMetadata: React.Dispatch<React.SetStateAction<MoleculeMetadata | null>>;
  normalLineLength: number;
  showOriginSphere: boolean;
  originSphereOpacity: number;
  ellipticalRadius: number;
  isolateNodesOnEllipticalSphere: boolean;
  hideNodesOutsideEllipticalSphere: boolean;
  setIsolatedNodeCount: (count: number | null) => void;
  setVisibleNodeCount: (count: number | null) => void;
  showSphere2: boolean;
  sphere2Opacity: number;
  showCylinder: boolean;
  cylinderRadius: number;
  cylinderHeight: number;
  cylinderAzimuth: number;
  cylinderInclination: number;
  viewerBackground: string;
  showAxes: boolean;
  showCpsLines: boolean;
  showProjectivePoints: boolean;
  showCpsLinesSet2: boolean;
  showProjectivePointsSet2: boolean;
  projectivePointRadius: number;
  showAntipodalSphere: boolean;
  showAntipodalPlane: boolean;
  showAntipodalProjectivePointsSet1: boolean;
  showAntipodalProjectivePointsSet2: boolean;
  omega: { x: number; y: number; z: number; };
  showInspCpsLines: boolean;
  showInspPrimaryPoints: boolean;
  showInspAntipodalPoints: boolean;
  showXYPlane: boolean;
  showXZPlane: boolean;
  showYZPlane: boolean;
  isProjectivePointModeActive: boolean;
  syntheticNode: { x: number; y: number; z: number } | null;
  setSyntheticNodeIntersections: (points: IntersectionPoints | null) => void;
  syntheticLinePoints: { p1: { x: number, y: number, z: number }, p2: { x: number, y: number, z: number } } | null;
  setSyntheticLineIntersections: (points: IntersectionPoints | null) => void;
  setSyntheticLinePoint1Intersections: (points: IntersectionPoints | null) => void;
  setSyntheticLinePoint2Intersections: (points: IntersectionPoints | null) => void;
  showSyntheticPlane: boolean;
  showSyntheticNodeDualPlane: boolean;
  setSyntheticNodeDualLineEquation: (equation: string | null) => void;
  setSyntheticP1DualLineEquation: (equation: string | null) => void;
  setSyntheticP2DualLineEquation: (equation: string | null) => void;
  setSyntheticP1PlaneCoords: (coords: { x: number; y: number; z: number; } | null) => void;
  setSyntheticP2PlaneCoords: (coords: { x: number; y: number; z: number; } | null) => void;
  showSyntheticNodeDualLine: boolean;
  setSyntheticNodeDualPlaneEquation: (equation: string | null) => void;
  setClosestNodeOnNormal: (atom: AtomSpec | null) => void;
  lattice: Lattice;
  activeInspectionTab: 'reflection' | 'inversion' | 'multiplication';
  showCalculatedInversionPoint: boolean;
  inversionType: 'geometric' | 'complex';
  latticeFactor: number;
}

// FIX: Corrected component signature to properly destructure props, resolving a large number of "Cannot find name" errors.
const PdbViewer = forwardRef<PdbViewerHandles, PdbViewerProps>(({
  pdbData, style, setIsLoading, setError, selectionMode, selectedAtoms, setSelectedAtoms,
  selectedProjectivePoint, setSelectedProjectivePoint, inspectionData, setInspectionData,
  setHoveredAtom, setHoveredProjectivePoint, setDistances, setNodeAngle,
  setProjectivePointsDistance, setIntersectionPoints, setIntersectionDistances,
  setTriangleAnalysis, setTrianglePlaneEquation, setTrianglePlaneAzimuth,
  setTrianglePlaneInclination, setTrianglePlaneDistanceToOrigin, showTrianglePlane,
  hideNodesNotOnTrianglePlane, showParallelPlane, parallelPlaneDistance,
  isolateNodesOnParallelPlane, atomScale, stickRadius, lineRadius, bondScale, bondMode,
  setMetadata, normalLineLength, showOriginSphere, originSphereOpacity, ellipticalRadius,
  isolateNodesOnEllipticalSphere, hideNodesOutsideEllipticalSphere, setIsolatedNodeCount,
  setVisibleNodeCount, showSphere2, sphere2Opacity, showCylinder, cylinderRadius,
  cylinderHeight, cylinderAzimuth, cylinderInclination, viewerBackground, showAxes,
  showCpsLines, showProjectivePoints, showCpsLinesSet2, showProjectivePointsSet2,
  projectivePointRadius, showAntipodalSphere, showAntipodalPlane,
  showAntipodalProjectivePointsSet1, showAntipodalProjectivePointsSet2, omega,
  showInspCpsLines, showInspPrimaryPoints, showInspAntipodalPoints, showXYPlane,
  showXZPlane, showYZPlane, isProjectivePointModeActive, syntheticNode,
  setSyntheticNodeIntersections, syntheticLinePoints, setSyntheticLineIntersections,
  setSyntheticLinePoint1Intersections, setSyntheticLinePoint2Intersections,
  showSyntheticPlane, showSyntheticNodeDualPlane, setSyntheticNodeDualLineEquation,
  setSyntheticP1DualLineEquation, setSyntheticP2DualLineEquation, setSyntheticP1PlaneCoords,
  setSyntheticP2PlaneCoords, showSyntheticNodeDualLine, setSyntheticNodeDualPlaneEquation,
  setClosestNodeOnNormal, lattice, activeInspectionTab, showCalculatedInversionPoint,
  inversionType, latticeFactor,
}, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const glViewer = useRef<any>(null);

  const [modelData, setModelData] = useState<string | null>(null);

  const prevModelData = usePrevious(modelData);
  const prevStyle = usePrevious(style);
  const prevBondScale = usePrevious(bondScale);
  const prevBondMode = usePrevious(bondMode);

  useImperativeHandle(ref, () => ({
    setView(view: string) {
      if (!glViewer.current) return;
      const matrix = VIEW_MATRICES[view];
      if (matrix) {
        glViewer.current.setView(matrix);
        glViewer.current.render();
      }
    },
    saveCoordinates() {
        if (!glViewer.current) return;
        
        const atoms = glViewer.current.getModel(0)?.selectedAtoms({});
        if (!atoms || atoms.length === 0) {
            alert("No model loaded or no atoms found to save.");
            return;
        }

        // Recalculate projection parameters
        const omegaVec = vec(omega.x, omega.y, omega.z);
        const R = latticeFactor;
        const phi = cylinderAzimuth * Math.PI / 180;
        const theta = cylinderInclination * Math.PI / 180;
        const cylinderCenterOffset = vec(R * Math.sin(theta) * Math.cos(phi), R * Math.sin(theta) * Math.sin(phi), R * Math.cos(theta));
        const cylinderCenter = add(omegaVec, cylinderCenterOffset);
        const orientationVec = len(cylinderCenterOffset) > 1e-6 ? normalize(cylinderCenterOffset) : vec(0, 0, 1);

        let up = vec(0, 1, 0);
        if (Math.abs(dot(orientationVec, up)) > 0.99) {
            up = vec(1, 0, 0);
        }
        const primaryPlaneXAxis = normalize(cross(up, orientationVec));
        const primaryPlaneYAxis = normalize(cross(orientationVec, primaryPlaneXAxis));
        
        let fileContent = "Node,X_3D,Y_3D,Z_3D,X_2D_Homogeneous,Y_2D_Homogeneous,W_2D_Homogeneous\n";

        atoms.forEach((atom: AtomSpec) => {
            const atomPos = vec(atom.x, atom.y, atom.z);
            const atomVecFromOmega = sub(atomPos, omegaVec);
            
            let projCoords = { x: NaN, y: NaN };
            
            if (len(atomVecFromOmega) > 1e-6) {
                const dotProduct = dot(atomVecFromOmega, orientationVec);
                if (Math.abs(dotProduct) > 1e-6) {
                    const t = dot(sub(cylinderCenter, omegaVec), orientationVec) / dotProduct;
                    const intersectionPoint = add(omegaVec, scale(atomVecFromOmega, t));
                    
                    const pointVecRelativeToCenter = sub(intersectionPoint, cylinderCenter);
                    projCoords.x = dot(pointVecRelativeToCenter, primaryPlaneXAxis);
                    projCoords.y = dot(pointVecRelativeToCenter, primaryPlaneYAxis);
                }
            }

            const row = [
                atom.serial,
                (atom.x / latticeFactor).toFixed(5),
                (atom.y / latticeFactor).toFixed(5),
                (atom.z / latticeFactor).toFixed(5),
                !isNaN(projCoords.x) ? (projCoords.x / latticeFactor).toFixed(5) : "N/A",
                !isNaN(projCoords.y) ? (projCoords.y / latticeFactor).toFixed(5) : "N/A",
                1
            ].join(",");
            fileContent += row + "\n";
        });
        
        const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "cps_coordinates.csv");
        // FIX: Corrected a function call on a string property. The 'visibility' property should be assigned a value, not called as a function.
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }));

  useEffect(() => {
    if (!viewerRef.current || glViewer.current) return;
    const config = { };
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
    const processPdbData = (data: string) => {
      try {
        const parsedMeta = parsePdbMetadata(data);
        setMetadata({ ...parsedMeta, numAtoms: 0 });
        setModelData(data);
      } catch (err: any) {
        console.error('Error parsing PDB data:', err);
        setError(err.message || 'An unknown error occurred while parsing PDB data.');
        setIsLoading(false);
      }
    };

    if (pdbData) {
      setIsLoading(true);
      setError(null);
      setMetadata(null);
      processPdbData(pdbData);
    } else {
      // Clear viewer if no data
      setIsLoading(false);
      setError(null);
      setMetadata(null);
      setModelData(null);
      if (glViewer.current) {
        glViewer.current.clear();
        glViewer.current.render();
      }
    }
  }, [pdbData, setMetadata, setError, setIsLoading]);


  useEffect(() => {
    if (!glViewer.current) return;

    glViewer.current.clear();
    const omegaVec = vec(omega.x, omega.y, omega.z);

    if (showAxes) {
      const axisDiameter = cylinderRadius * 2;
      const axisLength = axisDiameter * 0.8;
      const halfAxisLength = axisLength / 2;

      glViewer.current.addCylinder({ start: { x: omega.x - halfAxisLength, y: omega.y, z: omega.z }, end: { x: omega.x + halfAxisLength, y: omega.y, z: omega.z }, radius: lineRadius, color: 'red' });
      glViewer.current.addLabel('X', { position: { x: omega.x + halfAxisLength + 1, y: omega.y, z: omega.z }, fontColor: 'red', fontSize: 16, showBackground: false });
      glViewer.current.addCylinder({ start: { x: omega.x, y: omega.y - halfAxisLength, z: omega.z }, end: { x: omega.x, y: omega.y + halfAxisLength, z: omega.z }, radius: lineRadius, color: 'green' });
      glViewer.current.addLabel('Y', { position: { x: omega.x, y: omega.y + halfAxisLength + 1, z: omega.z }, fontColor: 'green', fontSize: 16, showBackground: false });
      glViewer.current.addCylinder({ start: { x: omega.x, y: omega.y, z: omega.z - halfAxisLength }, end: { x: omega.x, y: omega.y, z: omega.z + halfAxisLength }, radius: lineRadius, color: 'blue' });
      glViewer.current.addLabel('Z', { position: { x: omega.x, y: omega.y, z: omega.z + halfAxisLength + 1 }, fontColor: 'blue', fontSize: 16, showBackground: false });
    
      // Add cones for positive direction
      const coneLength = axisLength * 0.04;
      const coneRadius = lineRadius * 5;

      // X-axis cone
      glViewer.current.addCylinder({ 
        start: { x: omega.x + halfAxisLength, y: omega.y, z: omega.z }, 
        end: { x: omega.x + halfAxisLength + coneLength, y: omega.y, z: omega.z }, 
        radius: coneRadius, 
        radius2: 0, 
        color: 'red',
        fromCap: true,
        toCap: true,
      });

      // Y-axis cone
      glViewer.current.addCylinder({ 
        start: { x: omega.x, y: omega.y + halfAxisLength, z: omega.z }, 
        end: { x: omega.x, y: omega.y + halfAxisLength + coneLength, z: omega.z }, 
        radius: coneRadius, 
        radius2: 0, 
        color: 'green',
        fromCap: true,
        toCap: true,
      });

      // Z-axis cone
      glViewer.current.addCylinder({ 
        start: { x: omega.x, y: omega.y, z: omega.z + halfAxisLength }, 
        end: { x: omega.x, y: omega.y, z: omega.z + halfAxisLength + coneLength }, 
        radius: coneRadius, 
        radius2: 0, 
        color: 'blue',
        fromCap: true,
        toCap: true,
      });
    }

    if (!modelData) {
      glViewer.current.render();
      return;
    }

    setIsLoading(true);
    setDistances(null);
    setNodeAngle(null);
    setProjectivePointsDistance(null);
    setTriangleAnalysis(null);

    if (bondMode === 'calculated') {
      // Set the global distance factor only when calculating bonds by distance.
      $3Dmol.bondDistanceFactor = bondScale;
      glViewer.current.addModel(modelData, 'pdb', { doBonds: true });
    } else { // 'conect'
      // In 'conect' mode, do not calculate bonds by distance. 3Dmol will use CONECT records.
      // It's also good practice to reset the global factor to its default to avoid side-effects.
      $3Dmol.bondDistanceFactor = 1.15;
      glViewer.current.addModel(modelData, 'pdb', { doBonds: false });
    }
    
    const modelSpec = { model: 0 };
    
    const atoms = glViewer.current.getModel(0)?.selectedAtoms({});
    if (atoms) {
      setMetadata(prev => prev ? { ...prev, numAtoms: atoms.length } : null);
    }

    const colorSchemeName = 'Jmol';
    
    const stickStyle = {
      colorscheme: colorSchemeName,
      radius: stickRadius,
    };
    
    let trianglePlaneNormal: { x: number, y: number, z: number } | null = null;
    let trianglePlaneD: number | null = null;
    let closestNodeOnNormalFromTriangle: AtomSpec | null = null;

    if (selectionMode === 'triangle' && selectedAtoms.length === 3) {
        const [p1, p2, p3] = selectedAtoms.map(a => vec(a.x, a.y, a.z));
        const v1 = sub(p2, p1);
        const v2 = sub(p3, p1);
        const normal = cross(v1, v2);
        if (len(normal) > 1e-6) {
            trianglePlaneNormal = normalize(normal);
            trianglePlaneD = dot(trianglePlaneNormal, p1);
            
            const allAtomsForNormalCheck = glViewer.current.getModel(0)?.selectedAtoms({});
            let minDistanceSq = Infinity;
            if (allAtomsForNormalCheck) {
                const epsilon = 0.01;
                for (const atom of allAtomsForNormalCheck) {
                    const atomPos = vec(atom.x, atom.y, atom.z);
                    const atomLen = len(atomPos);
                    if (atomLen < 1e-6) continue;
                    const normalizedAtomPos = scale(atomPos, 1 / atomLen);
                    const dotProd = dot(normalizedAtomPos, trianglePlaneNormal);
                    if (Math.abs(dotProd) > (1 - epsilon)) {
                        const distSq = atomLen * atomLen;
                        if (distSq < minDistanceSq) {
                            minDistanceSq = distSq;
                            closestNodeOnNormalFromTriangle = atom;
                        }
                    }
                }
            }
            setClosestNodeOnNormal(closestNodeOnNormalFromTriangle);
        } else {
             setClosestNodeOnNormal(null);
        }
    } else if (selectionMode !== 'triangle') {
        setClosestNodeOnNormal(null);
    }
    
    switch(style) {
      case 'line': glViewer.current.setStyle(modelSpec, { line: { colorscheme: colorSchemeName } }); break;
      case 'stick': glViewer.current.setStyle(modelSpec, { stick: stickStyle }); break;
      case 'sphere': glViewer.current.setStyle(modelSpec, { sphere: { radius: atomScale, colorscheme: colorSchemeName } }); break;
      case 'ball and stick': glViewer.current.setStyle(modelSpec, { stick: stickStyle, sphere: { radius: atomScale * 0.6, colorscheme: colorSchemeName } }); break;
      case 'hidden':
        if (selectedAtoms.length > 0) {
            const selectedSpec = { serial: selectedAtoms.map(a => a.serial) };
            const unselectedSpec = { not: selectedSpec };

            // Explicitly hide the unselected atoms
            glViewer.current.setStyle(unselectedSpec, {
                line: { hidden: true },
                stick: { hidden: true },
                sphere: { hidden: true }
            });
            
            // Explicitly show the selected atoms with the default style
            glViewer.current.setStyle(selectedSpec, {
                stick: stickStyle,
                sphere: { radius: atomScale * 0.6, colorscheme: colorSchemeName }
            });

        } else {
            // If no atoms are selected, hide everything
            glViewer.current.setStyle({}, {
                line: { hidden: true },
                stick: { hidden: true },
                sphere: { hidden: true }
            });
        }
        break;
      default: glViewer.current.setStyle(modelSpec, { stick: stickStyle }); break;
    }
    
    // --- GEOMETRIC GUIDES SETUP ---
    const R = latticeFactor; // Riemann sphere radius for this construction
    if (showOriginSphere) {
      glViewer.current.addSphere({ center: omegaVec, radius: ellipticalRadius, color: 'white', opacity: originSphereOpacity });
    }

    const planeRadius = cylinderRadius;
    const planeHeight = cylinderHeight;
    const planeOpacity = 0.4;
    
    if (showXYPlane) {
        const normal = vec(0, 0, 1);
        const halfHeightVec = scale(normal, planeHeight / 2);
        glViewer.current.addCylinder({
            start: sub(omegaVec, halfHeightVec),
            end: add(omegaVec, halfHeightVec),
            radius: planeRadius,
            color: 'blue',
            opacity: planeOpacity,
            fromCap: 1,
            toCap: 1
        });
    }
    if (showXZPlane) {
        const normal = vec(0, 1, 0);
        const halfHeightVec = scale(normal, planeHeight / 2);
        glViewer.current.addCylinder({
            start: sub(omegaVec, halfHeightVec),
            end: add(omegaVec, halfHeightVec),
            radius: planeRadius,
            color: 'green',
            opacity: planeOpacity,
            fromCap: 1,
            toCap: 1
        });
    }
    if (showYZPlane) {
        const normal = vec(1, 0, 0);
        const halfHeightVec = scale(normal, planeHeight / 2);
        glViewer.current.addCylinder({
            start: sub(omegaVec, halfHeightVec),
            end: add(omegaVec, halfHeightVec),
            radius: planeRadius,
            color: 'red',
            opacity: planeOpacity,
            fromCap: 1,
            toCap: 1
        });
    }
    
    const phi = cylinderAzimuth * Math.PI / 180;
    const theta = cylinderInclination * Math.PI / 180;
    
    const cylinderCenterOffset = vec(R * Math.sin(theta) * Math.cos(phi), R * Math.sin(theta) * Math.sin(phi), R * Math.cos(theta));
    const cylinderCenter = add(omegaVec, cylinderCenterOffset);
    const orientationVec = len(cylinderCenterOffset) > 1e-6 ? normalize(cylinderCenterOffset) : vec(0, 0, 1);

    // Primary plane axes, used for drawing on the plane and for synthetic geometry
    let up = vec(0, 1, 0);
    if (Math.abs(dot(orientationVec, up)) > 0.99) {
        up = vec(1, 0, 0); // Use X-axis if normal is too close to Y-axis
    }
    const primaryPlaneXAxis = normalize(cross(up, orientationVec));
    const primaryPlaneYAxis = normalize(cross(orientationVec, primaryPlaneXAxis));

    if (showSphere2) {
      glViewer.current.addSphere({ center: cylinderCenter, radius: R, color: 'yellow', opacity: sphere2Opacity });
    }
    
    if (showCylinder) {
      const halfHeightVec = scale(orientationVec, cylinderHeight / 2);
      glViewer.current.addCylinder({ start: sub(cylinderCenter, halfHeightVec), end: add(cylinderCenter, halfHeightVec), radius: cylinderRadius, color: 'lightgreen', opacity: 0.7, fromCap: 1, toCap: 1 });
      
      // Draw orthogonal diameters on the cylinder base
      const xStart = sub(cylinderCenter, scale(primaryPlaneXAxis, cylinderRadius));
      const xEnd = add(cylinderCenter, scale(primaryPlaneXAxis, cylinderRadius));
      glViewer.current.addCylinder({ start: xStart, end: xEnd, radius: lineRadius * 0.5, color: 'white' });

      const yStart = sub(cylinderCenter, scale(primaryPlaneYAxis, cylinderRadius));
      const yEnd = add(cylinderCenter, scale(primaryPlaneYAxis, cylinderRadius));
      glViewer.current.addCylinder({ start: yStart, end: yEnd, radius: lineRadius * 0.5, color: 'white' });
      
      const coneLength = cylinderRadius * 0.05;
      const coneRadius = lineRadius * 4;
      const xConeEnd = add(xEnd, scale(primaryPlaneXAxis, coneLength));
      const yConeEnd = add(yEnd, scale(primaryPlaneYAxis, coneLength));
      glViewer.current.addCylinder({ start: xEnd, end: xConeEnd, radius: coneRadius, radius2: 0, color: 'white', fromCap: true, toCap: true });
      glViewer.current.addCylinder({ start: yEnd, end: yConeEnd, radius: coneRadius, radius2: 0, color: 'white', fromCap: true, toCap: true });
      glViewer.current.addLabel("X'", { position: add(xConeEnd, scale(primaryPlaneXAxis, 0.5)), fontColor: 'white', fontSize: 14, showBackground: false });
      glViewer.current.addLabel("Y'", { position: add(yConeEnd, scale(primaryPlaneYAxis, 0.5)), fontColor: 'white', fontSize: 14, showBackground: false });

      const numSegments = 64;
      for (let i = 0; i < numSegments; i++) {
        const angle1 = i * (2 * Math.PI / numSegments);
        const angle2 = (i + 1) * (2 * Math.PI / numSegments);
        const p1 = add(cylinderCenter, add(scale(primaryPlaneXAxis, R * Math.cos(angle1)), scale(primaryPlaneYAxis, R * Math.sin(angle1))));
        const p2 = add(cylinderCenter, add(scale(primaryPlaneXAxis, R * Math.cos(angle2)), scale(primaryPlaneYAxis, R * Math.sin(angle2))));
        glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius * 0.5, color: 'cyan' });
      }
    }

    const shouldCalculateAnti = showAntipodalSphere || showAntipodalPlane || showAntipodalProjectivePointsSet1 || showAntipodalProjectivePointsSet2 || (selectionMode === 'node' && selectedAtoms.length > 0);
    let antiCenter: any, antiOrientationVec: any, antiPlaneXAxis: any, antiPlaneYAxis: any;
    if (shouldCalculateAnti) {
        const antiCenterOffset = scale(cylinderCenterOffset, -1);
        antiCenter = add(omegaVec, antiCenterOffset);
        antiOrientationVec = len(antiCenterOffset) > 1e-6 ? normalize(antiCenterOffset) : vec(0, 0, -1);

        let antiUp = vec(0, 1, 0);
        if (Math.abs(dot(antiOrientationVec, antiUp)) > 0.99) {
            antiUp = vec(1, 0, 0);
        }
        antiPlaneXAxis = normalize(cross(antiUp, antiOrientationVec));
        antiPlaneYAxis = normalize(cross(antiOrientationVec, antiPlaneXAxis));

        if (showAntipodalSphere) {
            glViewer.current.addSphere({ center: antiCenter, radius: R, color: 'darkorange', opacity: sphere2Opacity });
        }
        if (showAntipodalPlane) {
            const halfHeightVec = scale(antiOrientationVec, cylinderHeight / 2);
            glViewer.current.addCylinder({ start: sub(antiCenter, halfHeightVec), end: add(antiCenter, halfHeightVec), radius: cylinderRadius, color: 'plum', opacity: 0.7, fromCap: 1, toCap: 1 });
            
            const xStart = sub(antiCenter, scale(antiPlaneXAxis, cylinderRadius));
            const xEnd = add(antiCenter, scale(antiPlaneXAxis, cylinderRadius));
            glViewer.current.addCylinder({ start: xStart, end: xEnd, radius: lineRadius * 0.5, color: 'white' });
      
            const yStart = sub(antiCenter, scale(antiPlaneYAxis, cylinderRadius));
            const yEnd = add(antiCenter, scale(antiPlaneYAxis, cylinderRadius));
            glViewer.current.addCylinder({ start: yStart, end: yEnd, radius: lineRadius * 0.5, color: 'white' });

            const coneLength = cylinderRadius * 0.05;
            const coneRadius = lineRadius * 4;
            const xConeEnd = add(xEnd, scale(antiPlaneXAxis, coneLength));
            const yConeEnd = add(yEnd, scale(antiPlaneYAxis, coneLength));
            glViewer.current.addCylinder({ start: xEnd, end: xConeEnd, radius: coneRadius, radius2: 0, color: 'white', fromCap: true, toCap: true });
            glViewer.current.addCylinder({ start: yEnd, end: yConeEnd, radius: coneRadius, radius2: 0, color: 'white', fromCap: true, toCap: true });
            glViewer.current.addLabel("X'", { position: add(xConeEnd, scale(antiPlaneXAxis, 0.5)), fontColor: 'white', fontSize: 14, showBackground: false });
            glViewer.current.addLabel("Y'", { position: add(yConeEnd, scale(antiPlaneYAxis, 0.5)), fontColor: 'white', fontSize: 14, showBackground: false });

            const numSegments = 64;
            for (let i = 0; i < numSegments; i++) {
              const angle1 = i * (2 * Math.PI / numSegments);
              const angle2 = (i + 1) * (2 * Math.PI / numSegments);
              const p1 = add(antiCenter, add(scale(antiPlaneXAxis, R * Math.cos(angle1)), scale(antiPlaneYAxis, R * Math.sin(angle1))));
              const p2 = add(antiCenter, add(scale(antiPlaneXAxis, R * Math.cos(angle2)), scale(antiPlaneYAxis, R * Math.sin(angle2))));
              glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius * 0.5, color: 'magenta' });
            }
        }
    }
    
    // Start with all atoms, then filter if isolation/hiding is active
    let atomsForProjection = atoms ? [...atoms] : [];

    if (trianglePlaneNormal && (hideNodesNotOnTrianglePlane || isolateNodesOnParallelPlane)) {
        const allAtoms = glViewer.current.getModel(0)?.selectedAtoms({});
        if (allAtoms) {
            const atomsToHideSerials: number[] = [];
            const atomsOnPlaneSerials: number[] = [];
            const visibleAtomsList: AtomSpec[] = [];
            const epsilon = 0.05;

            const d_target = hideNodesNotOnTrianglePlane ? trianglePlaneD! : parallelPlaneDistance;

            allAtoms.forEach((atom: AtomSpec) => {
                if (atom.serial === closestNodeOnNormalFromTriangle?.serial) {
                    atomsOnPlaneSerials.push(atom.serial);
                    visibleAtomsList.push(atom);
                    return;
                }

                const atomPos = vec(atom.x, atom.y, atom.z);
                const distanceToPlane = Math.abs(dot(trianglePlaneNormal!, atomPos) - d_target);
                if (distanceToPlane > epsilon) {
                    atomsToHideSerials.push(atom.serial);
                } else {
                    atomsOnPlaneSerials.push(atom.serial);
                    visibleAtomsList.push(atom);
                }
            });
            
            atomsForProjection = visibleAtomsList;

            if (atomsToHideSerials.length > 0) {
                glViewer.current.setStyle({ serial: atomsToHideSerials }, {
                    stick: { hidden: true },
                    sphere: { hidden: true },
                    line: { hidden: true }
                });
            }

            if (atomsOnPlaneSerials.length > 0) {
                 glViewer.current.setStyle({ serial: atomsOnPlaneSerials }, {
                    stick: stickStyle,
                    sphere: { radius: atomScale * 0.6, colorscheme: colorSchemeName }
                });
            }
        }
    } else if (isolateNodesOnEllipticalSphere || hideNodesOutsideEllipticalSphere) {
        const allAtoms = glViewer.current.getModel(0)?.selectedAtoms({});
        if (allAtoms) {
            const atomsToHideSerials: number[] = [];
            const visibleAtomsList: AtomSpec[] = [];
            const epsilon = 0.05;
            let isolatedCount = 0;
            let visibleCount = 0;

            allAtoms.forEach((atom: AtomSpec) => {
                const atomPos = vec(atom.x, atom.y, atom.z);
                const distanceToOrigin = len(atomPos);
                let hide = false;

                if (isolateNodesOnEllipticalSphere) {
                    if (Math.abs(distanceToOrigin - ellipticalRadius) > epsilon) {
                        hide = true;
                    } else {
                        isolatedCount++;
                    }
                } else if (hideNodesOutsideEllipticalSphere) {
                    if (distanceToOrigin > ellipticalRadius + epsilon) {
                        hide = true;
                    } else {
                        visibleCount++;
                    }
                }
                
                if (hide) {
                    if (atom.serial !== closestNodeOnNormalFromTriangle?.serial) {
                        atomsToHideSerials.push(atom.serial);
                    } else {
                        visibleAtomsList.push(atom);
                    }
                } else {
                    visibleAtomsList.push(atom);
                }
            });

            setIsolatedNodeCount(isolateNodesOnEllipticalSphere ? isolatedCount : null);
            setVisibleNodeCount(hideNodesOutsideEllipticalSphere ? visibleCount : null);
            atomsForProjection = visibleAtomsList;

            if (atomsToHideSerials.length > 0) {
                glViewer.current.setStyle({ serial: atomsToHideSerials }, {
                    stick: { hidden: true },
                    sphere: { hidden: true },
                    line: { hidden: true }
                });
            }
        } else {
            setIsolatedNodeCount(null);
            setVisibleNodeCount(null);
        }
    } else {
        setIsolatedNodeCount(null);
        setVisibleNodeCount(null);
    }

    // --- INTERSECTION HELPERS ---
    const findPlaneIntersection = (planeCenter: any, planeNormal: any, lineOrigin: any, direction: any): PlaneIntersectionPoint | null => {
      const denominator = dot(direction, planeNormal);
      if (Math.abs(denominator) < 1e-6) return null;
      const t = dot(sub(planeCenter, lineOrigin), planeNormal) / denominator;
      const point = add(lineOrigin, scale(direction, t));
      
      const distanceToPlaneCenter = len(sub(point, planeCenter));
      
      let tangent1 = vec(0, 1, 0);
      if (Math.abs(dot(planeNormal, tangent1)) > 0.99) {
          tangent1 = vec(1, 0, 0);
      }
      const localX = normalize(cross(tangent1, planeNormal));
      const localY = normalize(cross(planeNormal, localX));
      
      const pointVecRelativeToCenter = sub(point, planeCenter);

      const relativeCoords = {
          x: dot(pointVecRelativeToCenter, localX),
          y: dot(pointVecRelativeToCenter, localY),
          z: dot(pointVecRelativeToCenter, planeNormal)
      };

      return { 
          coords: point, 
          distanceToOrigin: len(point),
          relativeCoords,
          distanceToPlaneCenter
      };
    };
    
    // --- STEREOGRAPHIC PROJECTIONS ---
    const showAnyProjections = showProjectivePoints || showProjectivePointsSet2 || showAntipodalProjectivePointsSet1 || showAntipodalProjectivePointsSet2;

    if (atomsForProjection && (showCpsLines || showAnyProjections)) {
      const lineLength = cylinderRadius * 2;
      
      const primaryProjectedPointsMap = new Map<number, { atom: AtomSpec; projInfo: ProjectivePointInfo }>();
      const antipodalProjectedPointsMap = new Map<number, { atom: AtomSpec; projInfo: ProjectivePointInfo }>();
      
      // Pass 1: Calculate all projections and draw CPS lines
      atomsForProjection.forEach((atom: AtomSpec) => {
        const atomPos = vec(atom.x, atom.y, atom.z);
        const atomVecFromOmega = sub(atomPos, omegaVec);
        if (len(atomVecFromOmega) < 1e-6) return;

        const dotProduct = dot(atomVecFromOmega, orientationVec);

        if (dotProduct >= -1e-6) {
           if (showCpsLines) {
              const direction = normalize(atomVecFromOmega);
              glViewer.current.addCylinder({ start: omegaVec, end: add(omegaVec, scale(direction, lineLength)), radius: lineRadius, color: 'orange' });
           }
        } else if (dotProduct < -1e-6) {
          if (showCpsLinesSet2) {
            const direction = normalize(atomVecFromOmega);
            glViewer.current.addCylinder({ start: omegaVec, end: add(omegaVec, scale(direction, lineLength)), radius: lineRadius, color: 'gold' });
          }
        }

        if ((showProjectivePoints || showProjectivePointsSet2) && Math.abs(dotProduct) > 1e-6) {
             const t = dot(sub(cylinderCenter, omegaVec), orientationVec) / dotProduct;
             const intersectionPoint = add(omegaVec, scale(atomVecFromOmega, t));
             const pointVecRelativeToCenter = sub(intersectionPoint, cylinderCenter);
             const relativeCoords = {
                 x: dot(pointVecRelativeToCenter, primaryPlaneXAxis),
                 y: dot(pointVecRelativeToCenter, primaryPlaneYAxis),
                 z: dot(pointVecRelativeToCenter, orientationVec)
             };
             const projInfo: ProjectivePointInfo = {
                 coords: intersectionPoint,
                 distanceToOrigin: len(intersectionPoint),
                 plane: 'primary',
                 relativeCoords,
                 distanceToPlaneCenter: len(pointVecRelativeToCenter),
             };
             primaryProjectedPointsMap.set(atom.serial, { atom, projInfo });
        }
        
        if (shouldCalculateAnti && (showAntipodalProjectivePointsSet1 || showAntipodalProjectivePointsSet2)) {
            const dotProductAnti = dot(atomVecFromOmega, antiOrientationVec);
            if (Math.abs(dotProductAnti) > 1e-6) {
                const t = dot(sub(antiCenter, omegaVec), antiOrientationVec) / dotProductAnti;
                const intersectionPoint = add(omegaVec, scale(atomVecFromOmega, t));
                const pointVecRelativeToCenter = sub(intersectionPoint, antiCenter);
                const relativeCoords = {
                    x: dot(pointVecRelativeToCenter, antiPlaneXAxis),
                    y: dot(pointVecRelativeToCenter, antiPlaneYAxis),
                    z: dot(pointVecRelativeToCenter, antiOrientationVec)
                };
                const projInfo: ProjectivePointInfo = {
                    coords: intersectionPoint,
                    distanceToOrigin: len(intersectionPoint),
                    plane: 'antipodal',
                    relativeCoords,
                    distanceToPlaneCenter: len(pointVecRelativeToCenter),
                };
                antipodalProjectedPointsMap.set(atom.serial, { atom, projInfo });
            }
        }
      });
      
      // Define the click handler which uses the populated maps
      const createProjectivePointClickHandler = (
          clickedAtom: AtomSpec,
          clickedProjInfo: ProjectivePointInfo
      ) => () => {
          if (selectionMode === 'inspection') {
            let inverted3DNode: AtomSpec | null = null;
            let invertedProjectedPoint: ProjectivePointInfo | null = null;
            let inversionTestResult = "N/A for Triangle Lattice";

            if (lattice === 'square') {
                inversionTestResult = "Matching inverted point not found";
                const targetCoords = { x: clickedAtom.x, y: clickedAtom.y, z: -clickedAtom.z };
                const epsilonSq = (0.01 * latticeFactor) * (0.01 * latticeFactor);
                const allAtomsForSearch = glViewer.current.getModel(0)?.selectedAtoms({});

                if (allAtomsForSearch) {
                    for (const atom of allAtomsForSearch) {
                        if (atom.serial === clickedAtom.serial) continue;
                        const dx = atom.x - targetCoords.x;
                        const dy = atom.y - targetCoords.y;
                        const dz = atom.z - targetCoords.z;
                        if ((dx * dx + dy * dy + dz * dz) < epsilonSq) {
                            inverted3DNode = atom;
                            break;
                        }
                    }
                }
            }

            let calculatedInvertedPoint: ProjectivePointInfo | null = null;
            let calculatedComplexInvertedPoint: ProjectivePointInfo | null = null;
            
            const R_unit = latticeFactor;
            const R_sq = R_unit * R_unit;
            const p1_rel = clickedProjInfo.relativeCoords;
            const p1_mag_sq = p1_rel.x * p1_rel.x + p1_rel.y * p1_rel.y;

            if (p1_mag_sq > 1e-6) {
                const planeCenter = clickedProjInfo.plane === 'primary' ? cylinderCenter : antiCenter;
                const xAxis = clickedProjInfo.plane === 'primary' ? primaryPlaneXAxis : antiPlaneXAxis;
                const yAxis = clickedProjInfo.plane === 'primary' ? primaryPlaneYAxis : antiPlaneYAxis;
                const orientation = clickedProjInfo.plane === 'primary' ? orientationVec : antiOrientationVec;
                
                // Geometric Inversion
                const inverted_x_geo = R_sq * p1_rel.x / p1_mag_sq;
                const inverted_y_geo = R_sq * p1_rel.y / p1_mag_sq;
                const calculated3DCoordsGeo = add(planeCenter, add(scale(xAxis, inverted_x_geo), scale(yAxis, inverted_y_geo)));
                const pointVecRelativeToCenterGeo = sub(calculated3DCoordsGeo, planeCenter);
                
                calculatedInvertedPoint = {
                    coords: calculated3DCoordsGeo,
                    distanceToOrigin: len(calculated3DCoordsGeo),
                    plane: clickedProjInfo.plane,
                    relativeCoords: {
                       x: dot(pointVecRelativeToCenterGeo, xAxis),
                       y: dot(pointVecRelativeToCenterGeo, yAxis),
                       z: dot(pointVecRelativeToCenterGeo, orientation)
                    },
                    distanceToPlaneCenter: len(pointVecRelativeToCenterGeo),
                };

                // Complex Inversion
                const inverted_x_cplx = R_sq * p1_rel.x / p1_mag_sq;
                const inverted_y_cplx = -R_sq * p1_rel.y / p1_mag_sq;
                const calculated3DCoordsCplx = add(planeCenter, add(scale(xAxis, inverted_x_cplx), scale(yAxis, inverted_y_cplx)));
                const pointVecRelativeToCenterCplx = sub(calculated3DCoordsCplx, planeCenter);

                calculatedComplexInvertedPoint = {
                    coords: calculated3DCoordsCplx,
                    distanceToOrigin: len(calculated3DCoordsCplx),
                    plane: clickedProjInfo.plane,
                    relativeCoords: {
                       x: dot(pointVecRelativeToCenterCplx, xAxis),
                       y: dot(pointVecRelativeToCenterCplx, yAxis),
                       z: dot(pointVecRelativeToCenterCplx, orientation)
                    },
                    distanceToPlaneCenter: len(pointVecRelativeToCenterCplx),
                };

                if (lattice === 'square' && inverted3DNode) {
                    const mapToSearch = clickedProjInfo.plane === 'primary' ? primaryProjectedPointsMap : antipodalProjectedPointsMap;
                    const invertedData = mapToSearch.get(inverted3DNode.serial);
                    if (invertedData) {
                        invertedProjectedPoint = invertedData.projInfo;
                    }

                    if (invertedProjectedPoint) {
                        const p2_rel = invertedProjectedPoint.relativeCoords;
                        const diff_x = Math.abs(inverted_x_geo - p2_rel.x);
                        const diff_y = Math.abs(inverted_y_geo - p2_rel.y);
                        if (diff_x < (0.01 * latticeFactor) && diff_y < (0.01 * latticeFactor)) {
                            inversionTestResult = "Passed";
                        } else {
                            inversionTestResult = "Failed";
                        }
                    }
                }
            }
            
            setInspectionData({
                selectedProjectedPoint: clickedProjInfo,
                associated3DNode: clickedAtom,
                inverted3DNode,
                invertedProjectedPoint,
                calculatedInvertedPoint,
                calculatedComplexInvertedPoint,
                inversionTestResult
            });
            setSelectedProjectivePoint(clickedProjInfo);
          } else {
              setSelectedProjectivePoint(clickedProjInfo);
          }
      };
      
      // Pass 2: Draw the projected points and attach handlers
      const selectedAtomSerials = new Set(selectedAtoms.map(a => a.serial));

      if (showProjectivePoints || showProjectivePointsSet2) {
          primaryProjectedPointsMap.forEach(({ atom, projInfo }) => {
              const isSelected = selectedAtomSerials.has(atom.serial);
              const dotProduct = dot(normalize(sub(atom, omegaVec)), orientationVec);
              let color = isSelected ? 'red' : 'purple';
              let shouldShow = false;

              if (dotProduct >= -1e-6 && showProjectivePoints) {
                shouldShow = true;
              } else if (dotProduct < -1e-6 && showProjectivePointsSet2) {
                color = isSelected ? 'red' : 'orchid';
                shouldShow = true;
              }

              if (shouldShow) {
                  glViewer.current.addSphere({ 
                      center: projInfo.coords, 
                      radius: isSelected ? projectivePointRadius * 1.5 : projectivePointRadius, 
                      color: color, 
                      clickable: isProjectivePointModeActive || selectionMode === 'inspection', 
                      callback: createProjectivePointClickHandler(atom, projInfo), 
                      hoverable: true, 
                      hover_callback: () => setHoveredProjectivePoint({ atomSerial: atom.serial, relativeCoords: {x: projInfo.relativeCoords.x, y: projInfo.relativeCoords.y}, plane: 'primary'}), 
                      unhover_callback: () => setHoveredProjectivePoint(null) 
                  });
              }
          });
      }
      
      if (showAntipodalProjectivePointsSet1 || showAntipodalProjectivePointsSet2) {
          antipodalProjectedPointsMap.forEach(({ atom, projInfo }) => {
              const isSelected = selectedAtomSerials.has(atom.serial);
              const dotProductAnti = dot(normalize(sub(atom, omegaVec)), antiOrientationVec);
              let color = isSelected ? 'red' : 'teal';
              let shouldShow = false;

              if (dotProductAnti > 1e-6 && showAntipodalProjectivePointsSet1) {
                  shouldShow = true;
              } else if (dotProductAnti < -1e-6 && showAntipodalProjectivePointsSet2) {
                  color = isSelected ? 'red' : 'lightseagreen';
                  shouldShow = true;
              }

              if (shouldShow) {
                  glViewer.current.addSphere({ 
                      center: projInfo.coords, 
                      radius: isSelected ? projectivePointRadius * 1.5 : projectivePointRadius, 
                      color: color, 
                      clickable: isProjectivePointModeActive || selectionMode === 'inspection', 
                      callback: createProjectivePointClickHandler(atom, projInfo), 
                      hoverable: true, 
                      hover_callback: () => setHoveredProjectivePoint({ atomSerial: atom.serial, relativeCoords: {x: projInfo.relativeCoords.x, y: projInfo.relativeCoords.y}, plane: 'antipodal'}), 
                      unhover_callback: () => setHoveredProjectivePoint(null) 
                  });
              }
          });
      }

      // Re-implement distance calculation using the maps
      if (selectionMode === 'distance' && selectedAtoms.length === 2) {
        const [atom1, atom2] = selectedAtoms;
        const p1_primary_data = primaryProjectedPointsMap.get(atom1.serial);
        const p2_primary_data = primaryProjectedPointsMap.get(atom2.serial);
        const p1_antipodal_data = antipodalProjectedPointsMap.get(atom1.serial);
        const p2_antipodal_data = antipodalProjectedPointsMap.get(atom2.serial);
        const distances: { primary?: number; antipodal?: number } = {};
        if (p1_primary_data && p2_primary_data) distances.primary = len(sub(p1_primary_data.projInfo.coords, p2_primary_data.projInfo.coords));
        if (p1_antipodal_data && p2_antipodal_data) distances.antipodal = len(sub(p1_antipodal_data.projInfo.coords, p2_antipodal_data.projInfo.coords));
        if (Object.keys(distances).length > 0) setProjectivePointsDistance(distances);
      }
    }

    // --- INTERACTION MODE LOGIC ---
    if (selectedAtoms.length > 0) {
      const selectionSpec = { serial: selectedAtoms.map(a => a.serial) };
      glViewer.current.addStyle(selectionSpec, { sphere: { color: 'red', radius: atomScale + 0.1 }, stick: { color: 'red', radius: stickRadius + 0.05 } });
    }
    
    selectedAtoms.forEach(atom => {
      glViewer.current.addLabel(`${atom.serial}`, { position: { x: atom.x, y: atom.y, z: atom.z }, backgroundColor: '0xf87171', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });
    });
    
    const findSphereIntersections = (sphereCenter: any, sphereRadius: number, lineOrigin: any, direction: any) => {
        const L = sub(lineOrigin, sphereCenter);
        const a = dot(direction, direction);
        const b = 2 * dot(direction, L);
        const c = dot(L, L) - sphereRadius * sphereRadius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return null;
        const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        
        const p1 = add(lineOrigin, scale(direction, t1));
        const points = [{ coords: p1, distance: len(p1) }];
        if (Math.abs(t1 - t2) > 1e-6) {
            const p2 = add(lineOrigin, scale(direction, t2));
            points.push({ coords: p2, distance: len(p2) });
        }
        return points;
    };

    const calculateAndDrawIntersectionsForLine = (lineOrigin: { x: number, y: number, z: number }, direction: { x: number, y: number, z: number }, isInspection: boolean): IntersectionPoints => {
      const results: IntersectionPoints = {};

      if (showCylinder) results.primaryPlane = findPlaneIntersection(cylinderCenter, orientationVec, lineOrigin, direction);
      if (showAntipodalPlane) results.antipodalPlane = findPlaneIntersection(antiCenter, antiOrientationVec, lineOrigin, direction);
      if (showOriginSphere) results.ellipticalSphere = findSphereIntersections(omegaVec, ellipticalRadius, lineOrigin, direction);
      if (showSphere2) results.primaryRiemannSphere = findSphereIntersections(cylinderCenter, R, lineOrigin, direction);
      if (showAntipodalSphere) results.antipodalRiemannSphere = findSphereIntersections(antiCenter, R, lineOrigin, direction);

      const showPrimary = isInspection ? showInspPrimaryPoints : true;
      const showAntipodal = isInspection ? showInspAntipodalPoints : true;
    
      if (results.primaryPlane && showPrimary) {
        glViewer.current.addSphere({
          center: results.primaryPlane.coords,
          radius: projectivePointRadius,
          color: 'purple',
        });
      }
      if (results.antipodalPlane && showAntipodal) {
        glViewer.current.addSphere({
          center: results.antipodalPlane.coords,
          radius: projectivePointRadius,
          color: 'teal',
        });
      }
      results.ellipticalSphere?.forEach(p => glViewer.current.addSphere({ center: p.coords, radius: projectivePointRadius, color: 'white'}));
      results.primaryRiemannSphere?.forEach(p => glViewer.current.addSphere({ center: p.coords, radius: projectivePointRadius, color: 'yellow'}));
      results.antipodalRiemannSphere?.forEach(p => glViewer.current.addSphere({ center: p.coords, radius: projectivePointRadius, color: 'darkorange'}));
    
      return results;
    }

    const calculateAndDrawIntersectionsForPoint = (atomPos: { x: number; y: number; z: number; }, drawLines: boolean): IntersectionPoints => {
      const direction = normalize(sub(atomPos, omegaVec));
      
      if (drawLines && showInspCpsLines) {
        const lineLength = cylinderRadius * 2;
        glViewer.current.addCylinder({ start: sub(omegaVec, scale(direction, lineLength)), end: add(omegaVec, scale(direction, lineLength)), radius: lineRadius * 0.8, color: 'white' });
      }
      
      const results = calculateAndDrawIntersectionsForLine(omegaVec, direction, true);
      
      const antipodalPoint = sub(scale(omegaVec, 2), atomPos);
      results.node = { coords: atomPos, distance: len(atomPos) };
      results.antipodalNode = { coords: antipodalPoint, distance: len(antipodalPoint) };

      return results;
    }

    const allIntersectionPoints: IntersectionPoints[] = [];

    if (selectionMode === 'node' && selectedAtoms.length === 1) {
      allIntersectionPoints.push(calculateAndDrawIntersectionsForPoint(selectedAtoms[0], true));

      const atom = selectedAtoms[0];
      const { x: x_atom, y: y_atom, z: z_atom } = atom;

      // Primary Plane Line
      if (showCylinder) {
        const R_plane = cylinderRadius;
        let p1_3d: any = null;
        let p2_3d: any = null;

        if (Math.abs(y_atom) > 1e-6) {
          const a = x_atom * x_atom + y_atom * y_atom;
          if (a > 1e-9) {
            const b = -2 * x_atom * z_atom;
            const c = z_atom * z_atom - R_plane * R_plane * y_atom * y_atom;
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
              const sqrt_discriminant = Math.sqrt(discriminant);
              const x1 = (-b + sqrt_discriminant) / (2 * a);
              const x2 = (-b - sqrt_discriminant) / (2 * a);
              const y1 = (z_atom - x_atom * x1) / y_atom;
              const y2 = (z_atom - x_atom * x2) / y_atom;
              p1_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, x1), scale(primaryPlaneYAxis, y1)));
              p2_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, x2), scale(primaryPlaneYAxis, y2)));
            }
          }
        } else if (Math.abs(x_atom) > 1e-6) {
          const x_val = z_atom / x_atom;
          const y_sq = R_plane * R_plane - x_val * x_val;
          if (y_sq >= 0) {
            const y_val = Math.sqrt(y_sq);
            p1_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, x_val), scale(primaryPlaneYAxis, y_val)));
            p2_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, x_val), scale(primaryPlaneYAxis, -y_val)));
          }
        }

        if (p1_3d && p2_3d) {
          glViewer.current.addCylinder({
            start: p1_3d,
            end: p2_3d,
            radius: lineRadius * 1.2,
            color: 'yellow'
          });
        }
      }

      // Antipodal Plane Line
      if (showAntipodalPlane) {
        let up = vec(0, 1, 0);
        if (Math.abs(dot(antiOrientationVec, up)) > 0.99) {
          up = vec(1, 0, 0);
        }
        const xAxis = normalize(cross(up, antiOrientationVec));
        const yAxis = normalize(cross(antiOrientationVec, xAxis));

        const R_plane = cylinderRadius;
        let p1_3d: any = null;
        let p2_3d: any = null;

        if (Math.abs(y_atom) > 1e-6) {
          const a = x_atom * x_atom + y_atom * y_atom;
          if (a > 1e-9) {
            const b = -2 * x_atom * z_atom;
            const c = z_atom * z_atom - R_plane * R_plane * y_atom * y_atom;
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
              const sqrt_discriminant = Math.sqrt(discriminant);
              const x1 = (-b + sqrt_discriminant) / (2 * a);
              const x2 = (-b - sqrt_discriminant) / (2 * a);
              const y1 = (z_atom - x_atom * x1) / y_atom;
              const y2 = (z_atom - x_atom * x2) / y_atom;
              p1_3d = add(antiCenter, add(scale(xAxis, x1), scale(yAxis, y1)));
              p2_3d = add(antiCenter, add(scale(xAxis, x2), scale(yAxis, y2)));
            }
          }
        } else if (Math.abs(x_atom) > 1e-6) {
          const x_val = z_atom / x_atom;
          const y_sq = R_plane * R_plane - x_val * x_val;
          if (y_sq >= 0) {
            const y_val = Math.sqrt(y_sq);
            p1_3d = add(antiCenter, add(scale(xAxis, x_val), scale(yAxis, y_val)));
            p2_3d = add(antiCenter, add(scale(xAxis, x_val), scale(yAxis, -y_val)));
          }
        }

        if (p1_3d && p2_3d) {
          glViewer.current.addCylinder({
            start: p1_3d,
            end: p2_3d,
            radius: lineRadius * 1.2,
            color: 'magenta'
          });
        }
      }

    } else if (selectionMode === 'distance' && selectedAtoms.length > 0) {
        selectedAtoms.forEach(atom => {
            allIntersectionPoints.push(calculateAndDrawIntersectionsForPoint(atom, true));
        });
        if (selectedAtoms.length === 2) {
            const [atom1, atom2] = selectedAtoms;
            const p1 = { x: atom1.x, y: atom1.y, z: atom1.z };
            const p2 = { x: atom2.x, y: atom2.y, z: atom2.z };
            
            setDistances([len(sub(p1, p2))]);
            glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius, color: 'red', dashed: true });

            const v1 = sub(p1, omegaVec);
            const v2 = sub(p2, omegaVec);
            const l1 = len(v1);
            const l2 = len(v2);
            if (l1 > 1e-6 && l2 > 1e-6) {
                const cosAngle = dot(v1, v2) / (l1 * l2);
                const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
                setNodeAngle(angleRad * (180 / Math.PI));
            }

            const intersectionData1 = allIntersectionPoints[0];
            const intersectionData2 = allIntersectionPoints[1];
            
            const newDistancesAndAngles: IntersectionDistances = {};

            const calculateAngle = (p1: any, p2: any, center: any = {x: 0, y: 0, z: 0}) => {
                const v1 = sub(p1, center);
                const v2 = sub(p2, center);
                const l1 = len(v1);
                const l2 = len(v2);
                if (l1 < 1e-6 || l2 < 1e-6) return null;
                const cosAngle = dot(v1, v2) / (l1 * l2);
                const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
                return angleRad * (180 / Math.PI);
            };
            
            if (intersectionData1?.primaryPlane && intersectionData2?.primaryPlane) {
                const p1_plane = intersectionData1.primaryPlane;
                const p2_plane = intersectionData2.primaryPlane;
                
                glViewer.current.addCylinder({ start: p1_plane.coords, end: p2_plane.coords, radius: lineRadius, color: 'purple', dashed: true });

                newDistancesAndAngles.primaryPlane = len(sub(p1_plane.coords, p2_plane.coords));

                const angle3D = calculateAngle(p1_plane.coords, p2_plane.coords, omegaVec);
                if (angle3D !== null) newDistancesAndAngles.primaryPlaneAngle3D = angle3D;

                const p1_rel_2d = { x: p1_plane.relativeCoords.x, y: p1_plane.relativeCoords.y, z: 0 };
                const p2_rel_2d = { x: p2_plane.relativeCoords.x, y: p2_plane.relativeCoords.y, z: 0 };
                const angle2D = calculateAngle(p1_rel_2d, p2_rel_2d);
                if (angle2D !== null) newDistancesAndAngles.primaryPlaneAngle2D = angle2D;
            }

            if (intersectionData1?.antipodalPlane && intersectionData2?.antipodalPlane) {
                const p1_plane = intersectionData1.antipodalPlane;
                const p2_plane = intersectionData2.antipodalPlane;

                glViewer.current.addCylinder({ start: p1_plane.coords, end: p2_plane.coords, radius: lineRadius, color: 'teal', dashed: true });
                
                const angle3D = calculateAngle(p1_plane.coords, p2_plane.coords, omegaVec);
                if (angle3D !== null) newDistancesAndAngles.antipodalPlaneAngle3D = angle3D;
                
                const p1_rel_2d = { x: p1_plane.relativeCoords.x, y: p1_plane.relativeCoords.y, z: 0 };
                const p2_rel_2d = { x: p2_plane.relativeCoords.x, y: p2_plane.relativeCoords.y, z: 0 };
                const angle2D = calculateAngle(p1_rel_2d, p2_rel_2d);
                if (angle2D !== null) newDistancesAndAngles.antipodalPlaneAngle2D = angle2D;
            }
            
            setIntersectionDistances(Object.keys(newDistancesAndAngles).length > 0 ? newDistancesAndAngles : null);
        }
    } else if (selectionMode === 'triangle' && selectedAtoms.length > 0) {
        selectedAtoms.forEach(atom => {
            allIntersectionPoints.push(calculateAndDrawIntersectionsForPoint(atom, true));
        });
        if (selectedAtoms.length === 3) {
            const [p1, p2, p3] = selectedAtoms.map(a => vec(a.x, a.y, a.z));
            setDistances([len(sub(p1, p2)), len(sub(p2, p3)), len(sub(p1, p3))]);
            glViewer.current.addCylinder({ start: p1, end: p2, radius: lineRadius, color: 'red', dashed: true });
            glViewer.current.addCylinder({ start: p2, end: p3, radius: lineRadius, color: 'red', dashed: true });
            glViewer.current.addCylinder({ start: p1, end: p3, radius: lineRadius, color: 'red', dashed: true });
            const center = scale(add(add(p1, p2), p3), 1/3);
            glViewer.current.addSphere({ center, radius: 0.25, color: 'blue' });
            const normal = cross(sub(p2, p1), sub(p3, p1));
            if (len(normal) > 1e-6) {
                const unitNormal = normalize(normal);
                const lineStart = sub(center, scale(unitNormal, normalLineLength));
                const lineEnd = add(center, scale(unitNormal, normalLineLength));
                glViewer.current.addCylinder({ start: lineStart, end: lineEnd, radius: lineRadius, color: 'magenta' });
            }

            // Draw projected triangles
            const primaryPoints = allIntersectionPoints.map(p => p.primaryPlane?.coords);
            if (primaryPoints.length === 3) {
                const [pp1, pp2, pp3] = primaryPoints;
                if (pp1 && pp2) glViewer.current.addCylinder({ start: pp1, end: pp2, radius: lineRadius, color: 'purple', dashed: true });
                if (pp2 && pp3) glViewer.current.addCylinder({ start: pp2, end: pp3, radius: lineRadius, color: 'purple', dashed: true });
                if (pp3 && pp1) glViewer.current.addCylinder({ start: pp3, end: pp1, radius: lineRadius, color: 'purple', dashed: true });
            }

            const antipodalPoints = allIntersectionPoints.map(p => p.antipodalPlane?.coords);
            if (antipodalPoints.length === 3) {
                const [ap1, ap2, ap3] = antipodalPoints;
                if (ap1 && ap2) glViewer.current.addCylinder({ start: ap1, end: ap2, radius: lineRadius, color: 'teal', dashed: true });
                if (ap2 && ap3) glViewer.current.addCylinder({ start: ap2, end: ap3, radius: lineRadius, color: 'teal', dashed: true });
                if (ap3 && ap1) glViewer.current.addCylinder({ start: ap3, end: ap1, radius: lineRadius, color: 'teal', dashed: true });
            }

            const newTriangleAnalysis: TriangleAnalysis = {};
            const calculateTriangleProperties = (points: ({x: number, y: number, z: number} | null | undefined)[]): TrianglePlaneAnalysis | null => {
              if (points.length !== 3 || points.some(p => !p)) return null;
              const [pt1, pt2, pt3] = points as {x: number, y: number, z: number}[];
              const d12 = len(sub(pt1, pt2));
              const d23 = len(sub(pt2, pt3));
              const d13 = len(sub(pt1, pt3));
              
              if (d12 < 1e-6 || d23 < 1e-6 || d13 < 1e-6 || (d12 + d13 <= d23) || (d12 + d23 <= d13) || (d13 + d23 <= d12) ) return null;
              
              const sideLengths: [number, number, number] = [d12, d23, d13];

              const cosAngle1 = (d12 * d12 + d13 * d13 - d23 * d23) / (2 * d12 * d13);
              const cosAngle2 = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
              const cosAngle3 = (d13 * d13 + d23 * d23 - d12 * d12) / (2 * d13 * d23);
              
              if ([cosAngle1, cosAngle2, cosAngle3].some(cos => cos < -1.00001 || cos > 1.00001 || isNaN(cos))) return null;
              
              const clamp = (val: number) => Math.max(-1, Math.min(1, val));
              const angle1 = Math.acos(clamp(cosAngle1)) * (180 / Math.PI); // Angle at p1
              const angle2 = Math.acos(clamp(cosAngle2)) * (180 / Math.PI); // Angle at p2
              const angle3 = Math.acos(clamp(cosAngle3)) * (180 / Math.PI); // Angle at p3
              
              return { sideLengths, angles: [angle1, angle2, angle3] };
            };
            const primaryAnalysis = calculateTriangleProperties(primaryPoints);
            if (primaryAnalysis) newTriangleAnalysis.primary = primaryAnalysis;
            const antipodalAnalysis = calculateTriangleProperties(antipodalPoints);
            if (antipodalAnalysis) newTriangleAnalysis.antipodal = antipodalAnalysis;
            setTriangleAnalysis(Object.keys(newTriangleAnalysis).length > 0 ? newTriangleAnalysis : null);

            // Plane equation and rendering
            if (trianglePlaneNormal) {
                const unitNormal_plane = trianglePlaneNormal;
                const d_plane = trianglePlaneD!;
    
                if (closestNodeOnNormalFromTriangle) {
                    glViewer.current.addStyle({ serial: closestNodeOnNormalFromTriangle.serial }, { 
                        sphere: { color: 'yellow', radius: atomScale + 0.1 }
                    });
                    glViewer.current.addLabel(`Closest Node #${closestNodeOnNormalFromTriangle.serial}`, { 
                        position: { x: closestNodeOnNormalFromTriangle.x, y: closestNodeOnNormalFromTriangle.y, z: closestNodeOnNormalFromTriangle.z }, 
                        backgroundColor: '0xeab308',
                        backgroundOpacity: 0.9, 
                        fontColor: '0x1f2937', 
                        inFront: true, 
                        fontSize: 12 
                    });
                }
                
                const formatTerm = (coeff: number, axis: string, isFirst: boolean): string => {
                    if (Math.abs(coeff) < 1e-6) return '';
                    let sign = coeff > 0 ? '+' : '-';
                    if (isFirst && sign === '+') sign = '';
                    else if (!isFirst) sign = ` ${sign} `;
                    const value = Math.abs(coeff).toFixed(3);
                    return `${sign}${value}${axis}`;
                };
                let equation = '';
                equation += formatTerm(unitNormal_plane.x, 'x', true);
                equation += formatTerm(unitNormal_plane.y, 'y', equation === '');
                equation += formatTerm(unitNormal_plane.z, 'z', equation === '');
                const formattedEquation = `${equation.trim()} = ${(d_plane / latticeFactor).toFixed(3)}`;
                setTrianglePlaneEquation(formattedEquation);

                const inclinationRad = Math.acos(unitNormal_plane.z);
                const inclinationDeg = inclinationRad * (180 / Math.PI);
        
                const azimuthRad = Math.atan2(unitNormal_plane.y, unitNormal_plane.x);
                let azimuthDeg = azimuthRad * (180 / Math.PI);
                if (azimuthDeg < 0) {
                    azimuthDeg += 360;
                }
        
                setTrianglePlaneInclination(inclinationDeg);
                setTrianglePlaneAzimuth(azimuthDeg);

                const distanceToOrigin = Math.abs(d_plane);
                setTrianglePlaneDistanceToOrigin(distanceToOrigin);
    
                if (showTrianglePlane) {
                    const [p1_plane, p2_plane, p3_plane] = selectedAtoms.map(a => vec(a.x, a.y, a.z));
                    const centroid = scale(add(add(p1_plane, p2_plane), p3_plane), 1/3);
                    const radius = Math.max(len(sub(p1_plane, centroid)), len(sub(p2_plane, centroid)), len(sub(p3_plane, centroid))) * 1.2;
                    const halfHeightVec = scale(unitNormal_plane, 0.01 / 2);
                    glViewer.current.addCylinder({
                        start: sub(centroid, halfHeightVec),
                        end: add(centroid, halfHeightVec),
                        radius: radius,
                        color: 'coral',
                        opacity: 0.5,
                        fromCap: 1,
                        toCap: 1
                    });
                }

                if (showParallelPlane) {
                    const parallelPlaneCenter = scale(unitNormal_plane, parallelPlaneDistance);
                    const halfHeightVec = scale(unitNormal_plane, 0.01 / 2);
                    glViewer.current.addCylinder({
                        start: sub(parallelPlaneCenter, halfHeightVec),
                        end: add(parallelPlaneCenter, halfHeightVec),
                        radius: cylinderRadius,
                        color: 'dodgerblue',
                        opacity: 0.5,
                        fromCap: 1,
                        toCap: 1
                    });
                }
                
                const normalLineDisplayLength = cylinderRadius * 1.5;
                glViewer.current.addCylinder({ 
                    start: vec(0,0,0), 
                    end: scale(trianglePlaneNormal, normalLineDisplayLength), 
                    radius: lineRadius * 1.2, 
                    color: 'white',
                    dashed: true
                });
                    glViewer.current.addCylinder({ 
                    start: vec(0,0,0), 
                    end: scale(trianglePlaneNormal, -normalLineDisplayLength), 
                    radius: lineRadius * 1.2, 
                    color: 'white',
                    dashed: true
                });

            } else {
                setTrianglePlaneEquation('Points are collinear, plane not defined.');
                setTrianglePlaneAzimuth(null);
                setTrianglePlaneInclination(null);
                setTrianglePlaneDistanceToOrigin(null);
            }

        } else {
            setTriangleAnalysis(null);
            setTrianglePlaneEquation(null);
            setTrianglePlaneAzimuth(null);
            setTrianglePlaneInclination(null);
            setTrianglePlaneDistanceToOrigin(null);
        }
    }

    setIntersectionPoints(allIntersectionPoints.length > 0 ? allIntersectionPoints : null);
    
    // --- INSPECTION MODE VISUALS ---
    if (selectionMode === 'inspection' && inspectionData) {
        const { 
            selectedProjectedPoint, 
            associated3DNode, 
            inverted3DNode, 
            invertedProjectedPoint,
            calculatedInvertedPoint,
            calculatedComplexInvertedPoint
        } = inspectionData;

        // Highlight selected projected node
        glViewer.current.addSphere({ center: selectedProjectedPoint.coords, radius: projectivePointRadius * 1.8, color: 'yellow' });
        
        // Highlight associated 3D node
        glViewer.current.addStyle({ serial: associated3DNode.serial }, { sphere: { color: 'yellow', radius: atomScale + 0.1 } });
        glViewer.current.addLabel(`Node #${associated3DNode.serial}`, { position: associated3DNode, backgroundColor: '0xeab308', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });

        // Display the line connecting them
        const lineDir = normalize(sub(associated3DNode, omegaVec));
        glViewer.current.addCylinder({ start: add(omegaVec, scale(lineDir, -cylinderRadius * 2)), end: add(omegaVec, scale(lineDir, cylinderRadius * 2)), radius: lineRadius, color: 'yellow' });

        if (activeInspectionTab === 'reflection' && inverted3DNode && invertedProjectedPoint) {
            // Highlight inverted 3D node
            glViewer.current.addStyle({ serial: inverted3DNode.serial }, { sphere: { color: 'yellow', radius: atomScale + 0.1 } });
            glViewer.current.addLabel(`Node #${inverted3DNode.serial}`, { position: inverted3DNode, backgroundColor: '0xeab308', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });

            // Display its CPS line
            const invLineDir = normalize(sub(inverted3DNode, omegaVec));
            glViewer.current.addCylinder({ start: add(omegaVec, scale(invLineDir, -cylinderRadius * 2)), end: add(omegaVec, scale(invLineDir, cylinderRadius * 2)), radius: lineRadius, color: 'yellow' });

            // Highlight new projected node
            glViewer.current.addSphere({ center: invertedProjectedPoint.coords, radius: projectivePointRadius * 1.8, color: 'yellow' });
        }
        
        if (activeInspectionTab === 'inversion' && showCalculatedInversionPoint) {
            const pointToDraw = inversionType === 'geometric' ? calculatedInvertedPoint : calculatedComplexInvertedPoint;
            if (pointToDraw) {
                glViewer.current.addSphere({
                    center: pointToDraw.coords,
                    radius: projectivePointRadius * 1.2,
                    color: 'orange'
                });
                glViewer.current.addLabel(
                    inversionType === 'geometric' ? 'Calc. Geo. Inversion' : 'Calc. Cpx. Inversion',
                    {
                        position: pointToDraw.coords,
                        backgroundColor: '0xf97316',
                        backgroundOpacity: 0.9,
                        fontColor: 'white',
                        inFront: true,
                        fontSize: 10
                    }
                );
            }
        }
    }
    
    // --- SYNTHETIC GEOMETRY LOGIC ---
    if (syntheticNode) {
        const pointPos = vec(syntheticNode.x, syntheticNode.y, syntheticNode.z);
        glViewer.current.addSphere({ center: pointPos, radius: atomScale, color: 'cyan' });
        glViewer.current.addLabel('Custom', { position: pointPos, backgroundColor: '0x22d3ee', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });
        const intersectionData = calculateAndDrawIntersectionsForPoint(syntheticNode, true);
        setSyntheticNodeIntersections(intersectionData);

        if (intersectionData?.primaryPlane?.relativeCoords) {
          const coords = intersectionData.primaryPlane.relativeCoords;
          const X = coords.x;
          const Y = coords.y;

          if (Math.abs(X) < 1e-6 && Math.abs(Y) < 1e-6) {
            setSyntheticNodeDualLineEquation(null);
            setSyntheticNodeDualPlaneEquation(null);
          } else {
            const X_norm = X / latticeFactor;
            const Y_norm = Y / latticeFactor;
            const eq = `${X_norm.toFixed(3)}x' + ${Y_norm.toFixed(3)}y' = 1`;
            setSyntheticNodeDualLineEquation(eq);

            let p1_2d, p2_2d;
            if (Math.abs(Y) > Math.abs(X)) {
              p1_2d = { x: -cylinderRadius * 1.5, y: (1 - X * -cylinderRadius * 1.5) / Y };
              p2_2d = { x: cylinderRadius * 1.5, y: (1 - X * cylinderRadius * 1.5) / Y };
            } else {
              p1_2d = { y: -cylinderRadius * 1.5, x: (1 - Y * -cylinderRadius * 1.5) / X };
              p2_2d = { y: cylinderRadius * 1.5, x: (1 - Y * cylinderRadius * 1.5) / X };
            }
            
            const p1_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, p1_2d.x), scale(primaryPlaneYAxis, p1_2d.y)));
            const p2_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, p2_2d.x), scale(primaryPlaneYAxis, p2_2d.y)));
            
            if (showSyntheticNodeDualLine) {
              glViewer.current.addCylinder({ start: p1_3d, end: p2_3d, radius: lineRadius * 1.2, color: 'yellow' });
            }

            const v1 = sub(p1_3d, omegaVec);
            const v2 = sub(p2_3d, omegaVec);
            const normal = normalize(cross(v1, v2));

            if (len(normal) > 1e-6) {
                const formatTerm = (coeff: number, axis: string, isFirst: boolean): string => {
                    if (Math.abs(coeff) < 1e-6) return '';
                    let sign = coeff > 0 ? '+' : '-';
                    if (isFirst && sign === '+') sign = '';
                    else if (!isFirst) sign = ` ${sign} `;
                    const value = Math.abs(coeff).toFixed(3);
                    return `${sign}${value}${axis}`;
                };
    
                let equation = '';
                const xTerm = formatTerm(normal.x, 'x', true);
                equation += xTerm;
                const yTerm = formatTerm(normal.y, 'y', equation === '');
                equation += yTerm;
                const zTerm = formatTerm(normal.z, 'z', equation === '');
                equation += zTerm;
    
                setSyntheticNodeDualPlaneEquation(`${equation.trim()} = 0`);

                if (showSyntheticNodeDualPlane) {
                    const planeCenter = omegaVec;
                    const halfHeightVec = scale(normal, 0.01 / 2);
                    glViewer.current.addCylinder({ 
                        start: sub(planeCenter, halfHeightVec), 
                        end: add(planeCenter, halfHeightVec), 
                        radius: cylinderRadius * 1.5, 
                        color: 'yellow',
                        opacity: 0.4, 
                        fromCap: 1, 
                        toCap: 1 
                    });

                    // Draw the plane's coordinate system
                    const planeAxisLength = cylinderRadius * 0.75;
                    const z_prime_axis = normal;

                    let up = vec(0, 1, 0);
                    if (Math.abs(dot(z_prime_axis, up)) > 0.99) {
                        up = vec(1, 0, 0);
                    }
                    const x_prime_axis = normalize(cross(up, z_prime_axis));
                    const y_prime_axis = normalize(cross(z_prime_axis, x_prime_axis));

                    const origin = omegaVec;
                    
                    glViewer.current.addCylinder({ start: origin, end: add(origin, scale(x_prime_axis, planeAxisLength)), radius: lineRadius, color: 'hotpink' });
                    glViewer.current.addCylinder({ start: origin, end: add(origin, scale(y_prime_axis, planeAxisLength)), radius: lineRadius, color: 'lightgreen' });
                    glViewer.current.addCylinder({ start: origin, end: add(origin, scale(z_prime_axis, planeAxisLength)), radius: lineRadius, color: 'skyblue' });

                    const coneLength = planeAxisLength * 0.08;
                    const coneRadius = lineRadius * 5;

                    glViewer.current.addCylinder({ start: add(origin, scale(x_prime_axis, planeAxisLength)), end: add(origin, scale(x_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'hotpink' });
                    glViewer.current.addCylinder({ start: add(origin, scale(y_prime_axis, planeAxisLength)), end: add(origin, scale(y_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'lightgreen' });
                    glViewer.current.addCylinder({ start: add(origin, scale(z_prime_axis, planeAxisLength)), end: add(origin, scale(z_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'skyblue' });
                    
                    glViewer.current.addLabel("X''", { position: add(origin, scale(x_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'hotpink', fontSize: 14, showBackground: false });
                    glViewer.current.addLabel("Y''", { position: add(origin, scale(y_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'lightgreen', fontSize: 14, showBackground: false });
                    glViewer.current.addLabel("Z''", { position: add(origin, scale(z_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'skyblue', fontSize: 14, showBackground: false });
                }
            } else {
                setSyntheticNodeDualPlaneEquation(null);
            }
          }
        } else {
          setSyntheticNodeDualLineEquation(null);
          setSyntheticNodeDualPlaneEquation(null);
        }
    } else {
        setSyntheticNodeIntersections(null);
        setSyntheticNodeDualLineEquation(null);
        setSyntheticNodeDualPlaneEquation(null);
    }

    if (syntheticLinePoints) {
      const { p1, p2 } = syntheticLinePoints;
      const direction = normalize(sub(p2, p1));

      // Draw the points that define the line
      glViewer.current.addSphere({ center: p1, radius: atomScale, color: 'lime' });
      glViewer.current.addLabel('P1', { position: p1, backgroundColor: '0x84cc16', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });
      glViewer.current.addSphere({ center: p2, radius: atomScale, color: 'lime' });
      glViewer.current.addLabel('P2', { position: p2, backgroundColor: '0x84cc16', backgroundOpacity: 0.9, fontColor: '0x1f2937', inFront: true, fontSize: 12 });
      
      // Draw the line itself, extended
      const lineLength = cylinderRadius * 4;
      const lineCenter = scale(add(p1, p2), 0.5);
      const start = sub(lineCenter, scale(direction, lineLength / 2));
      const end = add(lineCenter, scale(direction, lineLength / 2));
      glViewer.current.addCylinder({ start, end, radius: lineRadius * 0.8, color: 'lime' });

      // Calculate and draw intersections for the main line
      const intersectionData = calculateAndDrawIntersectionsForLine(p1, direction, false);
      setSyntheticLineIntersections(intersectionData);

      // Draw radial lines and calculate their intersections
      const intersectionDataP1 = calculateAndDrawIntersectionsForPoint(p1, true);
      setSyntheticLinePoint1Intersections(intersectionDataP1);

      const intersectionDataP2 = calculateAndDrawIntersectionsForPoint(p2, true);
      setSyntheticLinePoint2Intersections(intersectionDataP2);

      // Helper function for dual lines
      const drawDualLine = (intData: IntersectionPoints | null, equationSetter: (eq: string | null) => void) => {
          if (intData?.primaryPlane?.relativeCoords) {
              const coords = intData.primaryPlane.relativeCoords;
              const X = coords.x;
              const Y = coords.y;

              if (Math.abs(X) < 1e-6 && Math.abs(Y) < 1e-6) {
                  equationSetter(null);
              } else {
                  const X_norm = X / latticeFactor;
                  const Y_norm = Y / latticeFactor;
                  const eq = `${X_norm.toFixed(3)}x' + ${Y_norm.toFixed(3)}y' = 1`;
                  equationSetter(eq);

                  let p1_2d, p2_2d;
                  if (Math.abs(Y) > Math.abs(X)) {
                      p1_2d = { x: -cylinderRadius * 1.5, y: (1 - X * -cylinderRadius * 1.5) / Y };
                      p2_2d = { x: cylinderRadius * 1.5, y: (1 - X * cylinderRadius * 1.5) / Y };
                  } else {
                      p1_2d = { y: -cylinderRadius * 1.5, x: (1 - Y * -cylinderRadius * 1.5) / X };
                      p2_2d = { y: cylinderRadius * 1.5, x: (1 - Y * cylinderRadius * 1.5) / X };
                  }
                  
                  const p1_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, p1_2d.x), scale(primaryPlaneYAxis, p1_2d.y)));
                  const p2_3d = add(cylinderCenter, add(scale(primaryPlaneXAxis, p2_2d.x), scale(primaryPlaneYAxis, p2_2d.y)));
                  glViewer.current.addCylinder({ start: p1_3d, end: p2_3d, radius: lineRadius * 1.2, color: 'yellow' });
              }
          } else {
              equationSetter(null);
          }
      };

      // Draw dual lines for P1 and P2
      drawDualLine(intersectionDataP1, setSyntheticP1DualLineEquation);
      drawDualLine(intersectionDataP2, setSyntheticP2DualLineEquation);
      
      // Draw lines connecting plane intersection points
      if (intersectionDataP1.primaryPlane && intersectionDataP2.primaryPlane) {
          glViewer.current.addCylinder({ 
              start: intersectionDataP1.primaryPlane.coords, 
              end: intersectionDataP2.primaryPlane.coords, 
              radius: lineRadius, 
              color: 'purple', 
              dashed: true 
          });
      }
      if (intersectionDataP1.antipodalPlane && intersectionDataP2.antipodalPlane) {
          glViewer.current.addCylinder({ 
              start: intersectionDataP1.antipodalPlane.coords, 
              end: intersectionDataP2.antipodalPlane.coords, 
              radius: lineRadius, 
              color: 'teal', 
              dashed: true 
          });
      }
      
      if (showSyntheticPlane) {
        const normal = normalize(cross(p1, p2));
        if (len(normal) > 1e-6) {
          const planeCenter = omegaVec;
          const halfHeightVec = scale(normal, 0.01 / 2);
          glViewer.current.addCylinder({ 
            start: sub(planeCenter, halfHeightVec), 
            end: add(planeCenter, halfHeightVec), 
            radius: cylinderRadius * 1.5, 
            color: 'cyan', 
            opacity: 0.4, 
            fromCap: 1, 
            toCap: 1 
          });

          // Draw the plane's coordinate system
          const planeAxisLength = cylinderRadius * 0.75;
          const z_prime_axis = normal;

          let up = vec(0, 1, 0);
          if (Math.abs(dot(z_prime_axis, up)) > 0.99) {
              up = vec(1, 0, 0);
          }
          const x_prime_axis = normalize(cross(up, z_prime_axis));
          const y_prime_axis = normalize(cross(z_prime_axis, x_prime_axis));

          const origin = omegaVec;
          
          glViewer.current.addCylinder({ start: origin, end: add(origin, scale(x_prime_axis, planeAxisLength)), radius: lineRadius, color: 'hotpink' });
          glViewer.current.addCylinder({ start: origin, end: add(origin, scale(y_prime_axis, planeAxisLength)), radius: lineRadius, color: 'lightgreen' });
          glViewer.current.addCylinder({ start: origin, end: add(origin, scale(z_prime_axis, planeAxisLength)), radius: lineRadius, color: 'skyblue' });

          const coneLength = planeAxisLength * 0.08;
          const coneRadius = lineRadius * 5;

          glViewer.current.addCylinder({ start: add(origin, scale(x_prime_axis, planeAxisLength)), end: add(origin, scale(x_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'hotpink' });
          glViewer.current.addCylinder({ start: add(origin, scale(y_prime_axis, planeAxisLength)), end: add(origin, scale(y_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'lightgreen' });
          glViewer.current.addCylinder({ start: add(origin, scale(z_prime_axis, planeAxisLength)), end: add(origin, scale(z_prime_axis, planeAxisLength + coneLength)), radius: coneRadius, radius2: 0, color: 'skyblue' });
          
          glViewer.current.addLabel("X''", { position: add(origin, scale(x_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'hotpink', fontSize: 14, showBackground: false });
          glViewer.current.addLabel("Y''", { position: add(origin, scale(y_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'lightgreen', fontSize: 14, showBackground: false });
          glViewer.current.addLabel("Z''", { position: add(origin, scale(z_prime_axis, planeAxisLength + coneLength + 1)), fontColor: 'skyblue', fontSize: 14, showBackground: false });
        
          // Calculate and set coordinates of P1 and P2 in the plane's frame
          const p1_plane_coords = { x: dot(p1, x_prime_axis), y: dot(p1, y_prime_axis), z: dot(p1, z_prime_axis) };
          const p2_plane_coords = { x: dot(p2, x_prime_axis), y: dot(p2, y_prime_axis), z: dot(p2, z_prime_axis) };
          setSyntheticP1PlaneCoords(p1_plane_coords);
          setSyntheticP2PlaneCoords(p2_plane_coords);
        }
      } else {
        setSyntheticP1PlaneCoords(null);
        setSyntheticP2PlaneCoords(null);
      }

    } else {
        setSyntheticLineIntersections(null);
        setSyntheticLinePoint1Intersections(null);
        setSyntheticLinePoint2Intersections(null);
        setSyntheticP1DualLineEquation(null);
        setSyntheticP2DualLineEquation(null);
    }


    if (isProjectivePointModeActive && selectedProjectivePoint) {
      glViewer.current.addSphere({ center: selectedProjectivePoint.coords, radius: projectivePointRadius + 0.05, color: 'cyan' });
    }

    const handleClick = (atom: AtomSpec) => {
      if (!atom || typeof atom.x !== 'number') return;
      
      const maxAtoms = selectionMode === 'node' ? 1 : selectionMode === 'distance' ? 2 : selectionMode === 'triangle' ? 3 : 0;
      if (maxAtoms === 0) return;

      setSelectedAtoms(prev => {
        if (prev.length >= maxAtoms || maxAtoms === 1) return [atom];
        if (prev.find(a => a.serial === atom.serial)) return prev;
        return [...prev, atom];
      });
    };

    if (selectionMode === 'node' || selectionMode === 'distance' || selectionMode === 'triangle') {
      glViewer.current.setClickable(modelSpec, true, handleClick);
    } else {
      glViewer.current.setClickable(modelSpec, false, null);
    }

    glViewer.current.setHoverable(modelSpec, true, 
      (atom: AtomSpec) => { setHoveredAtom(atom); },
      () => { setHoveredAtom(null); }
    );

    const modelChanged = modelData !== prevModelData;
    const styleOrBondChanged = style !== prevStyle || bondScale !== prevBondScale || bondMode !== prevBondMode;
    if (modelChanged || styleOrBondChanged) {
        glViewer.current.zoomTo();
    }
    glViewer.current.render();
    setIsLoading(false);

    return () => {
      if (glViewer.current?.setClickable) {
        glViewer.current.setClickable(modelSpec, false, null);
      }
      if (glViewer.current?.setHoverable) {
        glViewer.current.setHoverable({}, false, null, null);
      }
    };
  }, [
    modelData, style, bondScale, bondMode, atomScale, stickRadius, lineRadius, selectionMode, selectedAtoms, 
    selectedProjectivePoint, inspectionData, normalLineLength, showOriginSphere, originSphereOpacity, ellipticalRadius,
    isolateNodesOnEllipticalSphere, hideNodesOutsideEllipticalSphere, showSphere2, 
    sphere2Opacity, showCylinder, cylinderRadius, cylinderHeight, cylinderAzimuth, cylinderInclination, 
    showAxes, showCpsLines, showProjectivePoints, showCpsLinesSet2, showProjectivePointsSet2,
    projectivePointRadius, showAntipodalSphere, showAntipodalPlane, showAntipodalProjectivePointsSet1, 
    showAntipodalProjectivePointsSet2, omega, setIsLoading, setDistances, setNodeAngle, setProjectivePointsDistance, 
    setIntersectionPoints, setIntersectionDistances, setMetadata, setSelectedProjectivePoint, setInspectionData, setSelectedAtoms, setHoveredProjectivePoint,
    setTriangleAnalysis, showInspCpsLines, showInspPrimaryPoints, showInspAntipodalPoints, isProjectivePointModeActive,
    syntheticNode, setSyntheticNodeIntersections, syntheticLinePoints, setSyntheticLineIntersections,
    setSyntheticLinePoint1Intersections, setSyntheticLinePoint2Intersections, showSyntheticPlane,
    showSyntheticNodeDualPlane, setSyntheticP1PlaneCoords, setSyntheticP2PlaneCoords, setSyntheticNodeDualLineEquation,
    setSyntheticP1DualLineEquation, setSyntheticP2DualLineEquation, showSyntheticNodeDualLine, setSyntheticNodeDualPlaneEquation,
    setTrianglePlaneEquation, setTrianglePlaneAzimuth, setTrianglePlaneInclination, showTrianglePlane, setTrianglePlaneDistanceToOrigin, setHoveredAtom,
    hideNodesNotOnTrianglePlane, showParallelPlane, parallelPlaneDistance, isolateNodesOnParallelPlane, setClosestNodeOnNormal,
    setIsolatedNodeCount, setVisibleNodeCount, showXYPlane, showXZPlane, showYZPlane, lattice, activeInspectionTab, showCalculatedInversionPoint,
    inversionType, latticeFactor
  ]);

  return <div ref={viewerRef} className="w-full h-full" aria-label="3D Molecule Viewer" />;
});

// Vector math helpers
const vec = (x: number | {x:number, y:number, z:number}, y?: number, z?: number) => {
    if (typeof x === 'object') return { x: x.x, y: x.y, z: x.z };
    return { x: x as number, y: y!, z: z! };
};
const add = (v1: any, v2: any) => vec(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
const sub = (v1: any, v2: any) => vec(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
const scale = (v: any, s: number) => vec(v.x * s, v.y * s, v.z * s);
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

const VIEW_MATRICES: { [key: string]: number[] } = {
  front:  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  back:   [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1],
  top:    [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  bottom: [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1],
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

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


export default PdbViewer;