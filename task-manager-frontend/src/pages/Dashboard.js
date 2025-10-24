// client/src/pages/Dashboard.js
import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { useTasks } from '../contexts/TasksContext';
import { useNavigate } from 'react-router-dom';

function isInProgress(task) {
  if (!task) return false;
  if (task.completed) return false;
  if (!task.startDate) return true;
  const start = new Date(task.startDate);
  return start <= new Date();
}

function isUpcoming(task) {
  if (!task) return false;
  if (task.completed) return false;
  if (!task.startDate) return true;
  const start = new Date(task.startDate);
  return start > new Date();
}

export default function Dashboard() {
  const { allTasks = [], addTask, toggleTask, deleteTask, updateTask, counts = {}, setSelectedList } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const inProgress = useMemo(() => {
    return allTasks.filter(isInProgress)
      .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [allTasks]);

  const upcoming = useMemo(() => {
    return allTasks.filter(isUpcoming)
      .sort((a, b) => new Date(a.startDate || Infinity) - new Date(b.startDate || Infinity));
  }, [allTasks]);

  const thisWeek = useMemo(() => {
    return allTasks.filter(t => (t.bucket || 'week') === 'week')
      .sort((a,b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [allTasks]);

  const handleToggle = async (id) => {
    try { await toggleTask(id); } catch (err) { console.error('toggle error', err); }
  };
  const handleDelete = async (id) => {
    try { await deleteTask(id); } catch (err) { console.error('delete error', err); }
  };
  const handleEdit = async (id, newTitle) => {
    try { await updateTask(id, { title: newTitle }); } catch (err) { console.error('edit error', err); }
  };

  return (
    <div className="dashboard" style={{ padding: 18 }}>
      <Header title="Upcoming" count={counts.total || 0} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 12 }}>
        <button className="btn-add" onClick={() => setShowModal(true)}>+ Add New Task</button>
      </div>

      <div className="grid">
        <div className="col-left">
          <TaskCard
            title="In Progress"
            tasks={inProgress}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onOpen={(id) => navigate(`/tasks/${encodeURIComponent(id)}`)}
          />

          <TaskCard
            title="Upcoming"
            tasks={upcoming}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onOpen={(id) => navigate(`/tasks/${encodeURIComponent(id)}`)}
          />
        </div>

        <div className="col-right">
          <TaskCard
            title="This Week"
            tasks={thisWeek}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onOpen={(id) => navigate(`/tasks/${encodeURIComponent(id)}`)}
          />
        </div>
      </div>

      <AddTaskModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={async (payload) => {
          try {
            // eslint-disable-next-line no-unused-vars
            const created = await addTask(payload);
            if (payload.list) {
              setSelectedList(payload.list);
              navigate(`/lists/${encodeURIComponent(payload.list)}`);
            }
          } catch (err) {
            console.error('Add task failed', err);
          } finally {
            setShowModal(false);
          }
        }}
      />
    </div>
  );
}
