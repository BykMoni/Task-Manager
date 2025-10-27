// client/src/components/Sidebar.js
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';

const STORAGE_KEY = 'tm_user_lists_v1';

function normalizeKey(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}
function humanize(s) {
  if (!s) return '';
  return String(s)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* Small inline SVG icons */
const IconKebab = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
  </svg>
);
const IconPencil = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M3 21l3-1 11-11 1-3-3 1L4 20z" />
  </svg>
);
const IconTrash = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M3 6h18M8 6v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6M10 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function Sidebar() {
  const {
    counts = {},
    availableLists = [],
    listCounts = {},
    allTasks = [],
    setSelectedList,
    updateTask,
    fetchAllTasks
  } = useTasks();

  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menusRef = useRef({});

  useEffect(() => {
    const onDoc = (e) => {
      // if click outside any open menu, close it
      if (!openMenuIndex && openMenuIndex !== 0) return;
      const menuEl = menusRef.current[openMenuIndex];
      if (menuEl && !menuEl.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenuIndex]);

  const goToList = (label) => {
    if (!label) return;
    setSelectedList(label);
    navigate(`/lists/${encodeURIComponent(label)}`);
  };

  const persistLists = (arr) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('persistLists error', e);
    }
  };

  const addListHandler = () => {
    const raw = prompt('Enter new list name:');
    if (!raw) return;
    const clean = raw.trim();
    if (!clean) return;

    const storedRaw = localStorage.getItem(STORAGE_KEY);
    const arr = storedRaw ? JSON.parse(storedRaw) : [];
    const norm = normalizeKey(clean);
    if (!arr.some(x => normalizeKey(x) === norm)) {
      arr.unshift(clean);
      persistLists(arr);
    }
    goToList(clean);
  };

  const removeList = (label) => {
    if (!label) return;
    if (!window.confirm(`Remove list "${label}" from your lists? Tasks remain unchanged.`)) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter(x => normalizeKey(x) !== normalizeKey(label));
      persistLists(next);
    } catch (err) {
      console.warn('remove list fail', err);
    }
    setSelectedList(null);
    navigate('/');
    // refresh to be safe
    fetchAllTasks().catch(() => {});
  };

  const renameList = async (label) => {
    if (!label) return;
    const raw = prompt('Rename list', label);
    if (!raw) return;
    const nextName = raw.trim();
    if (!nextName || normalizeKey(nextName) === normalizeKey(label)) return;

    // replace in localStorage lists
    try {
      const storedRaw = localStorage.getItem(STORAGE_KEY);
      const arr = storedRaw ? JSON.parse(storedRaw) : [];
      const replaced = arr.map(x => (normalizeKey(x) === normalizeKey(label) ? nextName : x));
      if (!replaced.some(x => normalizeKey(x) === normalizeKey(nextName))) replaced.unshift(nextName);
      persistLists([...new Set(replaced)]);
    } catch (err) {
      console.warn('rename list persist error', err);
    }

    // update tasks on server that match this list (case-insensitive)
    const targetNorm = normalizeKey(label);
    const tasksToUpdate = allTasks.filter(t => normalizeKey(t.list) === targetNorm);

    for (const t of tasksToUpdate) {
      try {
        // updateTask(id, updates) as provided by TasksContext
        // must await to keep server updates predictable
        // eslint-disable-next-line no-await-in-loop
        await updateTask(t._id || t.id, { list: nextName });
      } catch (err) {
        console.warn('rename list: failed to update task', t._id || t.id, err);
      }
    }

    setSelectedList(nextName);
    navigate(`/lists/${encodeURIComponent(nextName)}`);
    fetchAllTasks().catch(() => {});
  };

  const countFor = (label) => listCounts[normalizeKey(label)] || 0;

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="sidebar-inner">
        <div className="menu-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Tasks</h3>
        </div>

        <div className="search" style={{ marginTop: 12 }}>
          <input placeholder="Search" aria-label="Search tasks" />
        </div>

        <div className="section" style={{ marginTop: 16 }}>
          <h4 className="section-title">OVERVIEW</h4>
          <ul className="nav-list" style={{ marginBottom: 8 }}>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span>Upcoming</span>
                <span className="badge">{counts.total ?? 0}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/today" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span>Today</span>
                <span className="muted-badge">{counts.today ?? 0}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span>Calendar</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/sticky" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span>Sticky Wall</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="section" style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="section-title">LISTS</h4>
            <button className="mini-btn" onClick={addListHandler} title="Add list" aria-label="Add list">+ New</button>
          </div>

          <ul className="lists" style={{ marginTop: 8 }}>
            {availableLists.length === 0 && <div className="empty" style={{ padding: 8 }}>No lists — add one.</div>}

            {availableLists.map((label, i) => {
              const display = String(label).trim();
              // const key = normalizeKey(display);
              const count = countFor(display);

              return (
                <li
                  key={i}
                  className="list-item"
                  style={{ cursor: 'pointer', alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}
                >
                  <div
                    onClick={() => goToList(display)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') goToList(display); }}
                  >
                    <span className="dot dot-blue" aria-hidden />
                    <span style={{ fontWeight: 600 }}>{humanize(display)}</span>
                    {count > 0 && <span className="task-meta" style={{ marginLeft: 8 }}>{count}</span>}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button
                      className="mini-btn"
                      aria-haspopup="true"
                      aria-expanded={openMenuIndex === i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(prev => (prev === i ? null : i));
                      }}
                      title="More actions"
                    >
                      <IconKebab />
                    </button>

                    {openMenuIndex === i && (
                      <div
                        ref={(el) => { menusRef.current[i] = el; }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 32,
                          background: 'var(--panel)',
                          border: '1px solid var(--card-border)',
                          boxShadow: '0 8px 24px rgba(6,10,14,0.12)',
                          borderRadius: 8,
                          zIndex: 1200,
                          padding: 6,
                          minWidth: 140
                        }}
                        role="menu"
                      >
                        <button
                          className="mini-btn"
                          style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-start' }}
                          onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(null); renameList(display); }}
                        >
                          <IconPencil /> Rename
                        </button>
                        <button
                          className="mini-btn"
                          style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-start', marginTop: 6 }}
                          onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(null); removeList(display); }}
                        >
                          <IconTrash /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="section tags" style={{ marginTop: 16 }}>
          <h4 className="section-title">TAGS</h4>
          <div className="tag-row" style={{ marginTop: 8 }}>
            <button className="tag">Personal</button>
            <button className="tag tag-outline">Urgent</button>
            <button className="tag add">+ Add Tag</button>
          </div>
        </div>

        <div className="sidebar-bottom" style={{ marginTop: 18 }}>
          <div className="sb-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
