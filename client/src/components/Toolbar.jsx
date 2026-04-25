// client/src/components/Toolbar.jsx
// Top toolbar showing analysis results summary
// WHY: After AI analysis completes, the toolbar shows a summary of issues found
// with severity badges. Clicking "View Diff" opens the DiffViewer.

import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiGitMerge, FiInfo } from 'react-icons/fi';
import { getSeverityClass } from '../utils/helpers';

const Toolbar = ({ analysisResult, onViewDiff, onClearResults }) => {
  if (!analysisResult) return null;

  const { analysis, originalCode, optimizedCode } = analysisResult;
  const issues = analysis?.issues || [];
  const suggestions = analysis?.suggestions || [];
  const badPractices = analysis?.badPractices || [];

  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;

  return (
    <div className="animate-slide-in">
      {/* Summary Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-4">
          <span className="text-text-primary text-sm font-semibold">Analysis Results</span>
          <div className="flex items-center gap-2">
            {highCount > 0 && (
              <span className="tag-high flex items-center gap-1">
                <FiAlertTriangle size={10} /> {highCount} high
              </span>
            )}
            {mediumCount > 0 && (
              <span className="tag-medium flex items-center gap-1">
                <FiInfo size={10} /> {mediumCount} medium
              </span>
            )}
            {lowCount > 0 && (
              <span className="tag-low flex items-center gap-1">
                <FiCheckCircle size={10} /> {lowCount} low
              </span>
            )}
            {issues.length === 0 && (
              <span className="tag-low flex items-center gap-1">
                <FiCheckCircle size={10} /> No issues!
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {optimizedCode && optimizedCode !== originalCode && (
            <button onClick={onViewDiff} className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5">
              <FiGitMerge size={12} /> View Diff
            </button>
          )}
          <button onClick={onClearResults} className="btn-secondary text-xs py-1 px-3">
            Clear
          </button>
        </div>
      </div>

      {/* Detailed Results Panel */}
      <div className="max-h-[300px] overflow-y-auto px-4 py-3 bg-editor-surface/50 border-b border-editor-border space-y-4">
        {/* Summary */}
        {analysis?.summary && (
          <div className="glass-card p-3">
            <p className="text-text-secondary text-sm">{analysis.summary}</p>
          </div>
        )}

        {/* Issues List */}
        {issues.length > 0 && (
          <div>
            <h4 className="section-title mb-2">Issues ({issues.length})</h4>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 glass-card p-2.5 hover:border-editor-hover transition-colors"
                >
                  <span className={getSeverityClass(issue.severity)}>
                    {issue.severity}
                  </span>
                  <div className="flex-1">
                    <p className="text-text-primary text-xs">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-text-muted text-xs mt-1">
                        💡 {issue.fix}
                      </p>
                    )}
                  </div>
                  {issue.line && (
                    <span className="text-text-muted text-[10px] font-mono">L{issue.line}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="section-title mb-2">Suggestions</h4>
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-text-secondary text-xs">
                  <span className="text-accent-cyan mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bad Practices */}
        {badPractices.length > 0 && (
          <div>
            <h4 className="section-title mb-2">Bad Practices</h4>
            <div className="space-y-2">
              {badPractices.map((bp, i) => (
                <div key={i} className="glass-card p-2.5">
                  <p className="text-accent-rose text-xs font-medium">{bp.practice}</p>
                  <p className="text-text-muted text-xs mt-1">{bp.why}</p>
                  <p className="text-accent-emerald text-xs mt-1">✓ {bp.alternative}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folder Structure Suggestion */}
        {analysis?.folderStructure && (
          <div>
            <h4 className="section-title mb-2">Suggested Structure</h4>
            <pre className="glass-card p-3 text-text-secondary text-xs font-mono whitespace-pre-wrap">
              {analysis.folderStructure}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
