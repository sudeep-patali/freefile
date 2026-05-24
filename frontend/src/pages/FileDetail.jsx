import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export default function FileDetail({ file, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.getEntries(file.id);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  }, [file.id]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = async () => {
    if (!newContent.trim()) return;
    setAdding(true);
    try {
      const entry = await api.createEntry(file.id, newContent.trim());
      setEntries((prev) => [...prev, entry]);
      setNewContent('');
    } catch (err) {
      alert('Failed to add entry: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = async (entryId) => {
    if (!editContent.trim()) return;
    try {
      const updated = await api.updateEntry(file.id, entryId, editContent.trim());
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update entry: ' + err.message);
    }
  };

  const handleRemove = async (entryId) => {
    if (!window.confirm('Remove this entry?')) return;
    try {
      await api.deleteEntry(file.id, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      alert('Failed to delete entry: ' + err.message);
    }
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddEntry();
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="file-detail">
      <header className="file-detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Files
        </button>
        <div className="file-detail-title">{file.name}</div>
        <div style={{ width: 80 }} />
      </header>

      <div className="file-detail-body">
        <div className="add-entry-box">
          <h3>New Entry</h3>
          <textarea
            placeholder="Type your note, idea, or content here… (Cmd+Enter to save)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
          />
          <button
            className="btn-add-entry"
            onClick={handleAddEntry}
            disabled={adding || !newContent.trim()}
          >
            {adding ? 'Adding…' : '+ Add Entry'}
          </button>
        </div>

        <div className="entries-section">
          <h3>
            Entries{' '}
            {!loading && `(${entries.length})`}
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">✏️</div>
              <h3>No entries yet</h3>
              <p>Add your first entry above.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                {editingId === entry.id ? (
                  <>
                    <textarea
                      className="entry-content-edit"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="entry-footer">
                      <div className="entry-timestamps">
                        <span className="entry-ts">
                          <span className="ts-label">Created</span>
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <div className="entry-actions">
                        <button className="btn-entry-cancel" onClick={cancelEdit}>Cancel</button>
                        <button
                          className="btn-entry-save"
                          onClick={() => saveEdit(entry.id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="entry-content-view"
                      onClick={() => startEdit(entry)}
                      title="Click to edit"
                    >
                      {entry.content}
                    </div>
                    <div className="entry-footer">
                      <div className="entry-timestamps">
                        <span className="entry-ts">
                          <span className="ts-label">Created</span>
                          {formatDate(entry.created_at)}
                        </span>
                        {entry.updated_at !== entry.created_at && (
                          <span className="entry-ts">
                            <span className="ts-label">Edited</span>
                            {formatDate(entry.updated_at)}
                          </span>
                        )}
                      </div>
                      <div className="entry-actions">
                        <button className="btn-entry-remove" onClick={() => handleRemove(entry.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
