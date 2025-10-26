import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

export default function Settings() {
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);
  // const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [message, setMessage] = useState('');

  // Load reminder settings from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('tm_reminders_v1') || '{}');
    if (stored.enabled !== undefined) setReminderEnabled(stored.enabled);
    if (stored.time) setReminderTime(stored.time);
  }, []);

  // Helper to show short message
  const showMsg = (text, ms = 3200) => {
    setMessage(text);
    setTimeout(() => setMessage(''), ms);
  };

  // Save reminders locally
  const handleSaveReminders = () => {
    const obj = { enabled: reminderEnabled, time: reminderTime };
    localStorage.setItem('tm_reminders_v1', JSON.stringify(obj));
    showMsg('Reminder settings saved');
  };

  // Export tasks
  const handleExport = async () => {
    setExporting(true);
    try {
      const grouped = await api.getTasks();
      const all = [
        ...(grouped?.today || []),
        ...(grouped?.tomorrow || []),
        ...(grouped?.week || [])
      ];
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showMsg('Export started — check your Downloads folder');
    } catch (err) {
      console.error(err);
      showMsg('Export failed — try again');
    } finally {
      setExporting(false);
    }
  };

  // Clear local lists only (client-side)
  const handleClearLists = () => {
    if (!window.confirm('Clear saved lists in this browser? This will not delete tasks on the server.')) return;
    localStorage.removeItem('tm_user_lists_v1');
    showMsg('Local lists cleared');
  };

  // Reset local app state
  const handleResetLocal = () => {
    if (!window.confirm('Reset local app settings and lists?')) return;
    localStorage.removeItem('tm_user_lists_v1');
    localStorage.removeItem('tm_app_defaults_v1');
    showMsg('Local app data reset');
  };

  // Danger zone — delete everything on server
  const handleDeleteAllServer = async () => {
    const typed = window.prompt(
      'This will permanently delete ALL tasks on the server. Type DELETE to confirm.'
    );
    if (typed !== 'DELETE') {
      showMsg('Cancelled — no changes made');
      return;
    }

    setDeleting(true);
    try {
      const grouped = await api.getTasks();
      const all = [
        ...(grouped?.today || []),
        ...(grouped?.tomorrow || []),
        ...(grouped?.week || [])
      ];
      if (all.length === 0) {
        showMsg('No tasks found on the server');
        setDeleting(false);
        return;
      }

      let successCount = 0;
      for (const t of all) {
        const id = t._id || t.id;
        if (!id) continue;
        try {
          await api.deleteTask(id);
          successCount++;
        } catch (err) {
          console.warn('Failed to delete', id, err);
        }
      }

      showMsg(`Deleted ${successCount} tasks from server`);
    } catch (err) {
      console.error(err);
      showMsg('Delete failed — check console');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: 22 }}>
      <Header title="Settings" />

      <div style={{ marginTop: 18, maxWidth: 920, display: 'grid', gap: 18 }}>
        {message && (
          <div style={{
            padding: 10,
            borderRadius: 8,
            background: 'rgba(0,0,0,0.04)',
            color: theme === 'dark' ? '#e6eef8' : '#0f1724'
          }}>
            {message}
          </div>
        )}

        {/* Reminders */}
        <section className="task-card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Reminders & Notifications</h3>
          <p style={{ color: 'var(--muted)' }}>
            You can enable daily reminders to check your tasks at a chosen time.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
              />
              Enable reminders
            </label>

            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!reminderEnabled}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid var(--ui-gray)',
                background: 'transparent',
                color: 'var(--accent)',
                fontSize: 14
              }}
            />

            <button className="btn-confirm" onClick={handleSaveReminders}>
              Save
            </button>
          </div>
        </section>

        {/* Data section */}
        <section className="task-card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Backup & Local Data</h3>
          <p style={{ color: 'var(--muted)' }}>
            Download your tasks, or clear saved lists stored in this browser.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btn-confirm" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export tasks (.json)'}
            </button>

            <button className="btn-cancel" onClick={handleClearLists}>Clear saved lists</button>

            <button className="btn-cancel" onClick={handleResetLocal}>Reset local app data</button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="task-card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0, color: '#c24141' }}>Danger zone</h3>
          <p style={{ color: 'var(--muted)' }}>
            Permanently delete all tasks on the server. Use only for testing or when you want to start fresh.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              className="btn-confirm"
              onClick={handleDeleteAllServer}
              disabled={deleting}
              style={{ background: '#b91c1c' }}
            >
              {deleting ? 'Working...' : 'Delete everything on server'}
            </button>
          </div>
        </section>

        {/* About */}
        <section className="task-card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>About</h3>
          <p style={{ color: 'var(--muted)' }}>
            Simple Task Manager — add lists, save tasks, and organize your day.
          </p>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
            Version 1.0.0
          </div>
        </section>
      </div>
    </div>
  );
}
