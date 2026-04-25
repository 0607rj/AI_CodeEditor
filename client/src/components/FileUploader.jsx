// client/src/components/FileUploader.jsx
// Drag-and-drop file uploader using react-dropzone
// WHY: Uploading entire project folders is essential for multi-file analysis.
// react-dropzone gives us a polished drag-and-drop UX without custom event wiring.

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const FileUploader = ({ onFilesUploaded, onClose }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const filePromises = acceptedFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              content: reader.result,
              size: file.size,
              type: file.type,
            });
          };
          reader.readAsText(file);
        });
      });

      Promise.all(filePromises).then((files) => {
        onFilesUploaded(files);
        onClose();
      });
    },
    [onFilesUploaded, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/javascript': ['.js', '.jsx', '.mjs'],
      'text/typescript': ['.ts', '.tsx'],
      'application/json': ['.json'],
      'text/css': ['.css'],
      'text/html': ['.html'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt', '.env'],
    },
    multiple: true,
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-editor-bg/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 w-full max-w-lg mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn-icon"
        >
          <FiX size={18} />
        </button>

        <h2 className="text-text-primary text-lg font-semibold mb-1">Upload Files</h2>
        <p className="text-text-muted text-sm mb-4">
          Drag & drop code files or click to browse
        </p>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-accent-cyan bg-accent-cyan/5 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
              : 'border-editor-border hover:border-accent-cyan/40 hover:bg-editor-card/30'
          }`}
        >
          <input {...getInputProps()} />
          <FiUploadCloud
            size={40}
            className={`mx-auto mb-3 transition-colors ${
              isDragActive ? 'text-accent-cyan' : 'text-text-muted'
            }`}
          />
          {isDragActive ? (
            <p className="text-accent-cyan font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-text-secondary font-medium">
                Drop your code files here
              </p>
              <p className="text-text-muted text-sm mt-1">
                .js, .jsx, .ts, .tsx, .json, .css, .html, .md
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
