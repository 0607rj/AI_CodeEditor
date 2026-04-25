// client/src/App.jsx
// Main application component — orchestrates all panels and state
// WHY: Single source of truth for app state. No Redux (overkill for this scope).
// Uses useState for each panel's data and conditional rendering for active views.
// The three-panel layout (sidebar | editor | results) mirrors professional IDEs.

import React, { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import DiffViewer from './components/DiffViewer';
import GraphView from './components/GraphView';
import MemoryPanel from './components/MemoryPanel';
import Toolbar from './components/Toolbar';
import FileUploader from './components/FileUploader';
import LoadingOverlay from './components/LoadingOverlay';
import { analyzeCode, explainCode, explainMultipleFiles } from './services/api';
import { detectLanguage, SAMPLE_CODE } from './utils/helpers';
import './App.css';

function App() {
  // ── Editor State ───────────────────────────────────────
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState('javascript');

  // ── File Management ────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  // ── UI State ───────────────────────────────────────────
  const [activeMode, setActiveMode] = useState(null); // 'analyze' | 'explain' | 'memory'
  const [showUploader, setShowUploader] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // ── Results State ──────────────────────────────────────
  const [analysisResult, setAnalysisResult] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [explanation, setExplanation] = useState(null);

  // ── Right Panel: What to show ──────────────────────────
  const [rightPanel, setRightPanel] = useState(null); // 'analysis' | 'graph' | 'memory' | 'diff'

  // ── File Selection ─────────────────────────────────────
  const handleFileSelect = useCallback((fileName) => {
    setActiveFile(fileName);
    const file = files.find((f) => f.name === fileName);
    if (file) {
      setCode(file.content);
      setLanguage(detectLanguage(fileName));
    }
  }, [files]);

  const handleRemoveFile = useCallback((fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    if (activeFile === fileName) {
      setActiveFile(null);
      setCode(SAMPLE_CODE);
      setLanguage('javascript');
    }
  }, [activeFile]);

  const handleFilesUploaded = useCallback((newFiles) => {
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    // Auto-select first uploaded file
    if (newFiles.length > 0) {
      setActiveFile(newFiles[0].name);
      setCode(newFiles[0].content);
      setLanguage(detectLanguage(newFiles[0].name));
    }
    toast.success(`${newFiles.length} file(s) uploaded`);
  }, []);

  // ── Intent Mode: Analyze Code ──────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      toast.error('No code to analyze');
      return;
    }

    try {
      setActiveMode('analyze');
      setLoading(true);
      setLoadingMessage('Analyzing your code with AI...');
      setShowDiff(false);

      const result = await analyzeCode(code, language, activeFile || 'code.js');

      setAnalysisResult(result.data);
      setRightPanel('analysis');
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [code, language, activeFile]);

  // ── Explain Code/Codebase ──────────────────────────────
  const handleExplain = useCallback(async () => {
    try {
      setActiveMode('explain');
      setLoading(true);
      setLoadingMessage('Parsing and explaining your code...');

      let result;
      if (files.length > 1) {
        // Multi-file codebase analysis
        result = await explainMultipleFiles(
          files.map((f) => ({ name: f.name, content: f.content }))
        );
      } else {
        // Single file
        if (!code.trim()) {
          toast.error('No code to explain');
          setLoading(false);
          return;
        }
        result = await explainCode(code, activeFile || 'code.js');
      }

      setGraphData(result.data.graph);
      setExplanation(result.data.explanation);
      setRightPanel('graph');
      toast.success('Code explained!');
    } catch (err) {
      toast.error(err.message || 'Explanation failed');
      console.error('Explain error:', err);
    } finally {
      setLoading(false);
    }
  }, [code, files, activeFile]);

  // ── Toggle Memory Panel ────────────────────────────────
  const handleToggleMemory = useCallback(() => {
    if (activeMode === 'memory') {
      setActiveMode(null);
      setRightPanel(null);
    } else {
      setActiveMode('memory');
      setRightPanel('memory');
    }
  }, [activeMode]);

  // ── View Diff ──────────────────────────────────────────
  const handleViewDiff = useCallback(() => {
    setShowDiff(true);
    setRightPanel('diff');
  }, []);

  // ── Clear Results ──────────────────────────────────────
  const handleClearResults = useCallback(() => {
    setAnalysisResult(null);
    setGraphData(null);
    setExplanation(null);
    setActiveMode(null);
    setRightPanel(null);
    setShowDiff(false);
  }, []);

  // ── Close Right Panel ──────────────────────────────────
  const handleCloseRightPanel = useCallback(() => {
    setRightPanel(null);
    setActiveMode(null);
    setShowDiff(false);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-editor-bg">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2332',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1a2332' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#1a2332' },
          },
        }}
      />

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message={loadingMessage} />

      {/* File Uploader Modal */}
      {showUploader && (
        <FileUploader
          onFilesUploaded={handleFilesUploaded}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────── */}
      <Sidebar
        files={files}
        activeFile={activeFile}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
        onAnalyze={handleAnalyze}
        onExplain={handleExplain}
        onToggleMemory={handleToggleMemory}
        onUploadClick={() => setShowUploader(true)}
        activeMode={activeMode}
      />

      {/* ── Main Content Area ─────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Analysis Results Toolbar (appears after Intent Mode) */}
        {analysisResult && rightPanel === 'analysis' && (
          <Toolbar
            analysisResult={analysisResult}
            onViewDiff={handleViewDiff}
            onClearResults={handleClearResults}
          />
        )}

        {/* Editor + Right Panel */}
        <div className="flex-1 flex min-h-0">
          {/* Code Editor (always visible unless full-screen diff) */}
          {rightPanel !== 'diff' && (
            <div className={`flex-1 min-w-0 ${rightPanel ? 'border-r border-editor-border' : ''}`}>
              <CodeEditor
                code={code}
                onChange={(value) => setCode(value || '')}
                language={language}
              />
            </div>
          )}

          {/* Right Panel: Diff | Graph | Memory */}
          {rightPanel && (
            <div className={`${rightPanel === 'diff' ? 'flex-1' : 'w-[480px]'} min-w-0 bg-editor-bg flex flex-col`}>
              {rightPanel === 'diff' && analysisResult && (
                <DiffViewer
                  original={analysisResult.originalCode}
                  modified={analysisResult.optimizedCode}
                  language={language}
                  onClose={handleCloseRightPanel}
                />
              )}

              {rightPanel === 'graph' && (
                <GraphView
                  graphData={graphData}
                  onClose={handleCloseRightPanel}
                />
              )}

              {rightPanel === 'memory' && (
                <MemoryPanel
                  onClose={handleCloseRightPanel}
                  currentFile={activeFile}
                />
              )}

              {/* Explanation text (shown below the graph) */}
              {rightPanel === 'graph' && explanation && (
                <div className="border-t border-editor-border p-4 max-h-[200px] overflow-y-auto bg-editor-surface/50">
                  <h4 className="section-title mb-2">AI Explanation</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {explanation.summary || explanation.rawResponse || JSON.stringify(explanation)}
                  </p>
                  {explanation.dataFlow && (
                    <div className="mt-2">
                      <span className="section-title">Data Flow</span>
                      <p className="text-text-muted text-xs mt-1">{explanation.dataFlow}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
