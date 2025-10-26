// client/src/components/Header.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ title, count }) {
  const { toggle, isDark } = useTheme();

  return (
    <div className="page-header" style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1>{title}</h1>
        {typeof count === 'number' && <span className="count">{count}</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* theme toggle */}
        <button
          onClick={toggle}
          className="theme-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? '🌞' : '🌙'}
        </button>
      </div>
    </div>
  );
}
