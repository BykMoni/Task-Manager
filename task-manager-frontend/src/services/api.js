// client/src/services/api.js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api/tasks';

async function handleResp(resp) {
  const text = await resp.text().catch(() => '');
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!resp.ok) {
    console.error('API error response:', resp.status, body);
    const msg = body && body.message ? body.message : (typeof body === 'string' ? body : resp.statusText || 'API error');
    const err = new Error(msg);
    err.status = resp.status;
    err.raw = body;
    throw err;
  }
  if (resp.status === 204) return null;
  return body;
}

async function request(path = '', opts = {}) {
  const url = path && path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, opts);
  return handleResp(res);
}

export async function getTasks() {
  return request('', { method: 'GET' });
}

export async function createTask(payload) {
  return request('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function updateTask(id, updates) {
  return request(`/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
}

export async function deleteTask(id) {
  return request(`/${id}`, { method: 'DELETE' });
}

// Named object assigned first to satisfy import/no-anonymous-default-export ESLint rule
const api = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};

export default api;
