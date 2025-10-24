// client/src/pages/Today.js
import React, { useMemo } from 'react';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../contexts/TasksContext';
import { useNavigate } from 'react-router-dom';

export default function Today() {
  const { allTasks = [], counts = {}, toggleTask, deleteTask, updateTask } = useTasks();
  const navigate = useNavigate();

  // filter today's tasks (bucket === 'today')
  const todays = useMemo(() => {
    return allTasks.filter(t => (t.bucket || 'today') === 'today')
      .sort((a,b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [allTasks]);

  const handleToggle = async (id) => {
    try { await toggleTask(id); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await deleteTask(id); } catch (err) { console.error(err); }
  };

  const handleEdit = async (id, newTitle) => {
    try { await updateTask(id, { title: newTitle }); } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: 18 }}>
      <Header title="Today" count={counts.today || 0} />

      <div style={{ marginTop: 18 }}>
        <TaskCard
          title="Today"
          tasks={todays}
          onToggle={handleToggle}
          onDelete={(id) => handleDelete(id)}
          onEdit={(id, newTitle) => handleEdit(id, newTitle)}
          onOpen={(id) => navigate(`/tasks/${encodeURIComponent(id)}`)}
        />
      </div>
    </div>
  );
}
