import React from 'react';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="dashboard">
      <Header title="Settings" />
      <div className="task-card" style={{ maxWidth: 700 }}>
        <h3>Account & App Settings</h3>
        <div style={{ marginTop: 12 }}>
          <label style={{ display:'flex', alignItems:'center', gap:12 }}>
            <input type="checkbox" checked={theme === 'dark'} onChange={toggle} />
            Use dark theme
          </label>
        </div>
        <p style={{ marginTop: 12 }}>Theme selection is saved locally.</p>
      </div>
    </div>
  );
}
