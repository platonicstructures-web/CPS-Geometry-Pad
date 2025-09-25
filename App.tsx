
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import RightControls from './components/RightControls';
import PdbViewer, { PdbViewerHandles } from './components/PdbViewer';
import { PDB_FILES } from './constants';
import { DisplayStyle, AtomSpec, ColorScheme, SelectionMode, MoleculeMetadata } from './types';
import Footer from './components/Footer';
import TopBar from './components/TopBar';

const App: React.FC = () => {
  const [selectedPdbId, setSelectedPdbId] = useState<string | null>(PDB_FILES[0].id);
  const [localPdbData, setLocalPdbData] = useState<string | null>(null);
  const [localPdbName, setLocalPdbName] = useState<string | null>(null);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('ball and stick');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('spectrum');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [selectedAtoms, setSelectedAtoms] = useState<AtomSpec[]>([]);
  const [distances, setDistances] = useState<number[] | null>(null);
  const [selectedProjectivePoint, setSelectedProjectivePoint] = useState<{x: number, y: number, z: number} | null>(null);
  const [metadata, setMetadata] = useState<MoleculeMetadata | null>(null);

  const [atomScale, setAtomScale] = useState<number>(0.5);
  const [stickRadius, setStickRadius] = useState<number>(0.08);
  const [lineRadius, setLineRadius] = useState<number>(0.08);
  const [bondScale, setBondScale] = useState<number>(1.0);
  const [normalLineLength, setNormalLineLength] = useState<number>(5);
  const [showOriginSphere, setShowOriginSphere] = useState<boolean>(true);
  const [originSphereOpacity, setOriginSphereOpacity] = useState<number>(0.5);
  const [showSphere2, setShowSphere2] = useState<boolean>(true);
  const [sphere2Opacity, setSphere2Opacity] = useState<number>(0.5);
  const [showCylinder, setShowCylinder] = useState<boolean>(false);
  const [cylinderRadius, setCylinderRadius] = useState<number>(10);
  const [cylinderHeight, setCylinderHeight] = useState<number>(0.05);
  const [viewerBackground, setViewerBackground] = useState<string>('dark');
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showCpsLines, setShowCpsLines] = useState<boolean>(true);
  const [showProjectivePoints, setShowProjectivePoints] = useState<boolean>(true);

  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState<boolean>(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState<boolean>(true);

  const viewerRef = useRef<PdbViewerHandles>(null);


  const resetInteractionState = useCallback(() => {
    setSelectionMode('none');
    setSelectedAtoms([]);
    setDistances(null);
    setNormalLineLength(5);
    setSelectedProjectivePoint(null);
  }, []);

  const handlePdbChange = useCallback((id: string) => {
    setSelectedPdbId(id);
    setLocalPdbData(null);
    setLocalPdbName(null);
    setMetadata(null);
    resetInteractionState();
  }, [resetInteractionState]);

  const handleLocalFileLoad = useCallback((data: string, name: string) => {
    setLocalPdbData(data);
    setLocalPdbName(name);
    setSelectedPdbId(null);
    setMetadata(null);
    resetInteractionState();
  }, [resetInteractionState]);

  const handleStyleChange = useCallback((style: DisplayStyle) => {
    setDisplayStyle(style);
  }, []);

  const handleColorSchemeChange = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
  }, []);
  
  const handleSelectionModeChange = useCallback((mode: SelectionMode) => {
    setSelectionMode(mode);
    setSelectedAtoms([]);
    setDistances(null);
    setSelectedProjectivePoint(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedAtoms([]);
    setDistances(null);
    setNormalLineLength(5);
    setSelectedProjectivePoint(null);
  }, []);

  const handleAtomScaleChange = useCallback((scale: number) => setAtomScale(scale), []);
  const handleStickRadiusChange = useCallback((radius: number) => setStickRadius(radius), []);
  const handleLineRadiusChange = useCallback((radius: number) => setLineRadius(radius), []);
  const handleBondScaleChange = useCallback((scale: number) => setBondScale(scale), []);
  const handleNormalLineLengthChange = useCallback((length: number) => setNormalLineLength(length), []);
  const handleShowOriginSphereChange = useCallback((visible: boolean) => setShowOriginSphere(visible), []);
  const handleOriginSphereOpacityChange = useCallback((opacity: number) => setOriginSphereOpacity(opacity), []);
  const handleShowSphere2Change = useCallback((visible: boolean) => setShowSphere2(visible), []);
  const handleSphere2OpacityChange = useCallback((opacity: number) => setSphere2Opacity(opacity), []);
  const handleShowCylinderChange = useCallback((visible: boolean) => setShowCylinder(visible), []);
  const handleCylinderRadiusChange = useCallback((radius: number) => setCylinderRadius(radius), []);
  const handleCylinderHeightChange = useCallback((height: number) => setCylinderHeight(height), []);
  const handleViewerBackgroundChange = useCallback((bg: string) => setViewerBackground(bg), []);
  const handleShowAxesChange = useCallback((visible: boolean) => setShowAxes(visible), []);
  const handleShowCpsLinesChange = useCallback((visible: boolean) => setShowCpsLines(visible), []);
  const handleShowProjectivePointsChange = useCallback((visible: boolean) => setShowProjectivePoints(visible), []);
  const handleViewChange = useCallback((view: string) => {
    viewerRef.current?.setView(view);
  }, []);
  const handleToggleLeftPanel = useCallback(() => setIsLeftPanelVisible(prev => !prev), []);
  const handleToggleRightPanel = useCallback(() => setIsRightPanelVisible(prev => !prev), []);

  const backgroundClasses: { [key: string]: string } = {
    dark: 'bg-gray-800',
    black: 'bg-black',
    'light-blue': 'bg-sky-100',
    white: 'bg-white',
  };
  const currentBgClass = backgroundClasses[viewerBackground] || 'bg-gray-800';

  const loadingTextClasses: { [key: string]: string } = {
    dark: 'text-gray-200',
    black: 'text-gray-200',
    'light-blue': 'text-gray-800',
    white: 'text-gray-800',
  };
  const currentLoadingTextClass = loadingTextClasses[viewerBackground] || 'text-gray-200';
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <TopBar 
        viewerBackground={viewerBackground}
        onViewerBackgroundChange={handleViewerBackgroundChange}
        showAxes={showAxes}
        onShowAxesChange={handleShowAxesChange}
        onViewChange={handleViewChange}
        isLeftPanelVisible={isLeftPanelVisible}
        onToggleLeftPanel={handleToggleLeftPanel}
        isRightPanelVisible={isRightPanelVisible}
        onToggleRightPanel={handleToggleRightPanel}
      />
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        {isLeftPanelVisible && (
          <aside className="w-full md:w-[22rem] lg:w-[24rem] flex-shrink-0 order-1">
            <Controls
              selectedPdbId={selectedPdbId}
              onPdbIdChange={handlePdbChange}
              onLocalFileLoad={handleLocalFileLoad}
              localPdbName={localPdbName}
              selectedStyle={displayStyle}
              onStyleChange={handleStyleChange}
              selectedColorScheme={colorScheme}
              onColorSchemeChange={handleColorSchemeChange}
              atomScale={atomScale}
              onAtomScaleChange={handleAtomScaleChange}
              stickRadius={stickRadius}
              onStickRadiusChange={handleStickRadiusChange}
              bondScale={bondScale}
              onBondScaleChange={handleBondScaleChange}
              metadata={metadata}
            />
          </aside>
        )}
        <div className={`flex-grow flex items-center justify-center ${currentBgClass} rounded-lg shadow-2xl min-h-[60vh] md:min-h-0 relative border border-gray-700 order-2`}>
          <PdbViewer
            ref={viewerRef}
            pdbId={selectedPdbId}
            pdbData={localPdbData}
            style={displayStyle}
            colorScheme={colorScheme}
            setIsLoading={setIsLoading}
            setError={setError}
            selectionMode={selectionMode}
            selectedAtoms={selectedAtoms}
            setSelectedAtoms={setSelectedAtoms}
            selectedProjectivePoint={selectedProjectivePoint}
            setSelectedProjectivePoint={setSelectedProjectivePoint}
            setDistances={setDistances}
            atomScale={atomScale}
            stickRadius={stickRadius}
            lineRadius={lineRadius}
            bondScale={bondScale}
            setMetadata={setMetadata}
            normalLineLength={normalLineLength}
            showOriginSphere={showOriginSphere}
            originSphereOpacity={originSphereOpacity}
            showSphere2={showSphere2}
            sphere2Opacity={sphere2Opacity}
            showCylinder={showCylinder}
            cylinderRadius={cylinderRadius}
            cylinderHeight={cylinderHeight}
            viewerBackground={viewerBackground}
            showAxes={showAxes}
            showCpsLines={showCpsLines}
            showProjectivePoints={showProjectivePoints}
          />
          {isLoading && (
            <div className={`absolute inset-0 ${currentBgClass} bg-opacity-75 flex flex-col items-center justify-center rounded-lg z-10`}>
              <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className={`mt-4 text-lg ${currentLoadingTextClass}`}>Loading 3D Model...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-80 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10">
              <h3 className="text-xl font-bold text-red-300 mb-2">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>
        {isRightPanelVisible && (
          <aside className="w-full md:w-[22rem] lg:w-[24rem] flex-shrink-0 order-3">
            <RightControls
              showOriginSphere={showOriginSphere}
              onShowOriginSphereChange={handleShowOriginSphereChange}
              originSphereOpacity={originSphereOpacity}
              onOriginSphereOpacityChange={handleOriginSphereOpacityChange}
              showSphere2={showSphere2}
              onShowSphere2Change={handleShowSphere2Change}
              sphere2Opacity={sphere2Opacity}
              onSphere2OpacityChange={handleSphere2OpacityChange}
              showCylinder={showCylinder}
              onShowCylinderChange={handleShowCylinderChange}
              cylinderRadius={cylinderRadius}
              onCylinderRadiusChange={handleCylinderRadiusChange}
              cylinderHeight={cylinderHeight}
              onCylinderHeightChange={handleCylinderHeightChange}
              selectionMode={selectionMode}
              onSelectionModeChange={handleSelectionModeChange}
              onClearSelection={handleClearSelection}
              selectedAtoms={selectedAtoms}
              selectedProjectivePoint={selectedProjectivePoint}
              distances={distances}
              normalLineLength={normalLineLength}
              onNormalLineLengthChange={handleNormalLineLengthChange}
              showCpsLines={showCpsLines}
              onShowCpsLinesChange={handleShowCpsLinesChange}
              showProjectivePoints={showProjectivePoints}
              onShowProjectivePointsChange={handleShowProjectivePointsChange}
              lineRadius={lineRadius}
              onLineRadiusChange={handleLineRadiusChange}
            />
          </aside>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
