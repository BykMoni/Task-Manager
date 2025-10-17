// client/src/services/api.js

const API_BASE = process.env.REACT_APP_API_BASE || '/api/tasks'; // works with CRA proxy

async function handleResp(resp) {
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    const msg = body.message || resp.statusText || 'API error';
    const err = new Error(msg);
    err.status = resp.status;
    throw err;
  }
  if (resp.status === 204) return null;
  return resp.json();
}

export default {
  // GET all tasks (grouped)
  getTasks: async () => {
    const res = await fetch(API_BASE);
    return handleResp(res);
  },

  // POST create task
  createTask: async ({ title, description = '', bucket = 'today' }) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, bucket })
    });
    return handleResp(res);
  },

  // PUT update task
  updateTask: async (id, updates) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResp(res);
  },

  // DELETE task
  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return handleResp(res);
  }
};
