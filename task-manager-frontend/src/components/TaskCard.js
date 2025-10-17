import React from 'react';
import TaskItem from './TaskItem';

export default function TaskCard({ title, tasks = [], onToggle, onDelete, onEdit }) {
  return (
    <section className="task-card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>

      <div className="card-body">
        <ul className="task-list">
          {tasks.map(t => {
            const taskId = t._id || t.id;
            return (
              <TaskItem
                key={taskId}
                task={t}
                onToggle={() => onToggle(taskId)}
                onDelete={() => onDelete(taskId)}
                onEdit={(id, newTitle) => onEdit(taskId, newTitle)}
              />
            );
          })}
          {tasks.length === 0 && <li className="empty">No tasks</li>}
        </ul>
      </div>
    </section>
  );
}
