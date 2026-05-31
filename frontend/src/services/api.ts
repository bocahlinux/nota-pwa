import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token interceptor
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Attach JWT token from localStorage
function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  } else {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

// Initialize token on load
const initialToken = getAccessToken();
if (initialToken) {
  api.defaults.headers.common['Authorization'] = 'Bearer ' + initialToken;
}

// ---- Response Interceptor: Auto-refresh on 401 ----
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authAPI.refreshAccessToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          processQueue(error, null);
          // All tokens expired — force logout
          setAccessToken(null);
          setRefreshToken(null);
          window.location.reload();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        setRefreshToken(null);
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// --- Types ---
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface Nota {
  id: number;
  title: string;
  content: string;
  content_type: 'plain' | 'markdown';
  status: 'draft' | 'published' | 'archived';
  author: number;
  author_username: string;
  is_pinned: boolean;
  tags: Tag[];
  attachments: Attachment[];
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  nota_count: number;
  created_at: string;
}

export interface Attachment {
  id: number;
  nota: number;
  file: string;
  filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface NotaStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  pinned: number;
  created_last_7_days: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Auth API ---
export const authAPI = {
  login: async (username: string, password: string): Promise<{ user: User; tokens: TokenPair }> => {
    const res = await api.post<TokenPair>('/auth/login/', { username, password });
    const tokens = { access: res.data.access, refresh: res.data.refresh };
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    return { user: { id: 0, username, email: '' }, tokens };
  },

  register: async (username: string, email: string, password: string, password_confirm: string): Promise<{ user: User; tokens: TokenPair }> => {
    const res = await api.post<{ user: User; access: string; refresh: string }>('/auth/register/', {
      username, email, password, password_confirm,
    });
    const tokens = { access: res.data.access, refresh: res.data.refresh };
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    return { user: res.data.user, tokens };
  },

  logout: async (): Promise<void> => {
    const refresh = getRefreshToken();
    try {
      await api.post('/auth/logout/', { refresh });
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await api.post<TokenPair>('/auth/refresh/', { refresh });
      setAccessToken(res.data.access);
      if (res.data.refresh) {
        setRefreshToken(res.data.refresh);
      }
      return res.data.access;
    } catch {
      setAccessToken(null);
      setRefreshToken(null);
      return null;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await api.get<User>('/auth/me/');
      return res.data;
    } catch {
      return null;
    }
  },
};

// --- Tags API ---
export const tagAPI = {
  list: () => api.get<PaginatedResponse<Tag>>('/tags/'),
  create: (data: { name: string; color: string }) => api.post<Tag>('/tags/', data),
  update: (id: number, data: { name: string; color: string }) => api.put<Tag>('/tags/' + id + '/', data),
  patch: (id: number, data: Partial<{ name: string; color: string }>) => api.patch<Tag>('/tags/' + id + '/', data),
  delete: (id: number) => api.delete('/tags/' + id + '/'),
};

// --- Notas API ---
export const notaAPI = {
  list: (page = 1, search = '', ordering = '-updated_at', tag = '') => {
    const params: Record<string, string | number> = { page, search, ordering };
    if (tag) params.tag = tag;
    return api.get<PaginatedResponse<Nota>>('/notas/', { params });
  },

  get: (id: number) => api.get<Nota>('/notas/' + id + '/'),
  create: (data: Partial<Nota>) => api.post<Nota>('/notas/', data),
  update: (id: number, data: Partial<Nota>) => api.put<Nota>('/notas/' + id + '/', data),
  patch: (id: number, data: Partial<Nota>) => api.patch<Nota>('/notas/' + id + '/', data),
  delete: (id: number) => api.delete('/notas/' + id + '/'),
  togglePin: (id: number) => api.post<{ is_pinned: boolean }>('/notas/' + id + '/toggle_pin/'),
  archive: (id: number) => api.post('/notas/' + id + '/archive/'),
  stats: () => api.get<NotaStats>('/notas/stats/'),
  exportNotes: () => api.get('/notas/export/'),
  importNotes: (data: { notas: any[] }) => api.post('/notas/import_notes/', data),
};

// --- Attachments API ---
export const attachmentAPI = {
  list: (notaId: number) => api.get<Attachment[]>('/notas/' + notaId + '/attachments/'),
  upload: (notaId: number, file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Attachment>('/notas/' + notaId + '/attachments/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    });
  },
  delete: (notaId: number, attachmentId: number) =>
    api.delete('/notas/' + notaId + '/attachments/' + attachmentId + '/'),
};

export default api;
