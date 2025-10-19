// client/src/pages/ListsPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../contexts/TasksContext';

export default function ListsPage() {
  const { name } = useParams(); // route param: list name
  const navigate = useNavigate();
  const { tasks, toggleTask, updateTask, deleteTask } = useTasks();

  const allTasks = [...(tasks.today || []), ...(tasks.tomorrow || []), ...(tasks.week || [])];
  const filtered = name ? allTasks.filter(t => t.list === name) : allTasks;

  const findBucketForId = (id) => {
    if ((tasks.today || []).some(t => t._id === id)) return 'today';
    if ((tasks.tomorrow || []).some(t => t._id === id)) return 'tomorrow';
    return 'week';
  };

  const handleToggle = async (id) => {
    const b = findBucketForId(id);
    await toggleTask(b, id);
  };

  return (
    <div style={{ padding: 18 }}>
      <Header title={name ? `List: ${name}` : 'All Tasks'} />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate(-1)} className="mini-btn">Back</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <TaskCard
          title={name ? `Tasks in ${name}` : 'All tasks'}
          tasks={filtered}
          onToggle={handleToggle}
          onDelete={(id)=> { const b = findBucketForId(id); deleteTask(b, id); }}
          onEdit={(id,newTitle)=> { const b = findBucketForId(id); updateTask(b, id, { title: newTitle }); }}
        />
      </div>
    </div>
  );
}
