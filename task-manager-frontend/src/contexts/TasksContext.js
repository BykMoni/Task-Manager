import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const TasksContext = createContext(null);
const STORAGE_KEY = 'tm_user_lists_v1';


function normalizeKey(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}


function toGrouped(data) {
  const empty = { today: [], tomorrow: [], week: [] };
  if (!data) return { ...empty };
  if (Array.isArray(data)) {
    const grouped = { ...empty };
    data.forEach(t => {
      const b = (t && t.bucket) ? t.bucket : 'today';
      if (!grouped[b]) grouped[b] = [];
      grouped[b].push(t);
    });
    return grouped;
  }
  
  return {
    today: Array.isArray(data.today) ? data.today : [],
    tomorrow: Array.isArray(data.tomorrow) ? data.tomorrow : [],
    week: Array.isArray(data.week) ? data.week : []
  };
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
        if (!active) return;
        const flattened = Array.isArray(data)
          ? data
          : [...(data.today || []), ...(data.tomorrow || []), ...(data.week || [])];
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

  
  const addTask = async (...args) => {
    let payload;
    if (args.length === 1 && typeof args[0] === 'object') payload = args[0];
    else {
      const [bucket, title, description = '', startDate, expectedCompletion, list] = args;
      payload = { bucket, title, description, startDate, expectedCompletion, list };
    }
    if (!payload || !payload.title) throw new Error('addTask requires title');
    payload.bucket = payload.bucket || 'today';

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
      } catch (e) { /* ignore */ }
    }

    
    setTimeout(() => {
      setAllTasks(current => current.map(t => (t._id === createdWithFlag._id ? { ...t, _justCreated: false } : t)));
    }, 1600);

    return createdWithFlag;
  };


  const findBucketForId = (id) => {
    if (!id) return null;
    const grouped = toGrouped(allTasks);
    if ((grouped.today || []).some(t => (t._id || t.id) === id)) return 'today';
    if ((grouped.tomorrow || []).some(t => (t._id || t.id) === id)) return 'tomorrow';
    if ((grouped.week || []).some(t => (t._id || t.id) === id)) return 'week';
    return null;
  };

  
  const updateTask = async (...args) => {
    let id, updates, bucket;
    if (args.length === 2) {
      [id, updates] = args;
      bucket = findBucketForId(id);
    } else {
      [bucket, id, updates] = args;
      if (!updates) throw new Error('updateTask: missing updates');
    }
    if (!id) throw new Error('updateTask requires id');
    const updated = await api.updateTask(id, updates);
    setAllTasks(prev => prev.map(t => ((t._id === id || t.id === id) ? updated : t)));

  
    const name = (updated && updated.list) || (updates && updates.list);
    if (name) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const norm = normalizeKey(name);
        if (name && !arr.some(x => normalizeKey(x) === norm)) {
          arr.unshift(name);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        }
      } catch (e) {}
    }
    return updated;
  };

  
  const toggleTask = async (...args) => {
    let id, bucket;
    if (args.length === 1) {
      id = args[0];
      bucket = findBucketForId(id);
    } else {
      [bucket, id] = args;
    }
    if (!id) throw new Error('toggleTask requires id');
    const current = allTasks.find(t => (t._id === id || t.id === id));
    if (!current) {
      
      console.warn('toggleTask: local not found, will attempt server update');
      const updated = await api.updateTask(id, { completed: true });
      setAllTasks(prev => prev.map(t => ((t._id === id || t.id === id) ? updated : t)));
      return updated;
    }
    const updated = await api.updateTask(id, { completed: !current.completed });
    setAllTasks(prev => prev.map(t => ((t._id === id || t.id === id) ? updated : t)));
    return updated;
  };

  
  const deleteTask = async (...args) => {
    let id;
    if (args.length === 1) id = args[0];
    else id = args[1];
    if (!id) throw new Error('deleteTask requires id');
    await api.deleteTask(id);
    setAllTasks(prev => prev.filter(t => !(t._id === id || t.id === id)));
  };

  
  const tasksGrouped = useMemo(() => toGrouped(allTasks), [allTasks]);

  const counts = useMemo(() => {
    const today = (tasksGrouped.today || []).length;
    const tomorrow = (tasksGrouped.tomorrow || []).length;
    const week = (tasksGrouped.week || []).length;
    return { today, tomorrow, week, total: today + tomorrow + week };
  }, [tasksGrouped]);

  
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
    const extras = Object.keys(listCounts).filter(k => !storedNorm.has(k)).map(k => {
      return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });
    return [...stored, ...extras];
  }, [listCounts]);

  const filteredTasksByName = useMemo(() => {
    if (!selectedList) return allTasks;
    const targetNorm = normalizeKey(selectedList);
    return allTasks.filter(t => normalizeKey(t.list) === targetNorm);
  }, [allTasks, selectedList]);


  const fetchAllTasks = async () => {
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
  };

  return (
    <TasksContext.Provider value={{
      tasks: tasksGrouped,     
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
      fetchAllTasks,
      findBucketForId,
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
