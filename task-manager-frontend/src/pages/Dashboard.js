import React from 'react';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../contexts/TasksContext';

export default function Dashboard() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask, counts } = useTasks();

  return (
    <div className="dashboard">
      <Header title="Upcoming" count={counts.total} />

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
          <TaskCard
            title="Tomorrow"
            tasks={tasks.tomorrow}
            onCreate={(txt) => addTask('tomorrow', txt)}
            onToggle={(id) => toggleTask('tomorrow', id)}
            onDelete={(id) => deleteTask('tomorrow', id)}
            onEdit={(id, newTitle) => updateTask('tomorrow', id, { title: newTitle })}
          />
        </div>

        <div className="col-right">
          <TaskCard
            title="This Week"
            tasks={tasks.week}
            onCreate={(txt) => addTask('week', txt)}
            onToggle={(id) => toggleTask('week', id)}
            onDelete={(id) => deleteTask('week', id)}
            onEdit={(id, newTitle) => updateTask('week', id, { title: newTitle })}
          />
        </div>
      </div>
    </div>
  );
}
