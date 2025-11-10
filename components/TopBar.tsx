

import React from 'react';

interface TopBarProps {
  viewerBackground: string;
  onViewerBackgroundChange: (bg: string) => void;
  showAxes: boolean;
  onShowAxesChange: (visible: boolean) => void;
  showXYPlane: boolean;
  onShowXYPlaneChange: (visible: boolean) => void;
  showXZPlane: boolean;
  onShowXZPlaneChange: (visible: boolean) => void;
  showYZPlane: boolean;
  onShowYZPlaneChange: (visible: boolean) => void;
  onViewChange: (view: string) => void;
  isLeftPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  isRightPanelVisible: boolean;
  onToggleRightPanel: () => void;
  isTranscriptionPanelVisible: boolean;
  onToggleTranscriptionPanel: () => void;
  activeLeftPanel: 'panel1' | 'panel2';
  onActiveLeftPanelChange: (panel: 'panel1' | 'panel2') => void;
  activeRightPanel: 'panel1' | 'panel2';
  onActiveRightPanelChange: (panel: 'panel1' | 'panel2') => void;
}

const backgroundOptions: { key: string; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'black', label: 'Black' },
  { key: 'light-blue', label: 'Light Blue' },
  { key: 'white', label: 'White' },
];

const viewOptions: { key: string; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
];

const TopBar: React.FC<TopBarProps> = ({
  viewerBackground,
  onViewerBackgroundChange,
  showAxes,
  onShowAxesChange,
  showXYPlane,
  onShowXYPlaneChange,
  showXZPlane,
  onShowXZPlaneChange,
  showYZPlane,
  onShowYZPlaneChange,
  onViewChange,
  isLeftPanelVisible,
  onToggleLeftPanel,
  isRightPanelVisible,
  onToggleRightPanel,
  isTranscriptionPanelVisible,
  onToggleTranscriptionPanel,
  activeLeftPanel,
  onActiveLeftPanelChange,
  activeRightPanel,
  onActiveRightPanelChange,
}) => {

  return (
    <div className="bg-gray-800 p-2 border-b border-gray-700 shadow-md">
      <div className="px-4 flex items-center justify-start gap-x-4 gap-y-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium">Left:</span>
            <input
                type="checkbox"
                checked={isLeftPanelVisible}
                onChange={onToggleLeftPanel}
                title={isLeftPanelVisible ? 'Hide Left Panel' : 'Show Left Panel'}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="left-panel-toggle" checked={activeLeftPanel === 'panel1'} onChange={() => onActiveLeftPanelChange('panel1')} className="h-4 w-4 rounded-full bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                  <span className="text-gray-300 text-sm">1</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="left-panel-toggle" checked={activeLeftPanel === 'panel2'} onChange={() => onActiveLeftPanelChange('panel2')} className="h-4 w-4 rounded-full bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                  <span className="text-gray-300 text-sm">2</span>
              </label>
            </div>
          </div>
          <div className="border-l border-gray-600 h-5 self-center"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium">Right:</span>
            <input
                type="checkbox"
                checked={isRightPanelVisible}
                onChange={onToggleRightPanel}
                title={isRightPanelVisible ? 'Hide Right Panel' : 'Show Right Panel'}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="right-panel-toggle" checked={activeRightPanel === 'panel1'} onChange={() => onActiveRightPanelChange('panel1')} className="h-4 w-4 rounded-full bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                  <span className="text-gray-300 text-sm">1</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                  <input type="radio" name="right-panel-toggle" checked={activeRightPanel === 'panel2'} onChange={() => onActiveRightPanelChange('panel2')} className="h-4 w-4 rounded-full bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
                  <span className="text-gray-300 text-sm">2</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-l border-gray-600 h-6"></div>

        <div className="flex items-center gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={showAxes} onChange={(e) => onShowAxesChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800" />
              <span className="text-gray-300 text-xs font-medium">Axes</span>
            </label>
            <span className="text-gray-300 text-xs font-medium">Planes:</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={showXYPlane} onChange={(e) => onShowXYPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800" />
              <span className="text-gray-300 text-xs font-medium">XY(Blue)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={showXZPlane} onChange={(e) => onShowXZPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-600 focus:ring-offset-gray-800" />
              <span className="text-gray-300 text-xs font-medium">XZ(Green)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={showYZPlane} onChange={(e) => onShowYZPlaneChange(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-600 focus:ring-offset-gray-800" />
              <span className="text-gray-300 text-xs font-medium">YZ(Red)</span>
            </label>
        </div>

        <div className="border-l border-gray-600 h-6"></div>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-cyan-400 whitespace-nowrap">Background:</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {backgroundOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onViewerBackgroundChange(key)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                  ${
                    viewerBackground === key
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-l border-gray-600 h-6"></div>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-cyan-400 whitespace-nowrap">View:</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {viewOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onViewChange(key)}
                className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-l border-gray-600 h-6"></div>
         <button
            onClick={onToggleTranscriptionPanel}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
              ${
                isTranscriptionPanelVisible
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            title={isTranscriptionPanelVisible ? 'Hide Live Transcription' : 'Show Live Transcription'}
        >
            {isTranscriptionPanelVisible ? 'Hide T' : 'Show T'}
        </button>
      </div>
    </div>
  );
};

export default TopBar;