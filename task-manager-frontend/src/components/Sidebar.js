// client/src/components/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';

function normalizeKey(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

export default function Sidebar() {
  const { counts = {}, availableLists = [], listCounts = {}, setSelectedList } = useTasks();
  const navigate = useNavigate();

  const goToList = (label) => {
    if (!label) return;
    setSelectedList(label);
    navigate(`/lists/${encodeURIComponent(label)}`);
  };

  const addListHandler = () => {
    const name = prompt('Enter new list name:');
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    try {
      const raw = localStorage.getItem('tm_user_lists_v1');
      const arr = raw ? JSON.parse(raw) : [];
      const norm = normalizeKey(clean);
      if (!arr.some(x => normalizeKey(x) === norm)) {
        arr.unshift(clean);
        localStorage.setItem('tm_user_lists_v1', JSON.stringify(arr));
      }
    } catch (e) {
      console.warn('save list fail', e);
    }
    setSelectedList(clean);
    navigate(`/lists/${encodeURIComponent(clean)}`);
  };

  const removeList = (label, e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove list "${label}"? This only removes it from your lists, tasks remain unchanged.`)) return;
    try {
      const raw = localStorage.getItem('tm_user_lists_v1');
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter(x => normalizeKey(x) !== normalizeKey(label));
      localStorage.setItem('tm_user_lists_v1', JSON.stringify(next));
    } catch (err) {
      console.warn('remove list fail', err);
    }
    setSelectedList(null);
    navigate('/');
  };

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
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Upcoming <span className="badge">{counts.total ?? 0}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/today" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Today <span className="muted-badge">{counts.today ?? 0}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Calendar
              </NavLink>
            </li>
            <li>
              <NavLink to="/sticky" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Sticky Wall
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="section">
          <h4 className="section-title">LISTS</h4>
          <ul className="lists">
            {availableLists.map((label, i) => {
              const key = normalizeKey(label);
              return (
                <li
                  key={i}
                  className="list-item"
                  onClick={() => goToList(label)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="dot dot-blue" /> {label}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="muted-badge">{listCounts[key] || 0}</span>
                    <button
                      className="mini-btn"
                      onClick={(e) => removeList(label, e)}
                      title="Remove list"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}

            <li className="add-list" onClick={addListHandler} style={{ cursor: 'pointer' }}>
              + Add New List
            </li>
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
