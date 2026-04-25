// client/src/utils/helpers.js
// Utility functions used across components
// WHY: Pure helper functions that don't belong in any specific component.

/**
 * Detect programming language from filename extension
 */
export const detectLanguage = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
  };
  return langMap[ext] || 'javascript';
};

/**
 * Format timestamp to readable string
 */
export const formatTimestamp = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLen = 50) => {
  if (!str || str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
};

/**
 * Get file icon based on extension
 */
export const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const iconMap = {
    js: '📜',
    jsx: '⚛️',
    ts: '🔷',
    tsx: '⚛️',
    css: '🎨',
    html: '🌐',
    json: '📋',
    md: '📝',
    py: '🐍',
    java: '☕',
    go: '🐹',
  };
  return iconMap[ext] || '📄';
};

/**
 * Severity color class map
 */
export const getSeverityClass = (severity) => {
  const map = {
    high: 'tag-high',
    medium: 'tag-medium',
    low: 'tag-low',
  };
  return map[severity] || 'tag-low';
};

/**
 * Default sample code shown in the editor on first load
 */
export const SAMPLE_CODE = `// Welcome to Antigravity AI Code Editor ✨
// Paste your code here or upload files to get started!

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Example: A component with some common issues for the AI to detect
function UserDashboard({ userId }) {
  var data = null;  // 🔴 Should use const/let
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🟡 Missing cleanup, no error handling
    setLoading(true);
    axios.get('/api/users/' + userId)  // 🟡 String concat instead of template literal
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      });
  }, []); // 🔴 Missing userId dependency

  // 🟡 Function could be memoized
  const filterActiveUsers = () => {
    return users.filter(user => user.active == true); // 🔴 Loose equality
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {filterActiveUsers().map(user => (
        <div key={user.id}>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}

export default UserDashboard;
`;
