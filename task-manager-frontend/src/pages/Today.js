import React from 'react';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../contexts/TasksContext';

export default function Today() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask, counts } = useTasks();

  return (
    <div className="dashboard">
      <Header title="Today" count={counts.today} />
      <div className="grid">
        <div className="col-left">
          <TaskCard
            title="Today"
            tasks={tasks.today}
            onCreate={(txt) => addTask('today', txt)}
            onToggle={(id) => toggleTask('today', id)}
            onDelete={(id) => deleteTask('today', id)}
            onEdit={(id, newTitle) => updateTask('today', id, { title: newTitle })}
          />
        </div>
        <div className="col-right">
          <div className="task-card">
            <h3>Quick Info</h3>
            <p style={{ marginTop: 12 }}>Tasks for the day. Use the left panel to navigate between pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
