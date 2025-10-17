import React, { useState } from 'react';

function Chevron() {
  return (
    <svg className="chev" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function fmtDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    // Example: "18 Oct 2025 · 14:30"
    const day = d.getDate();
    const month = d.toLocaleString(undefined, { month: 'short' });
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} · ${hh}:${mm}`;
  } catch {
    return null;
  }
}

export default function TaskItem({ task, onToggle = () => {}, onDelete = () => {}, onEdit = () => {} }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title || '');

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onEdit(task._id || task.id, trimmed);
    setEditing(false);
  };

  const startStr = fmtDate(task.startDate);
  const dueStr = fmtDate(task.expectedCompletion);

  return (
    <li className={`task-row ${task.completed ? 'done' : ''}`}>
      <div style={{display:'flex', flexDirection:'column', gap:6, width:'100%'}}>
        <label className="task-left" style={{alignItems:'flex-start', gap:10}}>
          <input type="checkbox" checked={!!task.completed} onChange={onToggle} />
          <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
            {editing ? (
              <input
                className="task-edit-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                autoFocus
              />
            ) : (
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
                <span className="task-title" onDoubleClick={() => setEditing(true)}>{task.title}</span>
              </div>
            )}

            {/* date meta lines */}
            <div style={{display:'flex', gap:10, alignItems:'center', marginTop:6}}>
              {startStr && <div className="date-badge">Starts: <span className="date-text">{startStr}</span></div>}
              {dueStr && <div className="date-badge due">Due: <span className="date-text">{dueStr}</span></div>}
              {/* show bucket lightly */}
              {task.bucket && <div className="task-meta" style={{marginLeft:'auto'}}>{task.bucket}</div>}
            </div>
          </div>
        </label>
      </div>

      <div className="task-right">
        <button className="mini-btn" onClick={onDelete}>Delete</button>
        <Chevron />
      </div>
    </li>
  );
}
