
const styles = `
  .guide-content h1, .guide-content h2, .guide-content h3 {
    color: #22d3ee;
    border-bottom: 1px solid #374151;
    padding-bottom: 0.5rem;
    margin-top: 2rem;
  }
  .guide-content h1 { font-size: 2.25rem; }
  .guide-content h2 { font-size: 1.75rem; }
  .guide-content h3 { font-size: 1.25rem; color: #67e8f9; border-bottom: none; }
  .guide-content p { margin-bottom: 1rem; }
  .guide-content code { background-color: #374151; color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Courier New', Courier, monospace; }
  .guide-content ul { padding-left: 1.5rem; margin-bottom: 1rem; }
  .guide-content li { margin-bottom: 0.5rem; }
  .guide-content strong { color: #a5f3fc; }
  .guide-content .panel-name { font-weight: bold; color: #facc15; }
`;

const contentHTML = `
  <h1>User Guide</h1>
  <p>Welcome to the Platonic Structures Geometry Pad! This guide will walk you through the features of this powerful tool for exploring molecular geometry and stereographic projections.</p>

  <h2>1. Getting Started: Loading a Structure</h2>
  <p>Before you can analyze a structure, you need to load one. You can do this from the <span class="panel-name">Left Panel (Tab 1)</span> in three ways:</p>
  <ul>
    <li><strong>Load local .pdb file:</strong> Click this button to open a file dialog and select a <code>.pdb</code> file from your computer.</li>
    <li><strong>Load from URL:</strong> Paste a direct link to a <code>.pdb</code> file into the input field and click "Load".</li>
    <li><strong>Select from Library:</strong> Click the "Select..." button to open a dialog with a curated list of platonic structures to load.</li>
  </ul>
  <p>Once loaded, you'll see information about the structure, like its title and the number of atoms, in the metadata display box.</p>

  <h2>2. Navigating the 3D Viewer</h2>
  <p>The central part of the application is the 3D viewer. You can interact with the loaded structure using your mouse:</p>
  <ul>
    <li><strong>Rotate:</strong> Click and drag with the left mouse button.</li>
    <li><strong>Zoom:</strong> Use the mouse scroll wheel.</li>
    <li><strong>Pan (Move):</strong> Click and drag with the right mouse button (or hold <code>Ctrl</code> and drag with the left).</li>
  </ul>
  <p>You can also use the controls in the <strong>Top Bar</strong> to set standard camera views (Front, Top, etc.), change the viewer background color, and toggle the visibility of the X, Y, and Z axes.</p>

  <h2>3. Customizing Appearance (<span class="panel-name">Left Panel - Tab 1</span>)</h2>
  <p>You can change how the structure is rendered to suit your needs.</p>
  <ul>
    <li><strong>Display Style:</strong> Choose from styles like <code>Lines</code>, <code>Sticks</code>, <code>Spheres</code>, or the classic <code>Ball & Stick</code>. The <code>Hide</code> option makes the entire structure invisible.</li>
    <li><strong>Stick Length Tolerance:</strong> This slider determines the maximum distance between two nodes for a "stick" (bond) to be drawn between them. Increase it to connect more distant nodes.</li>
    <li><strong>Node Size:</strong> Controls the size of the spheres in <code>Sphere</code> and <code>Ball & Stick</code> modes.</li>
    <li><strong>Stick Radius:</strong> Controls the thickness of the sticks.</li>
  </ul>

  <h2>4. Measurements & Inspection (<span class="panel-name">Left Panel - Tab 2</span>)</h2>
  <p>This panel is the core of the analysis toolkit. First, select an <strong>Interaction Mode</strong>:</p>
  <ul>
    <li><strong>Node Mode:</strong> Select a single node to view its properties and stereographic projection data.</li>
    <li><strong>Distance Mode:</strong> Select two nodes to measure the distance and angle between them.</li>
    <li><strong>Triangle Mode:</strong> Select three nodes to analyze the triangle they form, including its plane equation and projected properties.</li>
  </ul>

  <h3>Hover Info</h3>
  <p>As you move your mouse over nodes in the viewer, this box provides real-time information, such as the node's ID and its distance from the origin. In Distance or Triangle mode, it also shows live distances to already selected nodes.</p>

  <h3>Selection Info Panel</h3>
  <p>Once you select nodes according to the current mode, this panel populates with detailed information. Use the tabs at the top to switch between views:</p>
  <ul>
    <li><strong>Node Tabs:</strong> Show detailed coordinates and intersection data for each selected node.</li>
    <li><strong>Dist./Angles Tab:</strong> In Distance or Triangle mode, this shows measurements like distances, angles between nodes, and properties of the projected shapes.</li>
    <li><strong>Projected Points Tab:</strong> Allows you to select a projected point on one of the planes and see its specific coordinates.</li>
  </ul>
  <p>The <strong>Save Info</strong> button compiles all the data from this panel into a text file for you to download.</p>

  <h2>5. Stereographic Projection (<span class="panel-name">Right Panel - Tab 1</span>)</h2>
  <p>This panel controls the geometric guides used for stereographic projection. The core idea is to project points from a central origin (Omega) through the nodes of your structure onto a plane.</p>
  <ul>
    <li><strong>Geometric Guides:</strong> You can toggle the visibility of various spheres and planes (Primary and Antipodal) that serve as projection surfaces or geometric references.</li>
    <li><strong>Plane/Sphere Orientation:</strong> The <strong>Azimuth</strong> and <strong>Inclination</strong> sliders control the orientation of the projection planes and associated Riemann spheres. This effectively changes the direction of the projection.</li>
    <li><strong>CPS Lines & Projective Points:</strong> Toggle these to see the lines extending from the origin through each node, and the points where those lines intersect the projection planes.</li>
  </ul>

  <h2>6. Custom Geometry (<span class="panel-name">Right Panel - Tab 2</span>)</h2>
  <p>This advanced panel allows you to create your own geometric elements to inspect the projection space.</p>
  <ul>
    <li><strong>Create Node/Line:</strong> Define one or two points in 3D space using the coordinate sliders and inputs. The app will normalize these points and place them on a reference sphere.</li>
    <li><strong>Inspector Panel:</strong> Once created, a detailed inspector appears, showing all the same intersection and projection data as a regular node. For a line, it also calculates the 3D plane it defines with the origin and the corresponding 2D line on the projection plane.</li>
    <li><strong>Dual Geometry:</strong> This panel also visualizes concepts of duality, such as showing the 2D projective line that is "dual" to a selected 3D point.</li>
  </ul>

  <h2>7. Panel Management (Top Bar)</h2>
  <p>The top bar provides controls to manage your workspace:</p>
  <ul>
      <li><strong>Panels Buttons:</strong> Show or hide the left and right control panels to maximize viewer space.</li>
      <li><strong>Left/Right Panel Toggles:</strong> Switch between Tab 1 and Tab 2 for each respective panel.</li>
      <li><strong>User Guide:</strong> Opens this guide in a new window.</li>
  </ul>
`;

export const getStyledUserGuideContent = (): string => `
  <style>${styles}</style>
  <div class="guide-content">${contentHTML}</div>
`;
