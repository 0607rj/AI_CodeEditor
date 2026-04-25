// client/src/components/CodeEditor.jsx
// Monaco Editor wrapper with dark theme and language detection
// WHY: Monaco is the same editor engine as VS Code. Using @monaco-editor/react
// avoids the Webpack worker configuration hell that comes with raw monaco-editor.
// automaticLayout ensures the editor resizes when panels open/close.

import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, language = 'javascript', readOnly = false }) => {
  const editorRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define a custom dark theme that matches our design system
    monaco.editor.defineTheme('antigravity-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc' },      // violet-400
        { token: 'string', foreground: '34d399' },        // emerald-400
        { token: 'number', foreground: 'f59e0b' },        // amber
        { token: 'type', foreground: '06b6d4' },          // cyan
        { token: 'function', foreground: '60a5fa' },      // blue-400
        { token: 'variable', foreground: 'f1f5f9' },      // text-primary
        { token: 'operator', foreground: '94a3b8' },       // text-secondary
      ],
      colors: {
        'editor.background': '#0a0e17',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#1a2332',
        'editor.selectionBackground': '#06b6d440',
        'editorCursor.foreground': '#06b6d4',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.inactiveSelectionBackground': '#1e293b',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#334155',
        'editorWidget.background': '#111827',
        'editorWidget.border': '#1e293b',
        'input.background': '#0a0e17',
        'input.border': '#1e293b',
        'dropdown.background': '#111827',
        'dropdown.border': '#1e293b',
        'list.hoverBackground': '#1a2332',
        'list.activeSelectionBackground': '#243044',
        'minimap.background': '#111827',
      },
    });

    monaco.editor.setTheme('antigravity-dark');

    // Focus the editor
    editor.focus();
  };

  return (
    <div className="h-full w-full relative">
      {/* Editor header bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-accent-rose/70" />
            <div className="w-3 h-3 rounded-full bg-accent-amber/70" />
            <div className="w-3 h-3 rounded-full bg-accent-emerald/70" />
          </div>
          <span className="text-text-muted text-xs font-mono ml-2">
            {language}
            {readOnly && ' (read-only)'}
          </span>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="calc(100% - 32px)"
        language={language}
        value={code}
        onChange={onChange}
        onMount={handleEditorMount}
        theme="vs-dark" // Will be overridden to antigravity-dark on mount
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          tabSize: 2,
          wordWrap: 'on',
          readOnly,
          quickSuggestions: !readOnly,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-editor-bg">
            <div className="text-text-muted text-sm">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
