import React, { createContext, useContext, useEffect, useState } from 'react';

const TasksContext = createContext(null);
const STORAGE_KEY = 'tm_tasks_v1';

const initial = {
  today: [
    { id: 't1', title: 'Research content ideas', completed: false },
    { id: 't2', title: 'Create a database of guest authors', completed: false },
    { id: 't3', title: "Renew driver's license", completed: false },
    { id: 't4', title: 'Consult accountant', completed: false }
  ],
  tomorrow: [
    { id: 'tm1', title: 'Create job posting for SEO specialist', completed: false },
    { id: 'tm2', title: 'Request design assets for landing page', completed: false }
  ],
  week: [
    { id: 'w1', title: 'Print business card', completed: false },
    { id: 'w2', title: 'Plan content calendar', completed: false }
  ]
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    // ensure buckets exist
    return { today: parsed.today || [], tomorrow: parsed.tomorrow || [], week: parsed.week || [] };
  } catch (e) {
    console.warn('Failed to load tasks from localStorage', e);
    return initial;
  }
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  const addTask = (bucket, title) => {
    const id = Math.random().toString(36).slice(2, 9);
    setTasks(prev => ({ ...prev, [bucket]: [{ id, title, completed: false }, ...(prev[bucket] || [])] }));
  };

  const updateTask = (bucket, id, updates) => {
    setTasks(prev => ({
      ...prev,
      [bucket]: (prev[bucket] || []).map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const toggleTask = (bucket, id) => {
    setTasks(prev => ({
      ...prev,
      [bucket]: (prev[bucket] || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (bucket, id) => {
    setTasks(prev => ({ ...prev, [bucket]: (prev[bucket] || []).filter(t => t.id !== id) }));
  };

  const counts = {
    total: (tasks.today?.length || 0) + (tasks.tomorrow?.length || 0) + (tasks.week?.length || 0),
    today: tasks.today?.length || 0,
    tomorrow: tasks.tomorrow?.length || 0,
    week: tasks.week?.length || 0
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, toggleTask, deleteTask, counts }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider');
  return ctx;
}
