import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';

const STORAGE_KEY = 'tm_user_lists_v1';

export default function Sidebar() {
  const { counts, tasks } = useTasks();
  const navigate = useNavigate();
  const [lists, setLists] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { return ['Personal', 'Work', 'List 1']; }
    }
    const defaults = ['Personal', 'Work', 'List 1'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  });

  const activeClass = ({ isActive }) => isActive ? 'nav-item active' : 'nav-item';

  const addList = () => {
    const name = prompt('Enter new list name:');
    if (!name) return;
    const clean = name.trim();
    if (!clean || lists.includes(clean)) return;
    const next = [...lists, clean];
    setLists(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const removeList = (list) => {
    if (!window.confirm(`Remove list "${list}"?`)) return;
    const next = lists.filter(l => l !== list);
    setLists(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // count how many tasks belong to each list
  const all = [...(tasks.today || []), ...(tasks.tomorrow || []), ...(tasks.week || [])];
  const listCounts = {};
  all.forEach(t => {
    const listName = t.list || 'Unassigned';
    listCounts[listName] = (listCounts[listName] || 0) + 1;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="menu-title">
          <h3>Menu</h3>
          <button className="hamburger">≡</button>
        </div>

        <div className="search">
          <input placeholder="Search" />
        </div>

        <div className="section">
          <h4 className="section-title">TASKS</h4>
          <ul className="nav-list">
            <li><NavLink to="/" className={activeClass}>Upcoming <span className="badge">{counts.total}</span></NavLink></li>
            <li><NavLink to="/today" className={activeClass}>Today <span className="muted-badge">{counts.today}</span></NavLink></li>
            <li><NavLink to="/calendar" className={activeClass}>Calendar</NavLink></li>
            <li><NavLink to="/sticky" className={activeClass}>Sticky Wall</NavLink></li>
          </ul>
        </div>

        <div className="section">
          <h4 className="section-title">LISTS</h4>
          <ul className="lists">
            {lists.map((list, i) => (
              <li key={i} className="list-item" onClick={() => navigate(`/lists/${encodeURIComponent(list)}`)}>
                <span className="dot dot-blue" /> {list}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="muted-badge">{listCounts[list] || 0}</span>
                  <button
                    className="mini-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeList(list);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            <li className="add-list" onClick={addList}>+ Add New List</li>
          </ul>
        </div>

        <div className="section tags">
          <h4 className="section-title">TAGS</h4>
          <div className="tag-row">
            <button className="tag">Tag 1</button>
            <button className="tag tag-outline">Tag 2</button>
            <button className="tag add">+ Add Tag</button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sb-item">
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : ''}>
              ⚙️ Settings
            </NavLink>
          </div>
          <div className="sb-item">Sign out</div>
        </div>
      </div>
    </aside>
  );
}
