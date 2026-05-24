import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import AddFileModal from '../components/AddFileModal';

export default function Dashboard({ onOpenFile }) {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const data = await api.getFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (name) => {
    const file = await api.createFile(name);
    setFiles((prev) => [file, ...prev]);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `Delete ${selected.size} file${selected.size > 1 ? 's' : ''} and all their entries? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.deleteFiles([...selected]);
      setFiles((prev) => prev.filter((f) => !selected.has(f.id)));
      setSelected(new Set());
    } catch (err) {
      alert('Failed to delete files: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-logo">Free<span>.</span>File</div>
        <div className="header-actions">
          <div className="header-user">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <div className="dashboard-toolbar">
          <div>
            <span className="header-logo" style={{ fontSize: '1.5rem' }}>
              My Files
            </span>
            {!loading && (
              <span className="toolbar-count">
                {files.length} {files.length === 1 ? 'file' : 'files'}
                {selected.size > 0 && ` · ${selected.size} selected`}
              </span>
            )}
          </div>
          <div className="header-actions">
            {selected.size > 0 && (
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : `🗑 Delete (${selected.size})`}
              </button>
            )}
            <button className="btn-add" onClick={() => setShowModal(true)}>
              + New File
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="loading-spinner" />
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No files yet</h3>
            <p>Click <strong>+ New File</strong> to create your first file.</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div
                key={file.id}
                className={`file-card ${selected.has(file.id) ? 'selected' : ''}`}
                onClick={() => onOpenFile(file)}
              >
                <div className="file-card-header">
                  <div
                    className="file-card-checkbox"
                    onClick={(e) => toggleSelect(e, file.id)}
                    title="Select file"
                  >
                    {selected.has(file.id) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="file-icon">📄</div>
                </div>
                <div className="file-card-name">{file.name}</div>
                <div className="file-card-meta">
                  <span className="entry-badge">
                    {file.entry_count} {file.entry_count === 1 ? 'entry' : 'entries'}
                  </span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddFileModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
