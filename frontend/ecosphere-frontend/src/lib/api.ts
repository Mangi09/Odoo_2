// Central API client for EcoSphere frontend
// Reads token from localStorage, sends Bearer header

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('ecosphere_token');
}

export function saveToken(token: string, user: unknown) {
  localStorage.setItem('ecosphere_token', token);
  localStorage.setItem('ecosphere_user', JSON.stringify(user));
}

export function clearToken() {
  localStorage.removeItem('ecosphere_token');
  localStorage.removeItem('ecosphere_user');
}

export function getSavedUser(): Record<string, unknown> | null {
  const raw = localStorage.getItem('ecosphere_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errBody: { error?: string } = {};
    try { errBody = await res.json(); } catch { /* ignore */ }
    throw Object.assign(new Error(errBody.error || `HTTP ${res.status}`), { status: res.status, body: errBody });
  }

  // For download endpoints return the response itself
  if (options.signal !== undefined && res.headers.get('Content-Disposition')) {
    return res as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ user: Record<string, unknown>; permissions: string[]; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (data: Record<string, string>) =>
    request<{ user: Record<string, unknown>; permissions: string[]; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () =>
    request<{ user: Record<string, unknown>; permissions: string[] }>('/api/auth/me'),
  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
};

// ── Dashboard ───────────────────────────────────────────────────────────────
export const dashboard = {
  summary: () => request<Record<string, unknown>>('/api/dashboard/summary'),
  emissionsTrend: (range = '6M') => request<unknown[]>(`/api/dashboard/emissions-trend?range=${range}`),
  activities: () => request<unknown[]>('/api/dashboard/activities'),
  deadlines: () => request<unknown[]>('/api/dashboard/deadlines'),
};

// ── Environmental ───────────────────────────────────────────────────────────
export const environmental = {
  transactions: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    return request<unknown[]>(`/api/environmental/transactions?${q}`);
  },
  goals: () => request<unknown[]>('/api/environmental/goals'),
  calculate: (data: Record<string, unknown>) =>
    request<{ summary: Record<string, unknown>; transaction: Record<string, unknown> }>('/api/environmental/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Social ──────────────────────────────────────────────────────────────────
export const social = {
  activities: () => request<unknown[]>('/api/social/activities'),
  join: (id: string, proofUrl?: string) =>
    request<{ id: string; status: string }>(`/api/social/activities/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ proof_url: proofUrl || '' }),
    }),
  participations: () => request<unknown[]>('/api/social/participations'),
  approve: (id: string) =>
    request<{ id: string; status: string; pointsAwarded: number }>(`/api/social/participations/${id}/approve`, { method: 'POST' }),
  reject: (id: string) =>
    request<{ id: string; status: string }>(`/api/social/participations/${id}/reject`, { method: 'POST' }),
};

// ── Gamification ────────────────────────────────────────────────────────────
export const gamification = {
  challenges: () => request<unknown[]>('/api/gamification/challenges'),
  complete: (id: string, proofUrl?: string) =>
    request<{ id: string; xpAwarded: number }>(`/api/gamification/challenges/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ proof_url: proofUrl || '' }),
    }),
  badges: () => request<unknown[]>('/api/gamification/badges'),
  leaderboard: (type: 'employee' | 'department' = 'employee') =>
    request<unknown[]>(`/api/gamification/leaderboard?type=${type}`),
  rewards: () => request<unknown[]>('/api/gamification/rewards'),
  redeem: (id: string) =>
    request<{ id: string; name: string; pointsSpent: number }>(`/api/gamification/rewards/${id}/redeem`, { method: 'POST' }),
};

// ── Governance ──────────────────────────────────────────────────────────────
export const governance = {
  audits: () => request<unknown[]>('/api/governance/audits'),
  issues: () => request<unknown[]>('/api/governance/issues'),
  createIssue: (data: { title: string; severity: string; category: string }) =>
    request<Record<string, unknown>>('/api/governance/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resolveIssue: (id: string, status = 'Resolved') =>
    request<{ id: string; status: string }>(`/api/governance/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  policies: () => request<unknown[]>('/api/governance/policies'),
  acknowledge: (id: string) =>
    request<{ policyId: string; acknowledged: boolean }>(`/api/governance/policies/${id}/acknowledge`, { method: 'POST' }),
};

// ── Reports ─────────────────────────────────────────────────────────────────
export const reports = {
  generate: (data: Record<string, unknown>) =>
    request<{ id: string; downloadUrl: string; status: string; format: string; generatedAt: string }>('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  history: () => request<unknown[]>('/api/reports/history'),
  download: (id: string) => {
    const token = getToken();
    const url = `${API_BASE}/api/reports/download/${id}`;
    // Open in new tab so browser handles the download
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    // Add token as query param for download endpoint
    a.href = `${url}?token=${token || ''}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

// ── Notifications ───────────────────────────────────────────────────────────
export const notifications = {
  list: (type?: string) => request<unknown[]>(`/api/notifications${type ? `?type=${type}` : ''}`),
  markRead: (id: string) => request<Record<string, unknown>>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request<{ updated: number }>('/api/notifications/read-all', { method: 'POST' }),
};

// ── Profile ─────────────────────────────────────────────────────────────────
export const profile = {
  me: () => request<Record<string, unknown>>('/api/profile/me'),
  history: (type?: string) => request<unknown[]>(`/api/profile/history${type ? `?type=${type}` : ''}`),
};

// ── Settings ─────────────────────────────────────────────────────────────────
export const settings = {
  config: () => request<Record<string, unknown>>('/api/settings/config'),
  updateConfig: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>('/api/settings/config', { method: 'PATCH', body: JSON.stringify(data) }),
  departments: () => request<unknown[]>('/api/settings/departments'),
  createDepartment: (data: { name: string; code?: string }) =>
    request<Record<string, unknown>>('/api/settings/departments', { method: 'POST', body: JSON.stringify(data) }),
  deleteDepartment: (id: string) =>
    request<{ deleted: boolean }>(`/api/settings/departments/${id}`, { method: 'DELETE' }),
  categories: () => request<unknown[]>('/api/settings/categories'),
  createCategory: (data: { name: string; type?: string }) =>
    request<Record<string, unknown>>('/api/settings/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<{ deleted: boolean }>(`/api/settings/categories/${id}`, { method: 'DELETE' }),
};
