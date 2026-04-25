// server/services/graphService.js
// Converts parsed AST data into React Flow-compatible nodes and edges
// WHY: React Flow needs { nodes: [...], edges: [...] } with specific shapes.
// This service bridges the gap between raw parse data and visualization.
// Uses dagre-style layout (manual topological positioning) for clean hierarchy.

/**
 * Generate React Flow graph data from parsed file results
 * @param {Array<Object>} parsedFiles - Output from parserService.parseMultipleFiles()
 * @returns {{ nodes: Array, edges: Array }} React Flow compatible graph
 */
export const generateGraph = (parsedFiles) => {
  const nodes = [];
  const edges = [];
  const fileMap = new Map(); // filename → node id mapping

  // ── Step 1: Create nodes for each file ───────────────────
  // Position nodes in a grid layout (will be refined by dagre on frontend if needed)
  const COLS = 3;
  const X_GAP = 320;
  const Y_GAP = 200;

  parsedFiles.forEach((file, index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const nodeId = file.filename.replace(/[^a-zA-Z0-9]/g, '_');

    fileMap.set(file.filename, nodeId);

    // Node data includes parsed info for the custom node component
    nodes.push({
      id: nodeId,
      type: 'custom', // Will be rendered by our custom React Flow node
      position: { x: col * X_GAP + 50, y: row * Y_GAP + 50 },
      data: {
        label: file.filename,
        functions: file.functions.map((f) => f.name),
        imports: file.imports.length,
        exports: file.exports.length,
        dependencies: file.dependencies,
        classes: file.classes?.map((c) => c.name) || [],
        hooks: file.hooks?.map((h) => h.name) || [],
        hasError: !!file.parseError,
      },
    });
  });

  // ── Step 2: Create edges based on import relationships ───
  // For each file, check if its imports reference another file in the project
  let edgeId = 0;
  parsedFiles.forEach((file) => {
    const sourceId = fileMap.get(file.filename);

    file.imports.forEach((imp) => {
      // Try to resolve relative imports to actual files in the project
      const resolvedTarget = resolveImportToFile(imp.source, file.filename, parsedFiles);
      if (resolvedTarget) {
        const targetId = fileMap.get(resolvedTarget);
        if (targetId && sourceId !== targetId) {
          edges.push({
            id: `e${edgeId++}`,
            source: sourceId,
            target: targetId,
            animated: true,
            label: imp.specifiers.map((s) => s.name).join(', ') || 'imports',
            style: { stroke: '#06b6d4' }, // Cyan accent
            labelStyle: { fill: '#94a3b8', fontSize: 10 },
            type: 'smoothstep',
          });
        }
      }
    });
  });

  // ── Step 3: Add dependency nodes (external packages) ─────
  const allDeps = new Set();
  parsedFiles.forEach((file) => {
    file.dependencies.forEach((dep) => allDeps.add(dep));
  });

  const depStartY = (Math.ceil(parsedFiles.length / COLS) + 1) * Y_GAP;
  let depIndex = 0;
  allDeps.forEach((dep) => {
    const depNodeId = `dep_${dep.replace(/[^a-zA-Z0-9]/g, '_')}`;
    nodes.push({
      id: depNodeId,
      type: 'dependency', // Different visual style for external deps
      position: { x: (depIndex % 5) * 200 + 50, y: depStartY + Math.floor(depIndex / 5) * 100 },
      data: { label: dep, isExternal: true },
    });

    // Connect files to their dependencies
    parsedFiles.forEach((file) => {
      if (file.dependencies.includes(dep)) {
        const sourceId = fileMap.get(file.filename);
        edges.push({
          id: `e${edgeId++}`,
          source: sourceId,
          target: depNodeId,
          animated: false,
          style: { stroke: '#64748b', strokeDasharray: '5 5' }, // Dashed for external
          type: 'smoothstep',
        });
      }
    });

    depIndex++;
  });

  return { nodes, edges };
};

/**
 * Try to resolve a relative import path to an actual file in our parsed files
 * e.g., './Sidebar' might resolve to 'Sidebar.jsx' or 'Sidebar.js'
 */
function resolveImportToFile(importSource, currentFile, parsedFiles) {
  if (!importSource.startsWith('.')) return null; // Skip external packages

  const filenames = parsedFiles.map((f) => f.filename);
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];

  // Get the base name from the import path
  const importBase = importSource.replace(/^\.\//, '').replace(/^\.\.\//, '');

  for (const ext of extensions) {
    const candidate = importBase + ext;
    if (filenames.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Generate a simplified graph from a single file (shows internal structure)
 * Used when only one file is uploaded/analyzed
 */
export const generateSingleFileGraph = (parsedFile) => {
  const nodes = [];
  const edges = [];
  let edgeId = 0;

  // Root node: the file itself
  const rootId = 'file_root';
  nodes.push({
    id: rootId,
    type: 'custom',
    position: { x: 300, y: 50 },
    data: {
      label: parsedFile.filename,
      functions: [],
      imports: parsedFile.imports.length,
      exports: parsedFile.exports.length,
    },
  });

  // Function nodes
  parsedFile.functions.forEach((fn, i) => {
    const fnId = `fn_${i}`;
    nodes.push({
      id: fnId,
      type: 'function',
      position: { x: (i % 3) * 250 + 100, y: 200 + Math.floor(i / 3) * 150 },
      data: {
        label: fn.name,
        params: fn.params,
        async: fn.async,
        type: fn.type,
      },
    });
    edges.push({
      id: `e${edgeId++}`,
      source: rootId,
      target: fnId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6' }, // Violet accent
    });
  });

  // Import nodes
  parsedFile.imports.forEach((imp, i) => {
    const impId = `imp_${i}`;
    const isExternal = !imp.source.startsWith('.');
    nodes.push({
      id: impId,
      type: 'dependency',
      position: { x: (i % 4) * 200 + 50, y: -100 },
      data: { label: imp.source, isExternal },
    });
    edges.push({
      id: `e${edgeId++}`,
      source: impId,
      target: rootId,
      type: 'smoothstep',
      style: { stroke: isExternal ? '#64748b' : '#06b6d4', strokeDasharray: isExternal ? '5 5' : '' },
    });
  });

  return { nodes, edges };
};
