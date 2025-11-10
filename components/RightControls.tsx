import React, { useState, useEffect } from 'react';
import { SelectionMode, IntersectionPoints, Lattice } from '../types';
import { IntersectionDetailsDisplay } from './IntersectionDisplay';

interface RightControlsProps {
  activeRightPanel: 'panel1' | 'panel2';
  selectionMode: SelectionMode;
  showOriginSphere: boolean;
  onShowOriginSphereChange: (visible: boolean) => void;
  originSphereOpacity: number;
  onOriginSphereOpacityChange: (opacity: number) => void;
  ellipticalRadiusInput: number;
  onEllipticalRadiusInputChange: (value: number) => void;
  isolateNodesOnEllipticalSphere: boolean;
  onIsolateNodesOnEllipticalSphereChange: (isolate: boolean) => void;
  hideNodesOutsideEllipticalSphere: boolean;
  onHideNodesOutsideEllipticalSphereChange: (hide: boolean) => void;
  isolatedNodeCount: number | null;
  visibleNodeCount: number | null;
  showSphere2: boolean;
  onShowSphere2Change: (visible: boolean) => void;
  sphere2Opacity: number;
  onSphere2OpacityChange: (opacity: number) => void;
  showCylinder: boolean;
  onShowCylinderChange: (visible: boolean) => void;
  cylinderRadius: number;
  onCylinderRadiusChange: (radius: number) => void;
  cylinderHeight: number;
  onCylinderHeightChange: (height: number) => void;
  cylinderAzimuth: number;
  onCylinderAzimuthChange: (angle: number) => void;
  cylinderInclination: number;
  onCylinderInclinationChange: (angle: number) => void;
  showCpsLines: boolean;
  onShowCpsLinesChange: (visible: boolean) => void;
  showProjectivePoints: boolean;
  onShowProjectivePointsChange: (visible: boolean) => void;
  showCpsLinesSet2: boolean;
  onShowCpsLinesSet2Change: (visible: boolean) => void;
  showProjectivePointsSet2: boolean;
  onShowProjectivePointsSet2Change: (visible: boolean) => void;
  showAntipodalSphere: boolean;
  onShowAntipodalSphereChange: (visible: boolean) => void;
  showAntipodalPlane: boolean;
  onShowAntipodalPlaneChange: (visible: boolean) => void;
  showAntipodalProjectivePointsSet1: boolean;
  onShowAntipodalProjectivePointsSet1Change: (visible: boolean) => void;
  showAntipodalProjectivePointsSet2: boolean;
  onShowAntipodalProjectivePointsSet2Change: (visible: boolean) => void;
  omega: { x: number; y: number; z: number; };
  onOmegaChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  showInspCpsLines: boolean;
  onShowInspCpsLinesChange: (visible: boolean) => void;
  showInspPrimaryPoints: boolean;
  onShowInspPrimaryPointsChange: (visible: boolean) => void;
  showInspAntipodalPoints: boolean;
  onShowInspAntipodalPointsChange: (visible: boolean) => void;
  syntheticNodeInput: { x: string; y: string; z: string };
  onSyntheticNodeInputChange: (axis: 'x' | 'y' | 'z', value: string) => void;
  syntheticNodeInput2: { x: string; y: string; z: string };
  onSyntheticNodeInput2Change: (axis: 'x' | 'y' | 'z', value: string) => void;
  onCreateSyntheticNode: () => void;
  onCreateSyntheticLine: () => void;
  onClearSyntheticGeometry: () => void;
  syntheticNodeIntersections: IntersectionPoints | null;
  syntheticLinePoints: { p1: { x: number, y: number, z: number }, p2: { x: number, y: number, z: number } } | null;
  syntheticLineIntersections: IntersectionPoints | null;
  syntheticPlaneEquation: string | null;
  syntheticLinePoint1Intersections: IntersectionPoints | null;
  syntheticLinePoint2Intersections: IntersectionPoints | null;
  primaryPlaneLineEquation: string | null;
  antipodalPlaneLineEquation: string | null;
  showSyntheticPlane: boolean;
  onShowSyntheticPlaneChange: (visible: boolean) => void;
  showSyntheticNodeDualPlane: boolean;
  onShowSyntheticNodeDualPlaneChange: (visible: boolean) => void;
  syntheticNodeDualLineEquation: string | null;
  syntheticP1DualLineEquation: string | null;
  syntheticP2DualLineEquation: string | null;
  syntheticP1PlaneCoords: { x: number; y: number; z: number; } | null;
  syntheticP2PlaneCoords: { x: number; y: number; z: number; } | null;
  showSyntheticNodeDualLine: boolean;
  onShowSyntheticNodeDualLineChange: (visible: boolean) => void;
  syntheticNodeDualPlaneEquation: string | null;
  onSaveCoordinates: () => void;
  currentPdbName: string;
  lattice: Lattice;
  latticeFactor: number;
}


const RightControls: React.FC<RightControlsProps> = ({
  activeRightPanel,
  selectionMode,
  showOriginSphere,
  onShowOriginSphereChange,
  originSphereOpacity,
  onOriginSphereOpacityChange,
  ellipticalRadiusInput,
  onEllipticalRadiusInputChange,
  isolateNodesOnEllipticalSphere,
  onIsolateNodesOnEllipticalSphereChange,
  hideNodesOutsideEllipticalSphere,
  onHideNodesOutsideEllipticalSphereChange,
  isolatedNodeCount,
  visibleNodeCount,
  showSphere2,
  onShowSphere2Change,
  sphere2Opacity,
  onSphere2OpacityChange,
  showCylinder,
  onShowCylinderChange,
  cylinderRadius,
  onCylinderRadiusChange,
  cylinderHeight,
  onCylinderHeightChange,
  cylinderAzimuth,
  onCylinderAzimuthChange,
  cylinderInclination,
  onCylinderInclinationChange,
  showCpsLines,
  onShowCpsLinesChange,
  showProjectivePoints,
  onShowProjectivePointsChange,
  showCpsLinesSet2,
  onShowCpsLinesSet2Change,
  showProjectivePointsSet2,
  onShowProjectivePointsSet2Change,
  showAntipodalSphere,
  onShowAntipodalSphereChange,
  showAntipodalPlane,
  onShowAntipodalPlaneChange,
  showAntipodalProjectivePointsSet1,
  onShowAntipodalProjectivePointsSet1Change,
  showAntipodalProjectivePointsSet2,
  onShowAntipodalProjectivePointsSet2Change,
  omega,
  onOmegaChange,
  showInspCpsLines,
  onShowInspCpsLinesChange,
  showInspPrimaryPoints,
  onShowInspPrimaryPointsChange,
  showInspAntipodalPoints,
  onShowInspAntipodalPointsChange,
  syntheticNodeInput,
  onSyntheticNodeInputChange,
  syntheticNodeInput2,
  onSyntheticNodeInput2Change,
  onCreateSyntheticNode,
  onCreateSyntheticLine,
  onClearSyntheticGeometry,
  syntheticNodeIntersections,
  syntheticLinePoints,
  syntheticLineIntersections,
  syntheticPlaneEquation,
  syntheticLinePoint1Intersections,
  syntheticLinePoint2Intersections,
  primaryPlaneLineEquation,
  antipodalPlaneLineEquation,
  showSyntheticPlane,
  onShowSyntheticPlaneChange,
  showSyntheticNodeDualPlane,
  onShowSyntheticNodeDualPlaneChange,
  syntheticNodeDualLineEquation,
  syntheticP1DualLineEquation,
  syntheticP2DualLineEquation,
  syntheticP1PlaneCoords,
  syntheticP2PlaneCoords,
  showSyntheticNodeDualLine,
  onShowSyntheticNodeDualLineChange,
  syntheticNodeDualPlaneEquation,
  onSaveCoordinates,
  currentPdbName,
  lattice,
  latticeFactor,
}) => {

  const [p1Eq, setP1Eq] = useState<string>('');
  const [dirEq, setDirEq] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'line' | 'p1' | 'p2'>('line');

  useEffect(() => {
    if (syntheticLinePoints) {
      const { p1, p2 } = syntheticLinePoints;
      const dir = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };

      const p1_norm = { x: p1.x / latticeFactor, y: p1.y / latticeFactor, z: p1.z / latticeFactor };
      const dir_norm = { x: dir.x / latticeFactor, y: dir.y / latticeFactor, z: dir.z / latticeFactor };

      setP1Eq(`(${p1_norm.x.toFixed(3)}, ${p1_norm.y.toFixed(3)}, ${p1_norm.z.toFixed(3)})`);
      setDirEq(`(${dir_norm.x.toFixed(3)}, ${dir_norm.y.toFixed(3)}, ${dir_norm.z.toFixed(3)})`);
    }
  }, [syntheticLinePoints, latticeFactor]);

  useEffect(() => {
    if (!syntheticLineIntersections) {
        setActiveTab('line');
    }
  }, [syntheticLineIntersections]);

  if (activeRightPanel === 'panel2') {
    const tabButtonClass = (isActive: boolean) => 
      `px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 rounded-t-md flex-1 text-center disabled:opacity-50 disabled:cursor-not-allowed
      ${isActive ? 'bg-gray-700/80 text-cyan-400' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-700/50'}`;
    
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Custom Geometry Inspector</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Define one point for a node, or two for a line. Vectors are normalized and placed on a sphere of radius {latticeFactor.toFixed(2)}.</p>
        </div>
        <div className="space-y-2 p-3 bg-gray-900/50 rounded-md mt-2">
            <p className="text-sm font-semibold text-gray-300">Point 1 (P1)</p>
            <div className="grid grid-cols-3 gap-3">
                {(['x', 'y', 'z'] as const).map(axis => (
                    <div key={axis} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label htmlFor={`synth-node-${axis}`} className="text-sm text-gray-300 uppercase font-bold">{axis}</label>
                            <input
                                type="number"
                                id={`synth-node-${axis}`}
                                value={syntheticNodeInput[axis]}
                                onChange={e => onSyntheticNodeInputChange(axis, e.target.value)}
                                className="w-16 bg-gray-700 border border-gray-600 text-white rounded-md p-1 text-xs text-center focus:ring-2 focus:ring-cyan-500 transition"
                                step="0.1"
                            />
                        </div>
                        <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={parseFloat(syntheticNodeInput[axis]) || 0}
                            onChange={e => onSyntheticNodeInputChange(axis, e.target.value)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            aria-label={`${axis} slider for point 1`}
                        />
                    </div>
                ))}
            </div>
        </div>
         <div className="space-y-2 p-3 bg-gray-900/50 rounded-md mt-2">
            <p className="text-sm font-semibold text-gray-300">Point 2 (P2)</p>
            <div className="grid grid-cols-3 gap-3">
                {(['x', 'y', 'z'] as const).map(axis => (
                     <div key={axis} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label htmlFor={`synth-node2-${axis}`} className="text-sm text-gray-300 uppercase font-bold">{axis}</label>
                            <input
                                type="number"
                                id={`synth-node2-${axis}`}
                                value={syntheticNodeInput2[axis]}
                                onChange={e => onSyntheticNodeInput2Change(axis, e.target.value)}
                                className="w-16 bg-gray-700 border border-gray-600 text-white rounded-md p-1 text-xs text-center focus:ring-2 focus:ring-cyan-500 transition"
                                step="0.1"
                            />
                        </div>
                        <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={parseFloat(syntheticNodeInput2[axis]) || 0}
                            onChange={e => onSyntheticNodeInput2Change(axis, e.target.value)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            aria-label={`${axis} slider for point 2`}
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
            <button onClick={onCreateSyntheticNode} className="bg-cyan-600 text-white hover:bg-cyan-500 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">Create Node</button>
            <button onClick={onCreateSyntheticLine} className="bg-cyan-600 text-white hover:bg-cyan-500 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">Create Line</button>
            <button onClick={onClearSyntheticGeometry} disabled={!syntheticNodeIntersections && !syntheticLineIntersections} className="bg-red-600 text-white hover:bg-red-700 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">Clear</button>
        </div>
        
        {syntheticNodeIntersections && (
            <div className="mt-4 p-3 bg-gray-700/80 rounded-md border border-gray-600 text-sm font-mono text-gray-300 overflow-y-auto flex-grow">
                <IntersectionDetailsDisplay
                    points={syntheticNodeIntersections}
                    title="Custom Node:"
                    showNodeInfo={true}
                    latticeFactor={latticeFactor}
                />
                {syntheticNodeDualLineEquation && (
                  <>
                    <div className="flex items-center justify-between mt-3">
                      <h4 className="font-bold text-yellow-300 text-base">Projective Line (2D):</h4>
                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={showSyntheticNodeDualLine}
                            onChange={(e) => onShowSyntheticNodeDualLineChange(e.target.checked)}
                            className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                          />
                          <span className="text-gray-300">Show</span>
                      </label>
                    </div>
                    <div className="font-mono text-xs pl-2 text-yellow-200">
                        <div>{syntheticNodeDualLineEquation}</div>
                    </div>
                  </>
                )}
                {syntheticNodeDualPlaneEquation && (
                  <>
                    <div className="flex items-center justify-between mt-3">
                      <h4 className="font-bold text-yellow-300 text-base">Associated Plane (3D):</h4>
                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={showSyntheticNodeDualPlane}
                            onChange={(e) => onShowSyntheticNodeDualPlaneChange(e.target.checked)}
                            className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                          />
                          <span className="text-gray-300">Show</span>
                      </label>
                    </div>
                    <div className="font-mono text-xs pl-2 text-yellow-200">
                        <div>{syntheticNodeDualPlaneEquation}</div>
                    </div>
                  </>
                )}
            </div>
        )}
        {syntheticLineIntersections && (
            <div className="mt-4 flex flex-col flex-grow min-h-0">
                <div className="flex border-b border-gray-600">
                    <button onClick={() => setActiveTab('line')} className={tabButtonClass(activeTab === 'line')}>Line Info</button>
                    <button onClick={() => setActiveTab('p1')} className={tabButtonClass(activeTab === 'p1')} disabled={!syntheticLinePoint1Intersections}>P1</button>
                    <button onClick={() => setActiveTab('p2')} className={tabButtonClass(activeTab === 'p2')} disabled={!syntheticLinePoint2Intersections}>P2</button>
                </div>
                <div className="p-3 bg-gray-700/80 rounded-b-md border-x border-b border-gray-600 text-sm font-mono text-gray-300 overflow-y-auto flex-grow">
                    {activeTab === 'line' && (
                        <div>
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-cyan-400 mb-1 text-base">Line Equation (Normalized):</h4>
                                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={showSyntheticPlane}
                                      onChange={(e) => onShowSyntheticPlaneChange(e.target.checked)}
                                      className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-gray-300">Show 3D Plane</span>
                                </label>
                            </div>
                            <div className="font-mono text-xs pl-2 text-lime-300">
                                <div>P(t) = P1 + t * D</div>
                                <div className="mt-1">P1: <span className="text-gray-300">{p1Eq}</span></div>
                                <div>D:  <span className="text-gray-300">{dirEq}</span></div>
                            </div>
                            {syntheticPlaneEquation && (
                              <>
                                <h4 className="font-bold text-cyan-400 mt-3 mb-1 text-base">3D Plane Equation:</h4>
                                <div className="font-mono text-xs pl-2 text-amber-300">
                                    <div>{syntheticPlaneEquation}</div>
                                </div>
                              </>
                            )}
                            {syntheticP1PlaneCoords && syntheticP2PlaneCoords && (
                              <>
                                <h4 className="font-bold text-cyan-400 mt-3 mb-1 text-base">Points in Plane Coords (X'', Y''):</h4>
                                <div className="font-mono text-xs pl-2 text-gray-300">
                                    <div>P1: ({ (syntheticP1PlaneCoords.x / latticeFactor).toFixed(3) }, { (syntheticP1PlaneCoords.y / latticeFactor).toFixed(3) })</div>
                                    <div>P2: ({ (syntheticP2PlaneCoords.x / latticeFactor).toFixed(3) }, { (syntheticP2PlaneCoords.y / latticeFactor).toFixed(3) })</div>
                                </div>
                              </>
                            )}
                            {primaryPlaneLineEquation && (
                              <>
                                <h4 className="font-bold text-purple-300 mt-3 mb-1 text-base">Primary Plane Line Eq (X',Y'):</h4>
                                <div className="font-mono text-xs pl-2 text-purple-200">
                                    <div>{primaryPlaneLineEquation}</div>
                                </div>
                              </>
                            )}
                            {antipodalPlaneLineEquation && (
                              <>
                                <h4 className="font-bold text-teal-300 mt-3 mb-1 text-base">Antipodal Plane Line Eq (X',Y'):</h4>
                                <div className="font-mono text-xs pl-2 text-teal-200">
                                    <div>{antipodalPlaneLineEquation}</div>
                                </div>
                              </>
                            )}
                            {(syntheticP1DualLineEquation || syntheticP2DualLineEquation) && (
                              <>
                                <h4 className="font-bold text-yellow-300 mt-3 mb-1 text-base">Dual Lines to P1/P2:</h4>
                                <div className="font-mono text-xs pl-2 text-yellow-200">
                                  {syntheticP1DualLineEquation && <div>P1: {syntheticP1DualLineEquation}</div>}
                                  {syntheticP2DualLineEquation && <div>P2: {syntheticP2DualLineEquation}</div>}
                                </div>
                              </>
                            )}

                             <h4 className="font-bold text-cyan-400 mt-3 mb-1 text-base">Main Line Intersections:</h4>
                            <IntersectionDetailsDisplay
                                points={syntheticLineIntersections}
                                showNodeInfo={false}
                                latticeFactor={latticeFactor}
                            />
                        </div>
                    )}
                    {activeTab === 'p1' && syntheticLinePoint1Intersections && (
                        <IntersectionDetailsDisplay
                            points={syntheticLinePoint1Intersections}
                            title="Point P1:"
                            showNodeInfo={true}
                            latticeFactor={latticeFactor}
                        />
                    )}
                    {activeTab === 'p2' && syntheticLinePoint2Intersections && (
                        <IntersectionDetailsDisplay
                            points={syntheticLinePoint2Intersections}
                            title="Point P2:"
                            showNodeInfo={true}
                            latticeFactor={latticeFactor}
                        />
                    )}
                </div>
            </div>
        )}
      </div>
    );
  }

  const guidesVisible = showSphere2 || showCylinder || showAntipodalSphere || showAntipodalPlane;
  const ellipticalRadiusFactor = latticeFactor.toFixed(2);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
       <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Stereographic Projection:</h3>
         <div className="space-y-4">
           <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
              <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-cyan-400 whitespace-nowrap">3D</h3>
                  {(['x', 'y', 'z'] as const).map(axis => (
                  <div key={axis} className="flex items-center gap-1">
                      <label htmlFor={`omega-${axis}-right`} className="text-xs text-gray-300 uppercase font-bold">{axis}:</label>
                      <input
                      type="number"
                      id={`omega-${axis}-right`}
                      value={omega[axis]}
                      onChange={(e) => onOmegaChange(axis, parseFloat(e.target.value))}
                      className="w-16 bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 transition"
                      step="0.1"
                      max="20"
                      min="-20"
                      />
                  </div>
                  ))}
              </div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <div>
              <label htmlFor="elliptical-radius-input" className="block text-sm font-medium text-gray-300">
                Elliptical Sphere Radius Param (n): <span className="font-bold text-cyan-400">{ellipticalRadiusInput}</span>
              </label>
              <div className="text-xs text-gray-500 mb-1">Radius = {ellipticalRadiusFactor} * sqrt(n)</div>
              <div className="flex items-center gap-2">
                <input
                  id="elliptical-radius-slider"
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={ellipticalRadiusInput}
                  onChange={(e) => onEllipticalRadiusInputChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <input
                  id="elliptical-radius-input"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={ellipticalRadiusInput}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onEllipticalRadiusInputChange(Math.max(1, Math.min(40, val)));
                    }
                  }}
                  className="w-20 bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={showOriginSphere}
                onChange={(e) => onShowOriginSphereChange(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Show Sphere - Elliptical Geometry:</span>
            </label>
            <div className="mt-2">
              <label htmlFor="opacity-slider-s1" className="block text-sm font-medium text-gray-300">
                Opacity: <span className="font-bold text-cyan-400">{originSphereOpacity.toFixed(2)}</span>
              </label>
              <input
                id="opacity-slider-s1"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={originSphereOpacity}
                onChange={(e) => onOriginSphereOpacityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!showOriginSphere}
              />
            </div>
            <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                        type="checkbox"
                        checked={isolateNodesOnEllipticalSphere}
                        onChange={(e) => onIsolateNodesOnEllipticalSphereChange(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                    />
                    <span className="text-gray-300">
                        Isolate nodes ON sphere surface
                        {isolateNodesOnEllipticalSphere && isolatedNodeCount !== null && (
                            <span className="ml-2 text-cyan-400 font-semibold">({isolatedNodeCount} nodes)</span>
                        )}
                    </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                        type="checkbox"
                        checked={hideNodesOutsideEllipticalSphere}
                        onChange={(e) => onHideNodesOutsideEllipticalSphereChange(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                    />
                    <span className="text-gray-300">
                        Hide nodes OUTSIDE sphere surface
                        {hideNodesOutsideEllipticalSphere && visibleNodeCount !== null && (
                            <span className="ml-2 text-cyan-400 font-semibold">({visibleNodeCount} visible)</span>
                        )}
                    </span>
                </label>
            </div>
          </div>
          
          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <div>
              <span className="text-gray-300">Show Riemann Sphere:</span>
              <div className="flex gap-x-4 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showSphere2} onChange={(e) => onShowSphere2Change(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-600 focus:ring-offset-gray-800" />
                      <span className="text-gray-400 text-sm">Primary</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={showAntipodalSphere} onChange={(e) => onShowAntipodalSphereChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-600 focus:ring-offset-gray-800" />
                      <span className="text-gray-400 text-sm">Antipodal</span>
                  </label>
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="opacity-slider-s2" className="block text-sm font-medium text-gray-300">
                Opacity: <span className="font-bold text-yellow-400">{sphere2Opacity.toFixed(2)}</span>
              </label>
              <input
                id="opacity-slider-s2"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sphere2Opacity}
                onChange={(e) => onSphere2OpacityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!showSphere2 && !showAntipodalSphere}
              />
            </div>
          </div>

          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <div className="flex items-center justify-between">
                <span className="text-gray-300">Show Planes:</span>
                <div className="flex gap-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showCylinder} onChange={(e) => onShowCylinderChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                        <span className="text-gray-400 text-sm">Primary</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showAntipodalPlane} onChange={(e) => onShowAntipodalPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                        <span className="text-gray-400 text-sm">Antipodal</span>
                    </label>
                </div>
            </div>
            <div className="mt-3 space-y-3">
               <div>
                  <label htmlFor="cylinder-radius-slider" className="block text-sm font-medium text-gray-300">
                    Planes Radius: <span className="font-bold text-cyan-400">{cylinderRadius.toFixed(2)}</span>
                  </label>
                  <input
                    id="cylinder-radius-slider"
                    type="range"
                    min="5"
                    max="40"
                    step="0.5"
                    value={cylinderRadius}
                    onChange={(e) => onCylinderRadiusChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!showCylinder && !showAntipodalPlane}
                  />
                </div>
                <div>
                  <label htmlFor="cylinder-height-slider" className="block text-sm font-medium text-gray-300">
                    Height: <span className="font-bold text-cyan-400">{cylinderHeight.toFixed(3)}</span>
                  </label>
                  <input
                    id="cylinder-height-slider"
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={cylinderHeight}
                    onChange={(e) => onCylinderHeightChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!showCylinder && !showAntipodalPlane}
                  />
                </div>
                <div className="!mt-4 border-t border-gray-600 pt-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Plane/Sphere Orientation:</h4>
                     <div>
                      <label htmlFor="cylinder-azimuth-slider" className="block text-sm font-medium text-gray-300 mb-1">
                        Azimuth: <span className="font-bold text-cyan-400">{cylinderAzimuth.toFixed(0)}°</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="cylinder-azimuth-slider"
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={cylinderAzimuth}
                          onChange={(e) => onCylinderAzimuthChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                        />
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={cylinderAzimuth.toFixed(0)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                                onCylinderAzimuthChange(Math.max(0, Math.min(360, value)));
                            }
                          }}
                          className="w-20 bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                          aria-label="Azimuth value"
                        />
                      </div>
                    </div>
                     <div className='mt-3'>
                      <label htmlFor="cylinder-inclination-slider" className="block text-sm font-medium text-gray-300 mb-1">
                        Inclination: <span className="font-bold text-cyan-400">{cylinderInclination.toFixed(0)}°</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="cylinder-inclination-slider"
                          type="range"
                          min="0"
                          max="180"
                          step="1"
                          value={cylinderInclination}
                          onChange={(e) => onCylinderInclinationChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                        />
                        <input
                          type="number"
                          min="0"
                          max="180"
                          value={cylinderInclination.toFixed(0)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                                onCylinderInclinationChange(Math.max(0, Math.min(180, value)));
                            }
                          }}
                          className="w-20 bg-gray-900 border border-gray-600 text-white rounded-md p-1 text-sm text-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                          aria-label="Inclination value"
                        />
                      </div>
                    </div>
                </div>
            </div>
            <div className="mt-3 space-y-3 border-t border-gray-600 pt-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                      <span className="text-gray-300 text-sm font-medium">CPS Lines Sets:</span>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCpsLines}
                          onChange={(e) => onShowCpsLinesChange(e.target.checked)}
                          className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                        />
                        <span className="text-gray-400 text-sm">1</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCpsLinesSet2}
                          onChange={(e) => onShowCpsLinesSet2Change(e.target.checked)}
                          className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!guidesVisible}
                        />
                        <span className="text-gray-400 text-sm">2</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showInspCpsLines}
                          onChange={(e) => onShowInspCpsLinesChange(e.target.checked)}
                          className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
                        />
                        <span className="text-gray-400 text-sm">Insp</span>
                      </label>
                    </div>
                    <button
                        onClick={onSaveCoordinates}
                        disabled={currentPdbName === 'No file loaded'}
                        className="bg-blue-600 text-white hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Save Coord
                    </button>
                </div>

                <fieldset>
                    <legend className="text-gray-300 text-sm font-medium sr-only">Projective Points Visibility</legend>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-gray-300 text-sm font-medium block mb-1">Primary Points Sets:</span>
                            <div className="flex gap-x-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showProjectivePoints} onChange={(e) => onShowProjectivePointsChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!showCylinder} />
                                  <span className="text-gray-400 text-sm">1</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showProjectivePointsSet2} onChange={(e) => onShowProjectivePointsSet2Change(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!showCylinder} />
                                  <span className="text-gray-400 text-sm">2</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showInspPrimaryPoints} onChange={(e) => onShowInspPrimaryPointsChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                                  <span className="text-gray-400 text-sm">Insp</span>
                                </label>
                            </div>
                        </div>
                         <div>
                            <span className="text-gray-300 text-sm font-medium block mb-1">Antipodal Points Sets:</span>
                            <div className="flex gap-x-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showAntipodalProjectivePointsSet1} onChange={(e) => onShowAntipodalProjectivePointsSet1Change(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!showAntipodalPlane} />
                                  <span className="text-gray-400 text-sm">1</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showAntipodalProjectivePointsSet2} onChange={(e) => onShowAntipodalProjectivePointsSet2Change(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!showAntipodalPlane} />
                                  <span className="text-gray-400 text-sm">2</span>
                                </label>
                                 <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="checkbox" checked={showInspAntipodalPoints} onChange={(e) => onShowInspAntipodalPointsChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                                  <span className="text-gray-400 text-sm">Insp</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

 export default RightControls;
