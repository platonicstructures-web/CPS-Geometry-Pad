import React from 'react';
import { IntersectionPoints, PlaneIntersectionPoint } from '../types';

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
export const IntersectionPointDisplay: React.FC<{
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

export const PlaneIntersectionDisplay: React.FC<{
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

export const IntersectionDetailsDisplay: React.FC<{ points: IntersectionPoints; title?: string; showNodeInfo?: boolean; latticeFactor: number; }> = ({ points, title, showNodeInfo = true, latticeFactor }) => (
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
