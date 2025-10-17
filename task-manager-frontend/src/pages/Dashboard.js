import React, { useState } from 'react';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { useTasks } from '../contexts/TasksContext';

function isInProgress(task) {
  if (task.completed) return false;
  if (!task.startDate) return true; 
  const start = new Date(task.startDate);
  return start <= new Date();
}

function isUpcoming(task) {
  if (task.completed) return false;
  if (!task.startDate) return true;
  const start = new Date(task.startDate);
  return start > new Date();
}

export default function Dashboard() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask, counts } = useTasks();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async ({ bucket, title, description, expected, startDate, expectedCompletion }) => {
    await addTask(bucket, title, description || '', undefined);
    await addTask(bucket, title, description, startDate ? startDate : undefined, expectedCompletion ? expectedCompletion : undefined);
  };

  const allTasks = [...(tasks.today || []), ...(tasks.tomorrow || []), ...(tasks.week || [])];

  const inProgress = allTasks.filter(isInProgress).sort((a,b)=> new Date(a.startDate||0) - new Date(b.startDate||0));
  const upcoming = allTasks.filter(isUpcoming).sort((a,b)=> new Date(a.startDate||Infinity) - new Date(b.startDate||Infinity));

  const findBucket = (id) => {
    const lists = { today: tasks.today || [], tomorrow: tasks.tomorrow || [], week: tasks.week || [] };
    for (const k of Object.keys(lists)) {
      if (lists[k].some(t => (t._id === id || t.id === id))) return k;
    }
    return 'today';
  };

  const handleToggle = async (id) => {
    const b = findBucket(id);
    await toggleTask(b, id);
  };

  const handleDelete = async (id) => {
    const b = findBucket(id);
    await deleteTask(b, id);
  };

  const handleEdit = async (id, newTitle) => {
    const b = findBucket(id);
    await updateTask(b, id, { title: newTitle });
  };

  return (
    <div className="dashboard">
      <Header title="Upcoming" count={counts.total} />
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
          />

          <TaskCard
            title="Upcoming"
            tasks={upcoming}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>

        <div className="col-right">
          <TaskCard
            title="This Week"
            tasks={tasks.week || []}
            onToggle={(id)=> { const b='week'; toggleTask(b,id); }}
            onDelete={(id)=> { const b='week'; deleteTask(b,id); }}
            onEdit={(id,newTitle)=> { const b='week'; updateTask(b,id,{title:newTitle}); }}
          />
        </div>
      </div>

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} onConfirm={async (payload) => {
        await addTask(payload.bucket, payload.title, payload.description || '', payload.startDate, payload.expectedCompletion);
        setShowModal(false);
      }} />
    </div>
  );
}
