// client/src/components/AddTaskModal.js
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function AddTaskModal({ open, onClose, onConfirm }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expected, setExpected] = useState('');
  const [bucket, setBucket] = useState('today');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const modalRef = useRef(null);
  const { show } = useToast();

  useEffect(() => {
    if (open) {
      setTitle(''); setDescription(''); setStartDate(''); setExpected(''); setBucket('today');
      setTimeout(() => titleRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bucket,
        title: title.trim(),
        description: description.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        expectedCompletion: expected ? new Date(expected).toISOString() : undefined
      };
      await onConfirm(payload);
      show('Task added', { type: 'success' });
      onClose();
    } catch (err) {
      console.error('Add task failed', err);
      show('Failed to add task: ' + (err.message || 'Unknown'), { type: 'error', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="popup-overlay" onMouseDown={handleBackdropClick}>
      <div
        className="popup-card"
        role="dialog"
        aria-modal="true"
        aria-label="Add Task"
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="popup-header">
          <h3>Add Task</h3>
          <button className="popup-close" aria-label="Close" onClick={onClose}>&times;</button>
        </header>

        <form className="popup-form" onSubmit={submit}>
          <label className="popup-row">
            <span className="popup-label">Title</span>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="popup-input"
              required
            />
          </label>

          <label className="popup-row">
            <span className="popup-label">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="popup-textarea"
            />
          </label>

          <div className="popup-grid">
            <label className="popup-row">
              <span className="popup-label">Start</span>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="popup-input"
              />
            </label>

            <label className="popup-row">
              <span className="popup-label">Expected</span>
              <input
                type="datetime-local"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="popup-input"
              />
            </label>
          </div>

          <label className="popup-row">
            <span className="popup-label">Bucket</span>
            <select value={bucket} onChange={(e) => setBucket(e.target.value)} className="popup-input">
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          </label>

          <div className="popup-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-confirm" disabled={saving}>{saving ? 'Saving...' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
