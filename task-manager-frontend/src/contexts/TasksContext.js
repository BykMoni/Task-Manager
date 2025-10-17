import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const TasksContext = createContext(null);
const empty = { today: [], tomorrow: [], week: [] };

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks from server
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getTasks();
        if (!active) return;
        setTasks({
          today: data.today || [],
          tomorrow: data.tomorrow || [],
          week: data.week || []
        });
      } catch (err) {
        console.error('Fetch error:', err);
        if (active) setError('Failed to load tasks');
        setTasks(empty);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const findById = (bucket, id) => {
    const arr = tasks[bucket] || [];
    return arr.find(t => t._id === id || t.id === id);
  };

 // inside TasksContext: replace addTask function with this version
const addTask = async (bucket, title, description = '', startDate = undefined, expectedCompletion = undefined) => {
  const payload = { title, description, bucket };
  if (startDate) payload.startDate = startDate;
  if (expectedCompletion) payload.expectedCompletion = expectedCompletion;
  const created = await api.createTask(payload);
  setTasks(prev => ({ ...prev, [bucket]: [created, ...(prev[bucket] || [])] }));
  return created;
};


  const toggleTask = async (bucket, id) => {
    const current = findById(bucket, id);
    if (!current) {
      console.warn(`toggleTask: not found bucket=${bucket} id=${id}`);
      return;
    }
    const updated = await api.updateTask(id, { completed: !current.completed });
    setTasks(prev => ({
      ...prev,
      [bucket]: (prev[bucket] || []).map(t => (t._id === id || t.id === id ? updated : t))
    }));
    return updated;
  };

  const updateTask = async (bucket, id, updates) => {
    const current = findById(bucket, id);
    if (!current) {
      console.warn(`updateTask: not found bucket=${bucket} id=${id}`);
      return;
    }
    const updated = await api.updateTask(id, updates);
    setTasks(prev => ({
      ...prev,
      [bucket]: (prev[bucket] || []).map(t => (t._id === id || t.id === id ? updated : t))
    }));
    return updated;
  };

  const deleteTask = async (bucket, id) => {
    const current = findById(bucket, id);
    if (!current) {
      console.warn(`deleteTask: not found bucket=${bucket} id=${id}`);
      return;
    }
    await api.deleteTask(id);
    setTasks(prev => ({
      ...prev,
      [bucket]: (prev[bucket] || []).filter(t => !(t._id === id || t.id === id))
    }));
  };

  const counts = {
    total: (tasks.today?.length || 0) + (tasks.tomorrow?.length || 0) + (tasks.week?.length || 0),
    today: tasks.today?.length || 0,
    tomorrow: tasks.tomorrow?.length || 0,
    week: tasks.week?.length || 0
  };

  return (
    <TasksContext.Provider value={{
      tasks, loading, error,
      addTask, updateTask, toggleTask, deleteTask, counts
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider');
  return ctx;
}
