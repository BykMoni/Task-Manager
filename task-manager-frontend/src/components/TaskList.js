import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks = [], onDelete, onEdit, onToggleCompleted }) {
  if (!tasks || tasks.length === 0) return <p style={{ color: 'var(--muted)' }}>No tasks yet.</p>;

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleCompleted={onToggleCompleted}
        />
      ))}
    </div>
  );
}
