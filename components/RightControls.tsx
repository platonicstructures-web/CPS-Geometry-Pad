
import React from 'react';
import { SelectionMode, AtomSpec } from '../types';

interface RightControlsProps {
  showOriginSphere: boolean;
  onShowOriginSphereChange: (visible: boolean) => void;
  originSphereOpacity: number;
  onOriginSphereOpacityChange: (opacity: number) => void;
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
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onClearSelection: () => void;
  selectedAtoms: AtomSpec[];
  selectedProjectivePoint: {x: number, y: number, z: number} | null;
  distances: number[] | null;
  normalLineLength: number;
  onNormalLineLengthChange: (length: number) => void;
  showCpsLines: boolean;
  onShowCpsLinesChange: (visible: boolean) => void;
  showProjectivePoints: boolean;
  onShowProjectivePointsChange: (visible: boolean) => void;
  lineRadius: number;
  onLineRadiusChange: (radius: number) => void;
}

const RightControls: React.FC<RightControlsProps> = ({
  showOriginSphere,
  onShowOriginSphereChange,
  originSphereOpacity,
  onOriginSphereOpacityChange,
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
  selectionMode,
  onSelectionModeChange,
  onClearSelection,
  selectedAtoms,
  selectedProjectivePoint,
  distances,
  normalLineLength,
  onNormalLineLengthChange,
  showCpsLines,
  onShowCpsLinesChange,
  showProjectivePoints,
  onShowProjectivePointsChange,
  lineRadius,
  onLineRadiusChange,
}) => {
  const selectionModes: { mode: SelectionMode; label: string }[] = [
      { mode: 'none', label: 'Off' },
      { mode: 'distance', label: 'Distance' },
      { mode: 'triangle', label: 'Triangle' },
      { mode: 'projective', label: 'Projective Point' },
  ];
  
  const getSelectionInfoText = () => {
    if (selectionMode === 'none') {
      return 'Enable an interaction mode to begin.';
    }
    if (selectionMode === 'distance') {
      return `Click on ${selectedAtoms.length < 2 ? 'two' : ''} atoms in the viewer.`;
    }
    if (selectionMode === 'triangle') {
      return `Click on ${selectedAtoms.length < 3 ? 'three' : ''} atoms in the viewer.`;
    }
    if (selectionMode === 'projective') {
        return 'Click a purple projective point on the plane.';
    }
    return '';
  };
  
  const calculateAngles = (d12: number, d23: number, d13: number): [number, number, number] | null => {
    // Law of Cosines to find angles
    // Angle at atom 1 (opposite side d23)
    const cosAngle1 = (d12 * d12 + d13 * d13 - d23 * d23) / (2 * d12 * d13);
    // Angle at atom 2 (opposite side d13)
    const cosAngle2 = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
    // Angle at atom 3 (opposite side d12)
    const cosAngle3 = (d23 * d23 + d13 * d13 - d12 * d12) / (2 * d23 * d13);
  
    // Check for valid cosine values (-1 to 1). Floating point errors can push it just outside.
    if ([cosAngle1, cosAngle2, cosAngle3].some(cos => cos < -1.00001 || cos > 1.00001)) {
        return null; // Invalid triangle, e.g., collinear points
    }
  
    const clamp = (val: number) => Math.max(-1, Math.min(1, val));

    const angle1 = Math.acos(clamp(cosAngle1)) * (180 / Math.PI);
    const angle2 = Math.acos(clamp(cosAngle2)) * (180 / Math.PI);
    const angle3 = Math.acos(clamp(cosAngle3)) * (180 / Math.PI);
  
    return [angle1, angle2, angle3];
  };

  const angles = (distances && distances.length === 3) ? calculateAngles(distances[0], distances[1], distances[2]) : null;


  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Scene Settings</h3>
         <div className="space-y-4">
          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOriginSphere}
                onChange={(e) => onShowOriginSphereChange(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Show Sphere - Elliptical Geometry</span>
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
          </div>
          
          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSphere2}
                onChange={(e) => onShowSphere2Change(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-600 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Show Sphere - Hyperbolic Geometry</span>
            </label>
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
                disabled={!showSphere2}
              />
            </div>
          </div>
        </div>
      </div>
      
       <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Line Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="line-radius-slider" className="block text-sm font-medium text-gray-300">
              Distance/Axis Line Radius: <span className="font-bold text-cyan-400">{lineRadius.toFixed(2)}</span>
            </label>
            <input
              id="line-radius-slider"
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={lineRadius}
              onChange={(e) => onLineRadiusChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>
      
       <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Stereographic Projection</h3>
         <div className="space-y-4">
          <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCylinder}
                onChange={(e) => onShowCylinderChange(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Show Projected Plane</span>
            </label>
            <div className="mt-3 space-y-3">
               <div>
                  <label htmlFor="cylinder-radius-slider" className="block text-sm font-medium text-gray-300">
                    Radius: <span className="font-bold text-cyan-400">{cylinderRadius.toFixed(2)}</span>
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
                    disabled={!showCylinder}
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
                    disabled={!showCylinder}
                  />
                </div>
            </div>
            <div className="mt-3 space-y-2 border-t border-gray-600 pt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCpsLines}
                    onChange={(e) => onShowCpsLinesChange(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!showCylinder}
                  />
                  <span className="text-gray-300">Show CPS Lines</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProjectivePoints}
                    onChange={(e) => onShowProjectivePointsChange(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!showCylinder}
                  />
                  <span className="text-gray-300">Show Projective Points</span>
                </label>
            </div>
          </div>
        </div>
      </div>

       <div className="border-t border-gray-700 my-4"></div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-cyan-400">Measurements and Inspection</h3>
        <div className="space-y-4">
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
          
          <div className="bg-gray-700 p-3 rounded-md min-h-[120px] border border-gray-600">
            <h4 className="font-semibold text-gray-300 mb-2">Selection Info</h4>
            {selectionMode === 'projective' && selectedProjectivePoint ? (
               <div>
                <p className="font-bold text-cyan-400">Selected Point Coordinates:</p>
                <p className="text-sm font-mono text-cyan-300">
                  X: {(selectedProjectivePoint.x / 1.8).toFixed(3)}, Y: {(selectedProjectivePoint.y / 1.8).toFixed(3)}, Z: {(selectedProjectivePoint.z / 1.8).toFixed(2)}
                </p>
              </div>
            ) : selectedAtoms.length > 0 ? (
              <ul className="text-sm text-gray-400">
                {selectedAtoms.map((atom, index) => (
                  <li key={atom.serial}>Atom {index + 1}: {atom.atom} {atom.resi} (Chain {atom.chain})</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {getSelectionInfoText()}
              </p>
            )}
            {distances && distances.length > 0 && (
              <div className="mt-2">
                {selectionMode === 'distance' && (
                  <p className="font-bold text-red-400">
                    Distance: {(distances[0] / 1.8).toFixed(2)}
                  </p>
                )}
                {selectionMode === 'triangle' && distances.length === 3 && angles && (
                  <div className="space-y-3">
                     <div className="font-bold text-red-400">
                      <p>Distances / Angles:</p>
                      <ul className="text-sm list-inside pl-2 text-red-300 font-normal font-mono">
                        <li>1-2: {(distances[0] / 1.8).toFixed(2)} / <span className="text-yellow-300">{angles[2].toFixed(1)}°</span></li>
                        <li>2-3: {(distances[1] / 1.8).toFixed(2)} / <span className="text-yellow-300">{angles[0].toFixed(1)}°</span></li>
                        <li>1-3: {(distances[2] / 1.8).toFixed(2)} / <span className="text-yellow-300">{angles[1].toFixed(1)}°</span></li>
                      </ul>
                    </div>
                     {selectedAtoms.length === 3 && (
                      <div className="pt-2">
                        <label htmlFor="normal-length-slider" className="block text-sm font-medium text-gray-300">
                          Normal Line Length: <span className="font-bold text-cyan-400">{(normalLineLength / 1.8).toFixed(1)}</span>
                        </label>
                        <input
                          id="normal-length-slider"
                          type="range"
                          min="1"
                          max="10"
                          step="0.1"
                          value={normalLineLength}
                          onChange={(e) => onNormalLineLengthChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClearSelection}
            disabled={selectedAtoms.length === 0 && !selectedProjectivePoint}
            className="w-full px-3 py-1.5 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500
              disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
              bg-red-600 text-white hover:bg-red-700"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightControls;
