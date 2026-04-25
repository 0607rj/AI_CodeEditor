// client/src/components/Sidebar.jsx
// Left sidebar with file list, action buttons, and uploaded file management
// WHY: The sidebar is the primary navigation hub. It needs to feel like a real IDE
// with clear visual hierarchy and smooth interactions.

import React, { useState } from 'react';
import { FiCode, FiCpu, FiDatabase, FiUpload, FiFile, FiTrash2, FiZap, FiGitBranch } from 'react-icons/fi';
import { getFileIcon } from '../utils/helpers';

const Sidebar = ({
  files,
  activeFile,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
  onExplain,
  onToggleMemory,
  onUploadClick,
  activeMode,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-full bg-editor-surface border-r border-editor-border transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* ── Logo / Header ─────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-editor-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AG
          </div>
          {!collapsed && (
            <span className="text-text-primary font-semibold text-sm tracking-tight">
              Antigravity
            </span>
          )}
        </button>
      </div>

      {/* ── Action Buttons ────────────────────────────────── */}
      <div className={`flex flex-col gap-1 p-2 border-b border-editor-border ${collapsed ? 'items-center' : ''}`}>
        <ActionButton
          icon={<FiZap size={16} />}
          label="Intent Mode"
          collapsed={collapsed}
          active={activeMode === 'analyze'}
          onClick={onAnalyze}
          color="cyan"
        />
        <ActionButton
          icon={<FiGitBranch size={16} />}
          label="Explain Code"
          collapsed={collapsed}
          active={activeMode === 'explain'}
          onClick={onExplain}
          color="violet"
        />
        <ActionButton
          icon={<FiDatabase size={16} />}
          label="Memory"
          collapsed={collapsed}
          active={activeMode === 'memory'}
          onClick={onToggleMemory}
          color="emerald"
        />
      </div>

      {/* ── File Explorer ─────────────────────────────────── */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="section-title">Files</span>
            <button
              onClick={onUploadClick}
              className="btn-icon"
              title="Upload files"
            >
              <FiUpload size={14} />
            </button>
          </div>

          {files.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <FiFile size={24} className="mx-auto text-text-muted mb-2" />
              <p className="text-text-muted text-xs">No files uploaded</p>
              <p className="text-text-muted text-xs mt-1">Use the editor or upload files</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 px-1">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                    activeFile === file.name
                      ? 'bg-accent-cyan/10 text-accent-cyan border-l-2 border-accent-cyan'
                      : 'text-text-secondary hover:bg-editor-hover hover:text-text-primary border-l-2 border-transparent'
                  }`}
                  onClick={() => onFileSelect(file.name)}
                >
                  <span className="text-sm flex-shrink-0">{getFileIcon(file.name)}</span>
                  <span className="text-xs font-mono truncate flex-1">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-rose transition-all"
                    title="Remove file"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      {!collapsed && (
        <div className="p-3 border-t border-editor-border">
          <p className="text-[10px] text-text-muted text-center">
            Powered by Gemini AI ✨
          </p>
        </div>
      )}
    </aside>
  );
};

/**
 * Reusable action button component for the sidebar
 */
const ActionButton = ({ icon, label, collapsed, active, onClick, color }) => {
  const colorMap = {
    cyan: {
      active: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
      hover: 'hover:bg-accent-cyan/10 hover:text-accent-cyan',
    },
    violet: {
      active: 'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
      hover: 'hover:bg-accent-violet/10 hover:text-accent-violet',
    },
    emerald: {
      active: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
      hover: 'hover:bg-accent-emerald/10 hover:text-accent-emerald',
    },
  };

  const colors = colorMap[color] || colorMap.cyan;

  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
        active
          ? colors.active
          : `border-transparent text-text-secondary ${colors.hover}`
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default Sidebar;
