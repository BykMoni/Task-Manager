// client/src/components/TaskCard.js
import React from 'react';

export default function TaskCard({ title, tasks = [], onToggle, onDelete, onEdit, onOpen }) {
  return (
    <div className="task-card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>

      <div className="card-body">
        {(!tasks || tasks.length === 0) ? (
          <div className="empty">No tasks</div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => {
              const id = task._id || task.id;
              return (
                <li key={id} className={`task-row ${task.completed ? 'done' : ''} ${task._justCreated ? 'new' : ''}`}>
                  <div
                    className="task-left"
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <input
                      type="checkbox"
                      checked={!!task.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (onToggle) onToggle(id);
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', cursor: onOpen ? 'pointer' : 'default' }}>
                      <div
                        className="task-title"
                        onClick={() => onOpen ? onOpen(id) : null}
                        title={task.title}
                      >
                        {task.title}
                      </div>

                      <div className="task-meta small-muted">
                        {task.list ? `${task.list} · ` : ''}
                        {task.startDate ? new Date(task.startDate).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>

                  <div className="task-right">
                    <button
                      className="mini-btn"
                      onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(id, prompt('Edit title', task.title) || task.title); }}
                    >
                      Edit
                    </button>

                    <button
                      className="mini-btn"
                      onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(id); }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
