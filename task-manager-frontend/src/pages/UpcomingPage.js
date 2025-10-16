import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function UpcomingPage({ tasks = [], loading, error, onCreate, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const q = useQuery();
  const search = q.get('q')?.toLowerCase() || '';
  const listFilter = q.get('list') || null;
  const tagFilter = q.get('tag') || null;

  // apply search/list/tag filtering client-side
  const filtered = tasks.filter((t) => {
    // sample: if lists or tags were stored on task, we'd filter by t.list or t.tags
    // for now, we filter only by title/description using search & ignore list/tag if not present
    if (search) {
      const inTitle = t.title?.toLowerCase().includes(search);
      const inDesc = t.description?.toLowerCase()?.includes(search);
      if (!(inTitle || inDesc)) return false;
    }
    // placeholder list/tag filtering (no-op if task doesn't contain these fields)
    if (listFilter && t.list !== listFilter) return false;
    if (tagFilter && (!t.tags || !t.tags.includes(tagFilter))) return false;
    return true;
  });

  // grouping (today/tomorrow/week) — simple partition for demo
  const today = filtered.filter(t => !t.completed).slice(0, 10);
  const tomorrow = filtered.filter(t => !t.completed).slice(10, 18);
  const week = filtered.filter(t => !t.completed).slice(18, 40);

  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="title">Upcoming</div>
          <div className="count-badge">{filtered.length}</div>
        </div>
      </div>

      <div className="columns">
        <section className="section panel">
          <div className="section-title">Today</div>

          <div style={{ marginTop: 12 }}>
            <div className="add-task" onClick={() => setEditing({})}>+ Add New Task</div>

            <div className="task-list">
              <TaskList tasks={today} onDelete={onDelete} onEdit={(t) => setEditing(t)} onToggleCompleted={(id, completed) => onUpdate(id, { completed })} />
            </div>
          </div>
        </section>

        <section className="section panel">
          <div className="section-title">Tomorrow</div>

          <div style={{ marginTop: 12 }}>
            <div className="add-task" onClick={() => setEditing({})}>+ Add New Task</div>

            <div className="task-list">
              <TaskList tasks={tomorrow} onDelete={onDelete} onEdit={(t) => setEditing(t)} onToggleCompleted={(id, completed) => onUpdate(id, { completed })} />
            </div>
          </div>
        </section>

        <aside className="panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>This Week</div>

          <div style={{ marginBottom: 12 }} className="add-task" onClick={() => setEditing({})}>+ Add New Task</div>

          <div style={{ marginTop: 6 }}>
            <TaskList tasks={week} onDelete={onDelete} onEdit={(t) => setEditing(t)} onToggleCompleted={(id, completed) => onUpdate(id, { completed })} />
          </div>
        </aside>
      </div>

      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,12,14,0.35)', zIndex: 9999 }}>
          <div style={{ width: 680, maxWidth: '92%' }} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{editing._id ? 'Edit Task' : 'Add Task'}</h3>
              <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: 'none', fontSize: 18 }}>✕</button>
            </div>

            <TaskForm
              editing={editing && editing._id ? editing : null}
              onCreate={async (payload) => { await onCreate(payload); setEditing(null); }}
              onUpdate={async (id, updates) => { await onUpdate(id, updates); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </>
  );
}
