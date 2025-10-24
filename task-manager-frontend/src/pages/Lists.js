// client/src/pages/ListsPage.js
import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../contexts/TasksContext';

function normalize(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

export default function ListsPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { allTasks = [], setSelectedList, toggleTask, updateTask, deleteTask } = useTasks();

  const targetRaw = name ? decodeURIComponent(name) : null;
  useEffect(() => {
    if (targetRaw) setSelectedList(targetRaw);
  }, [targetRaw, setSelectedList]);

  const targetNorm = targetRaw ? normalize(targetRaw) : null;

  const filtered = useMemo(() => {
    if (!targetNorm) return allTasks;
    return allTasks.filter(t => normalize(t.list) === targetNorm);
  }, [allTasks, targetNorm]);

  const handleToggle = async (id) => { await toggleTask(id); };
  const handleDelete = async (id) => { await deleteTask(id); };
  const handleEdit = async (id, newTitle) => { await updateTask(id, { title: newTitle }); };

  return (
    <div style={{ padding: 18 }}>
      <Header title={targetRaw ? `List: ${targetRaw}` : 'All Tasks'} />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate(-1)} className="mini-btn">Back</button>
      </div>

      <div style={{ marginTop: 18 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{targetRaw ? `No tasks found for "${targetRaw}"` : 'No tasks found'}</div>
            <div style={{ color: '#6b7280' }}>
              Quick checks:
              <ul>
                <li>Check that the task's <code>list</code> field equals the list name (case-insensitive).</li>
                <li>Check localStorage lists: <code>JSON.parse(localStorage.getItem('tm_user_lists_v1')||'[]')</code></li>
              </ul>
            </div>
          </div>
        ) : (
          <TaskCard
            title={targetRaw ? `Tasks in ${targetRaw}` : 'All tasks'}
            tasks={filtered}
            onToggle={handleToggle}
            onDelete={(id) => handleDelete(id)}
            onEdit={(id,newTitle) => handleEdit(id,newTitle)}
            onOpen={(id) => navigate(`/tasks/${encodeURIComponent(id)}`)}
          />
        )}
      </div>
    </div>
  );
}
