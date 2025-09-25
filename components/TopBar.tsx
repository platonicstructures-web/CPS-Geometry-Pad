
import React from 'react';

interface TopBarProps {
  viewerBackground: string;
  onViewerBackgroundChange: (bg: string) => void;
  showAxes: boolean;
  onShowAxesChange: (visible: boolean) => void;
  onViewChange: (view: string) => void;
  isLeftPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  isRightPanelVisible: boolean;
  onToggleRightPanel: () => void;
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
  onViewChange,
  isLeftPanelVisible,
  onToggleLeftPanel,
  isRightPanelVisible,
  onToggleRightPanel,
}) => {
  return (
    <div className="bg-gray-800 p-2 border-b border-gray-700 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-start gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-cyan-400 whitespace-nowrap">Panels:</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <button
                onClick={onToggleLeftPanel}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                  ${
                    isLeftPanelVisible
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                title={isLeftPanelVisible ? 'Hide Left Panel' : 'Show Left Panel'}
            >
                {isLeftPanelVisible ? 'Hide Left' : 'Show Left'}
            </button>
            <button
                onClick={onToggleRightPanel}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                  ${
                    isRightPanelVisible
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                title={isRightPanelVisible ? 'Hide Right Panel' : 'Show Right Panel'}
            >
                {isRightPanelVisible ? 'Hide Right' : 'Show Right'}
            </button>
          </div>
        </div>
        <div className="border-l border-gray-600 h-6"></div>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-cyan-400 whitespace-nowrap">Viewer Background:</h3>
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
        <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => onShowAxesChange(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300 text-xs">Show Axes</span>
            </label>
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
      </div>
    </div>
  );
};

export default TopBar;
