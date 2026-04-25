// client/src/components/DiffViewer.jsx
// Side-by-side diff view using Monaco DiffEditor
// WHY: Shows original vs AI-optimized code. This is the "wow" moment for Intent Mode —
// users see exactly what the AI changed. Monaco's DiffEditor handles diff rendering natively.

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

const DiffViewer = ({ original, modified, language = 'javascript', onClose }) => {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
          <h3 className="text-text-primary text-sm font-semibold">Diff View</h3>
          <span className="text-text-muted text-xs">Original → Optimized</span>
        </div>
        <button
          onClick={onClose}
          className="btn-secondary text-xs py-1 px-3"
        >
          Close Diff
        </button>
      </div>

      {/* Labels */}
      <div className="flex border-b border-editor-border">
        <div className="flex-1 px-4 py-1 text-xs font-medium text-accent-rose/80 bg-accent-rose/5 border-r border-editor-border">
          Original Code
        </div>
        <div className="flex-1 px-4 py-1 text-xs font-medium text-accent-emerald/80 bg-accent-emerald/5">
          AI Optimized
        </div>
      </div>

      {/* Diff Editor */}
      <div className="flex-1">
        <DiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            renderSideBySide: true,
            readOnly: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            padding: { top: 12 },
            lineNumbers: 'on',
            renderIndicators: true,
            originalEditable: false,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-editor-bg">
              <div className="text-text-muted text-sm">Loading diff viewer...</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DiffViewer;
