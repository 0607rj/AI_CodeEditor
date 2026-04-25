// client/src/components/GraphView.jsx
// React Flow visualization of code relationships and dependencies
// WHY: Visual graphs make complex codebases instantly understandable.
// Custom nodes show file details (functions, imports) at a glance.
// Using @xyflow/react v12 with dark colorMode.

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Custom Node: File Node ─────────────────────────────────
const FileNode = ({ data }) => {
  return (
    <div className={`glass-card p-3 min-w-[200px] max-w-[280px] transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] ${
      data.hasError ? 'border-accent-rose/40' : ''
    }`}>
      {/* File name */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-editor-border">
        <span className="text-lg">📄</span>
        <span className="text-text-primary text-sm font-semibold truncate">{data.label}</span>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-2 text-[10px] text-text-muted">
        <span>↗ {data.imports} imports</span>
        <span>↙ {data.exports} exports</span>
      </div>

      {/* Functions */}
      {data.functions && data.functions.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Functions</span>
          <div className="flex flex-wrap gap-1">
            {data.functions.slice(0, 6).map((fn, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-accent-violet/15 text-accent-violet rounded">
                {fn}()
              </span>
            ))}
            {data.functions.length > 6 && (
              <span className="text-[10px] text-text-muted px-1">+{data.functions.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Hooks */}
      {data.hooks && data.hooks.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.hooks.map((hook, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-accent-cyan/15 text-accent-cyan rounded">
              {hook}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Custom Node: Dependency Node ────────────────────────────
const DependencyNode = ({ data }) => {
  return (
    <div className="px-3 py-2 rounded-lg bg-editor-card/40 border border-dashed border-text-muted/30 text-center transition-all duration-200 hover:border-accent-amber/40">
      <span className="text-xs mr-1">📦</span>
      <span className="text-text-muted text-xs font-mono">{data.label}</span>
    </div>
  );
};

// ── Custom Node: Function Node ──────────────────────────────
const FunctionNode = ({ data }) => {
  return (
    <div className="glass-card px-3 py-2 min-w-[140px] transition-all duration-200 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
      <div className="flex items-center gap-1.5">
        <span className="text-accent-violet text-xs">ƒ</span>
        <span className="text-text-primary text-xs font-mono font-semibold">{data.label}</span>
        {data.async && <span className="tag-low text-[8px]">async</span>}
      </div>
      {data.params && data.params.length > 0 && (
        <p className="text-[10px] text-text-muted mt-1 font-mono">
          ({data.params.join(', ')})
        </p>
      )}
    </div>
  );
};

// ── Main Graph Component ────────────────────────────────────
const GraphView = ({ graphData, onClose }) => {
  const nodeTypes = useMemo(() => ({
    custom: FileNode,
    dependency: DependencyNode,
    function: FunctionNode,
  }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData?.edges || []);

  // Update nodes/edges when graphData changes
  React.useEffect(() => {
    if (graphData) {
      setNodes(graphData.nodes || []);
      setEdges(graphData.edges || []);
    }
  }, [graphData, setNodes, setEdges]);

  if (!graphData || (graphData.nodes?.length === 0)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-text-secondary text-sm">No graph data available</p>
          <p className="text-text-muted text-xs mt-1">Analyze code to generate a dependency graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <h3 className="text-text-primary text-sm font-semibold">Dependency Graph</h3>
          <span className="text-text-muted text-xs">
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>
        <button onClick={onClose} className="btn-secondary text-xs py-1 px-3">
          Close Graph
        </button>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'dependency') return '#f59e0b';
              if (node.type === 'function') return '#8b5cf6';
              return '#06b6d4';
            }}
            maskColor="rgba(10, 14, 23, 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default GraphView;
