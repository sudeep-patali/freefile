const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('freefile_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  // Auth
  signup: (name, email, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  signin: (email, password) =>
    request('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Files
  getFiles: () => request('/files'),
  createFile: (name) => request('/files', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteFiles: (ids) => request('/files', { method: 'DELETE', body: JSON.stringify({ ids }) }),

  // Entries
  getEntries: (fileId) => request(`/files/${fileId}/entries`),
  createEntry: (fileId, content) =>
    request(`/files/${fileId}/entries`, { method: 'POST', body: JSON.stringify({ content }) }),
  updateEntry: (fileId, entryId, content) =>
    request(`/files/${fileId}/entries/${entryId}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteEntry: (fileId, entryId) =>
    request(`/files/${fileId}/entries/${entryId}`, { method: 'DELETE' }),
};
