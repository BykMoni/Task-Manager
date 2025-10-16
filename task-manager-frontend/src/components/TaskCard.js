import React from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

export default function TaskCard({ title, tasks = [], onCreate, onToggle, onDelete, onEdit }) {
  return (
    <section className="task-card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>

      <div className="card-body">
        <TaskForm onCreate={onCreate} placeholder={`Add New Task`} />
        <ul className="task-list">
          {tasks.map(t => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={() => onToggle(t.id)}
              onDelete={() => onDelete(t.id)}
              onEdit={(id, newTitle) => onEdit(id, newTitle)}
            />
          ))}
          {tasks.length === 0 && <li className="empty">No tasks</li>}
        </ul>
      </div>
    </section>
  );
}
