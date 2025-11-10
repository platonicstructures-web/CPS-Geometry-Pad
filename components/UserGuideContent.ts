
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
  .guide-content p, .guide-content ul { margin-bottom: 1rem; color: #cbd5e1; }
  .guide-content code { background-color: #374151; color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Courier New', Courier, monospace; }
  .guide-content ul { padding-left: 1.5rem; }
  .guide-content li { margin-bottom: 0.5rem; }
  .guide-content strong { color: #a5f3fc; }
  .guide-content .panel-name { font-weight: bold; color: #facc15; }
`;

const contentHTML = `
  <h1>User Guide</h1>
  <p>Welcome to the Platonic Structures Geometry Pad! This guide will walk you through the features of this powerful tool for exploring molecular geometry and stereographic projections.</p>

  <h2>1. Loading a Structure (<span class="panel-name">Left Panel - Tab 1</span>)</h2>
  <p>To begin, you need to load a structure. You have four options:</p>
  <ul>
    <li><strong>Spherical Shells...:</strong> Opens a generator to create complex spherical shell structures. Configure parameters like lattice type and number of shells, then load the result directly into the viewer.</li>
    <li><strong>Open...:</strong> Click to open a file dialog and select a local <code>.pdb</code> file from your computer.</li>
    <li><strong>Select...:</strong> Opens a library of curated Platonic structures available for you to load instantly.</li>
    <li><strong>Load from URL:</strong> Paste a direct link to a <code>.pdb</code> file into the input field and click "Load".</li>
  </ul>
  <p>Once loaded, key information about the structure appears in the metadata display box.</p>

  <h2>2. Navigating the 3D Viewer</h2>
  <p>The central viewer is your main workspace. Use your mouse to interact with the model:</p>
  <ul>
    <li><strong>Rotate:</strong> Click and drag with the left mouse button.</li>
    <li><strong>Zoom:</strong> Use the mouse scroll wheel.</li>
    <li><strong>Pan (Move):</strong> Click and drag with the right mouse button (or hold <code>Ctrl</code> and drag with the left).</li>
  </ul>
  <p>The <strong>Top Bar</strong> offers further view controls: set standard camera angles (Front, Top, etc.), change the background color, and toggle the visibility of the XYZ axes and reference planes.</p>
  
  <h2>3. Customizing Appearance (<span class="panel-name">Left Panel - Tab 1</span>)</h2>
  <p>Adjust the visual representation of the structure to your needs.</p>
  <ul>
    <li><strong>Display Style:</strong> Choose from styles like <code>Sphere</code>, <code>Ball & Stick</code>, or hide the model completely.</li>
    <li><strong>Bond Generation:</strong>
        <ul>
            <li><code>Calculated</code>: Automatically creates bonds based on a distance threshold, controlled by the <strong>Length Tolerance</strong> slider.</li>
            <li><code>CONECT Only</code>: Only draws bonds explicitly defined in the PDB file's <code>CONECT</code> records.</li>
        </ul>
    </li>
    <li><strong>Size & Radius Sliders:</strong> Control the size of nodes, thickness of sticks, and radius of projection lines and intersection points.</li>
    <li><strong>Lattice System:</strong> Switch between <strong>Triangle</strong> and <strong>Square</strong> lattice definitions, adjust their respective lattice factors, and use the <strong>Convert</strong> button to transform a loaded structure from one system to the other.</li>
  </ul>
  
  <h2>4. Analysis & Measurement (<span class="panel-name">Left Panel - Tab 2</span>)</h2>
  <p>This is the core analysis toolkit. First, select an <strong>Interaction Mode</strong>:</p>
  <ul>
    <li><strong>Node Mode:</strong> Select a single node to view its 3D properties and all its corresponding 2D stereographic projection data.</li>
    <li><strong>Distance Mode:</strong> Select two nodes to measure the 3D distance, the angle they form at the origin, and the distances/angles between their projected points on the 2D planes.</li>
    <li><strong>Triangle Mode:</strong> Select three nodes to analyze the 3D triangle they form. This reveals side lengths, the 3D plane equation, and properties of the projected 2D triangles.</li>
    <li><strong>Inspection Mode:</strong> A powerful mode where you can select <em>projected points</em> directly on the 2D planes to analyze their properties, including geometric and complex inversion.</li>
  </ul>
  <p>The <strong>Hover Info</strong> box provides real-time data as you move your mouse over elements, while the <strong>Selection Info</strong> panel shows detailed calculations for your current selection.</p>

  <h2>5. Stereographic Projection (<span class="panel-name">Right Panel - Tab 1</span>)</h2>
  <p>This panel controls the geometric elements used for stereographic projection. The projection is cast from a central origin point, <strong>Omega (Ω)</strong>, through the structure's nodes, and onto 2D planes.</p>
  <ul>
    <li><strong>Omega (Ω):</strong> This is the center of projection. You can move its XYZ coordinates.</li>
    <li><strong>Elliptical Sphere:</strong> A reference sphere centered at Omega. You can change its radius and use it to filter the view, isolating or hiding nodes based on their distance from the origin.</li>
    <li><strong>Riemann Sphere & Planes:</strong> These are the projection surfaces. The <strong>Primary</strong> plane is in front of Omega, and the <strong>Antipodal</strong> plane is behind it. Their orientation is controlled by the Azimuth and Inclination sliders.</li>
    <li><strong>Visibility Toggles:</strong> Show or hide all geometric guides, the <strong>CPS Lines</strong> (projection lines from Omega), and the resulting <strong>Projective Points</strong> where the lines intersect the planes.</li>
  </ul>
  
  <h2>6. Custom Geometry & Duality (<span class="panel-name">Right Panel - Tab 2</span>)</h2>
  <p>This advanced panel allows you to create your own geometric elements to probe the projection space and explore the principle of duality.</p>
  <ul>
    <li><strong>Create Node/Line:</strong> Use the sliders to define one or two custom points in 3D space. These points are then projected and analyzed just like the nodes of a loaded structure.</li>
    <li><strong>Duality Explained:</strong>
      <ul>
        <li>A <strong>Point</strong> in 3D projects to a <strong>point</strong> in 2D. This 2D point has a corresponding <strong>dual line</strong> on the plane. Its equation is calculated and shown.</li>
        <li>A <strong>Line</strong> in 3D (defined by two points) forms a <strong>plane</strong> with the origin. This 3D plane projects to a <strong>line</strong> on the 2D plane. The intersection of the dual lines of the two initial points gives the <strong>dual point</strong> of this projected line.</li>
      </ul>
    </li>
    <li><strong>Inspector:</strong> The panel provides a detailed breakdown of all intersections and dual geometry calculations for your custom elements.</li>
  </ul>
`;

export const getStyledUserGuideContent = (): string => `
  <style>${styles}</style>
  <div class="guide-content">${contentHTML}</div>
`;
