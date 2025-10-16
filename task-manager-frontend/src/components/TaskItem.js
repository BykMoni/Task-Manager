import React, { useState } from 'react';

function Chevron() {
  return (
    <svg className="chev" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function TaskItem({ task, onToggle = () => {}, onDelete = () => {}, onEdit = () => {} }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title);

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onEdit(task.id, trimmed);
    setEditing(false);
  };

  return (
    <li className={`task-row ${task.completed ? 'done' : ''}`}>
      <label className="task-left">
        <input type="checkbox" checked={task.completed} onChange={onToggle} />
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
          <span className="task-title" onDoubleClick={() => setEditing(true)}>{task.title}</span>
        )}
      </label>
      <div className="task-right">
        <button className="mini-btn" onClick={onDelete}>Delete</button>
        <Chevron />
      </div>
    </li>
  );
}
