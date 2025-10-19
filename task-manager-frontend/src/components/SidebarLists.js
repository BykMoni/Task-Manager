// client/src/components/SidebarLists.js
import React, { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'tm_user_lists_v1';

export default function SidebarLists({ onSelect, activeList }) {
  const { tasks } = useTasks();
  const navigate = useNavigate();

  // initialize lists from localStorage or defaults
  const [lists, setLists] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fallthrough */ }
    }
    const defaults = ['Personal', 'Work', 'List 1'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  });

  // Whenever tasks change, re-read localStorage (this picks up lists persisted by the modal)
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        setLists(arr);
      } catch (err) {
        console.warn('Invalid lists in localStorage', err);
      }
    }
  }, [tasks]);

  const save = (next) => {
    setLists(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addList = () => {
    const name = prompt('New list name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (lists.includes(trimmed)) return alert('List exists');
    const next = [trimmed, ...lists];
    save(next);
    if (onSelect) onSelect(trimmed);
    // navigate to the new list page
    navigate(`/lists/${encodeURIComponent(trimmed)}`);
  };

  const removeList = (name) => {
    if (!confirm(`Remove list "${name}"? This won't delete tasks but will unassign them.`)) return;
    const next = lists.filter(l => l !== name);
    save(next);
    if (onSelect && activeList === name) onSelect(null);
    navigate('/lists');
  };

  // compute counts from tasks
  const all = [...(tasks.today || []), ...(tasks.tomorrow || []), ...(tasks.week || [])];
  const counts = {};
  all.forEach(t => {
    const ln = t.list || 'Unassigned';
    counts[ln] = (counts[ln] || 0) + 1;
  });

  return (
    <div className="section">
      <div className="sidebar-inner">
        <div className="menu-title">
          <h3>Lists</h3>
          <button className="hamburger" onClick={addList} title="Add list">＋</button>
        </div>

        <ul className="lists">
          {lists.map(l => (
            <li
              key={l}
              className={`list-item ${activeList === l ? 'active' : ''}`}
              onClick={() => {
                if (onSelect) onSelect(l);
                navigate(`/lists/${encodeURIComponent(l)}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span className="dot dot-blue" />
                <span>{l}</span>
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="muted-badge">{counts[l] || 0}</span>
                <button className="mini-btn" onClick={(e) => { e.stopPropagation(); removeList(l); }}>✕</button>
              </div>
            </li>
          ))}

          <li className={`list-item ${!activeList ? 'active' : ''}`} onClick={() => { if (onSelect) onSelect(null); navigate('/lists'); }} style={{ cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span className="dot dot-yellow" />
              <span>All / Unassigned</span>
            </span>
            <span className="muted-badge">{all.length}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
