// client/src/contexts/TasksContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const TasksContext = createContext(null);
const STORAGE_KEY = 'tm_user_lists_v1';

function normalizeKey(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

export function TasksProvider({ children }) {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getTasks();
        const flattened = Array.isArray(data)
          ? data
          : [...(data.today || []), ...(data.tomorrow || []), ...(data.week || [])];
        if (!active) return;
        setAllTasks(flattened);
        persistListsFromTasks(flattened);
      } catch (err) {
        console.error('fetch tasks error', err);
        if (active) setError('Failed to load tasks');
        setAllTasks([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  function persistListsFromTasks(tasks) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const existingNorm = new Set(arr.map(a => normalizeKey(a)));
      const toPrepend = [];
      tasks.forEach(t => {
        if (!t?.list) return;
        const name = String(t.list).trim();
        const norm = normalizeKey(name);
        if (!existingNorm.has(norm)) {
          existingNorm.add(norm);
          toPrepend.push(name);
        }
      });
      if (toPrepend.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...toPrepend, ...arr]));
      }
    } catch (e) {
      console.warn('persistListsFromTasks error', e);
    }
  }

  const addTask = async (payload) => {
    try {
      const created = await api.createTask(payload);
      const createdWithFlag = { ...created, _justCreated: true };
      setAllTasks(prev => [createdWithFlag, ...prev]);

      if (created.list) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const arr = raw ? JSON.parse(raw) : [];
          const name = String(created.list).trim();
          const norm = normalizeKey(name);
          if (name && !arr.some(x => normalizeKey(x) === norm)) {
            arr.unshift(name);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
          }
        } catch (e) { console.warn('persist list error', e); }
      }

      setTimeout(() => {
        setAllTasks(current => current.map(t => (t._id === createdWithFlag._id ? { ...t, _justCreated: false } : t)));
      }, 1600);

      return createdWithFlag;
    } catch (err) {
      console.error('addTask error', err);
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updated = await api.updateTask(id, updates);
      setAllTasks(prev => prev.map(t => ((t._id === id || t.id === id) ? updated : t)));

      if (updated.list) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const arr = raw ? JSON.parse(raw) : [];
          const name = String(updated.list).trim();
          const norm = normalizeKey(name);
          if (name && !arr.some(x => normalizeKey(x) === norm)) {
            arr.unshift(name);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
          }
        } catch (e) {}
      }

      return updated;
    } catch (err) {
      console.error('updateTask error', err);
      throw err;
    }
  };

  const toggleTask = async (id) => {
    const current = allTasks.find(t => (t._id === id || t.id === id));
    if (!current) {
      console.warn('toggleTask: not found', id);
      throw new Error('Task not found');
    }
    try {
      const updated = await api.updateTask(id, { completed: !current.completed });
      setAllTasks(prev => prev.map(t => ((t._id === id || t.id === id) ? updated : t)));
      return updated;
    } catch (err) {
      console.error('toggleTask error', err);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setAllTasks(prev => prev.filter(t => !(t._id === id || t.id === id)));
    } catch (err) {
      console.error('deleteTask error', err);
      throw err;
    }
  };

  const counts = useMemo(() => {
    const today = allTasks.filter(t => (t.bucket || 'today') === 'today').length;
    const tomorrow = allTasks.filter(t => (t.bucket || '') === 'tomorrow').length;
    const week = allTasks.filter(t => (t.bucket || '') === 'week').length;
    return { today, tomorrow, week, total: today + tomorrow + week };
  }, [allTasks]);

  const listCounts = useMemo(() => {
    return allTasks.reduce((map, t) => {
      const key = normalizeKey(t.list);
      if (!key) return map;
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
  }, [allTasks]);

  const availableLists = useMemo(() => {
    const stored = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    })();
    const storedNorm = new Set(stored.map(s => normalizeKey(s)));
    const extra = Object.keys(listCounts).filter(k => !storedNorm.has(k)).map(k => {
      return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });
    return [...stored, ...extra];
  }, [listCounts]);

  const filteredTasksByName = useMemo(() => {
    if (!selectedList) return allTasks;
    const targetNorm = normalizeKey(selectedList);
    return allTasks.filter(t => normalizeKey(t.list) === targetNorm);
  }, [allTasks, selectedList]);

  return (
    <TasksContext.Provider value={{
      allTasks,
      filteredTasksByName,
      selectedList,
      setSelectedList,
      availableLists,
      listCounts,
      counts,
      loading,
      error,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      fetchAllTasks: async () => {
        setLoading(true);
        try {
          const data = await api.getTasks();
          const flattened = Array.isArray(data)
            ? data
            : [...(data.today || []), ...(data.tomorrow || []), ...(data.week || [])];
          setAllTasks(flattened);
          persistListsFromTasks(flattened);
        } catch (e) {
          console.error('fetchAllTasks error', e);
        } finally {
          setLoading(false);
        }
      }
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
