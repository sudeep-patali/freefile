import React, { useState, useEffect, useRef } from 'react';

export default function AddFileModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onCreate(name.trim());
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h3>New File</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>File Name</label>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Meeting Notes, Ideas, Journal…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-create" disabled={loading || !name.trim()}>
              {loading ? 'Creating…' : 'Create File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
