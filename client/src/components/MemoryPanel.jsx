// client/src/components/MemoryPanel.jsx
// Decision Memory panel for storing and querying developer decisions
// WHY: Developers make dozens of architectural decisions daily but forget the reasoning.
// This panel puts that knowledge at their fingertips — searchable and timestamped.

import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiTrash2, FiTag, FiClock } from 'react-icons/fi';
import { storeMemory, getMemories, deleteMemory } from '../services/api';
import { formatTimestamp } from '../utils/helpers';

const MemoryPanel = ({ onClose, currentFile }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    file: currentFile || '',
    function: '',
    decision: '',
    reason: '',
    tags: '',
  });

  // Fetch memories on mount and when search changes
  useEffect(() => {
    fetchMemories();
  }, [searchQuery]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const result = await getMemories(params);
      setMemories(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await storeMemory({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ file: currentFile || '', function: '', decision: '', reason: '', tags: '' });
      fetchMemories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <h3 className="text-text-primary text-sm font-semibold">Decision Memory</h3>
          <span className="text-text-muted text-xs">{memories.length} decisions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
          >
            <FiPlus size={12} /> Add
          </button>
          <button onClick={onClose} className="btn-secondary text-xs py-1 px-3">
            Close
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-editor-border">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Add Decision Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-editor-border space-y-3 animate-slide-in bg-editor-card/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">File *</label>
              <input
                type="text"
                value={form.file}
                onChange={(e) => setForm({ ...form, file: e.target.value })}
                className="input-field text-sm"
                placeholder="App.jsx"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Function</label>
              <input
                type="text"
                value={form.function}
                onChange={(e) => setForm({ ...form, function: e.target.value })}
                className="input-field text-sm"
                placeholder="handleSubmit"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Decision *</label>
            <input
              type="text"
              value={form.decision}
              onChange={(e) => setForm({ ...form, decision: e.target.value })}
              className="input-field text-sm"
              placeholder="Used useReducer instead of useState"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Reason *</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input-field text-sm resize-none"
              rows={2}
              placeholder="Complex state with multiple sub-values..."
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input-field text-sm"
              placeholder="performance, state-management"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-1.5" disabled={loading}>
              {loading ? 'Saving...' : 'Save Decision'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary text-xs py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-accent-rose/10 border border-accent-rose/20 rounded-lg text-accent-rose text-xs">
          {error}
        </div>
      )}

      {/* Memories List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && memories.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-3xl block mb-2">🧠</span>
            <p className="text-text-secondary text-sm">No decisions recorded yet</p>
            <p className="text-text-muted text-xs mt-1">Click "Add" to save your first decision</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory._id}
              className="glass-card p-3 space-y-2 hover:border-accent-emerald/20 transition-colors group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-accent-emerald font-mono text-xs">
                    {memory.file}
                  </span>
                  {memory.function && (
                    <>
                      <span className="text-text-muted text-xs">›</span>
                      <span className="text-accent-violet font-mono text-xs">
                        {memory.function}()
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(memory._id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-rose transition-all"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>

              {/* Decision */}
              <p className="text-text-primary text-sm font-medium">{memory.decision}</p>

              {/* Reason */}
              <p className="text-text-secondary text-xs">{memory.reason}</p>

              {/* Footer: Tags + Timestamp */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5 flex-wrap">
                  {memory.tags?.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-accent-cyan/10 text-accent-cyan rounded-full">
                      <FiTag size={8} /> {tag}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <FiClock size={10} /> {formatTimestamp(memory.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryPanel;
