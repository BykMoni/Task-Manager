// client/src/pages/TaskDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useTasks } from '../contexts/TasksContext';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, toggleTask, deleteTask } = useTasks();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // try to find locally first; else fetch grouped tasks and find
  useEffect(() => {
    const findLocal = () => {
      const all = [...(tasks.today || []), ...(tasks.tomorrow || []), ...(tasks.week || [])];
      return all.find(t => (t._id === id || t.id === id));
    };
    const tLocal = findLocal();
    if (tLocal) {
      setTask(tLocal);
      setLoading(false);
      return;
    }
    // fallback: fetch from server
    (async () => {
      try {
        // our api.getTasks returns grouped lists
        const fetched = await api.getTasks();
        const all = [...(fetched.today || []), ...(fetched.tomorrow || []), ...(fetched.week || [])];
        const t = all.find(x => x._id === id || x.id === id);
        setTask(t || null);
      } catch (err) {
        console.error('Failed to fetch task', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tasks]);

  const findBucket = () => {
    if ((tasks.today || []).some(t => (t._id || t.id) === id)) return 'today';
    if ((tasks.tomorrow || []).some(t => (t._id || t.id) === id)) return 'tomorrow';
    return 'week';
  };

  const handleToggle = async () => {
    const bucket = findBucket();
    await toggleTask(bucket, id);
    // update local view (context will re-sync)
    const updated = (tasks[bucket] || []).find(t => (t._id || t.id) === id);
    setTask(updated || (task ? { ...task, completed: !task.completed } : task));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    const bucket = findBucket();
    await deleteTask(bucket, id);
    navigate(-1);
  };

  const handleEditTitle = async () => {
    const newTitle = prompt('Edit task title', task?.title || '');
    if (!newTitle) return;
    const bucket = findBucket();
    const updated = await updateTask(bucket, id, { title: newTitle });
    setTask(updated);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!task) return <div style={{ padding: 20 }}>Task not found</div>;

  return (
    <div style={{ padding: 18 }}>
      <Header title="Task details" />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate(-1)} className="mini-btn">Back</button>
      </div>

      <div style={{ marginTop: 18, maxWidth: 780 }}>
        <h2>{task.title}</h2>

        <div style={{ marginTop: 8, color: '#6b7280' }}>
          {task.list ? <span style={{ marginRight: 12 }}>List: <strong>{task.list}</strong></span> : null}
          {task.bucket ? <span style={{ marginRight: 12 }}>Bucket: <strong>{task.bucket}</strong></span> : null}
          {task.startDate ? <span style={{ marginRight: 12 }}>Start: {new Date(task.startDate).toLocaleString()}</span> : null}
          {task.expectedCompletion ? <span>Expected: {new Date(task.expectedCompletion).toLocaleString()}</span> : null}
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{task.description || <em>No description</em>}</div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <button className="mini-btn" onClick={handleToggle}>{task.completed ? 'Mark incomplete' : 'Mark complete'}</button>
          <button className="mini-btn" onClick={handleEditTitle}>Edit</button>
          <button className="mini-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
