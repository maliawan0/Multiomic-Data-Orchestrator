import axios from 'axios';

// Get API base URL from environment variable (required in production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL environment variable is not set');
  throw new Error('VITE_API_BASE_URL environment variable is required');
}

// Ensure it always ends with /api/v1
let baseURL = API_BASE_URL;
if (!baseURL.endsWith('/api/v1')) {
  // If base URL doesn't end with /api/v1, append it
  baseURL = baseURL.replace(/\/+$/, '') + '/api/v1';
}

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mdo-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (userData: { email: string; name: string; password: string }) => {
  const response = await api.post('/auth/signup', userData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { access_token } = response.data;
  localStorage.setItem('mdo-token', access_token);
  return access_token;
};

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { access_token } = response.data;
  localStorage.setItem('mdo-token', access_token);
  return access_token;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if logout API call fails, we should still clear local storage
    console.error('Logout API call failed:', error);
  }
  // Always clear local storage regardless of API call result
  localStorage.removeItem('mdo-token');
  localStorage.removeItem('mdo-user');
};

export const getMappings = async () => {
  const response = await api.get('/mappings');
  return response.data;
};

export const saveMapping = async (mapping: { name: string, mappings: any[] }) => {
  const response = await api.post('/mappings', mapping);
  return response.data;
};

export const deleteMapping = async (id: string) => {
  await api.delete(`/mappings/${id}`);
};

export const startRun = async (files: File[], mapping: any) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('mapping', JSON.stringify(mapping));
  
  const response = await api.post('/runs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getRuns = async () => {
  const response = await api.get('/runs');
  return response.data;
};

export const getRun = async (runId: string) => {
  const response = await api.get(`/runs/${runId}`);
  return response.data;
};

export default api;