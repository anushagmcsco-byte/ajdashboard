import {
  User,
  ManagedSite,
  IndustrialProduct,
  EducationCourse,
  SyncJob,
  SyncMapping,
  ChangeRequest,
  FeaturePolicy,
  Incident,
  AuditEvent,
  DeviceSyncRecord,
} from '../types/index.ts';

const TOKEN_KEY = 'aj_auth_token';
const DEVICE_KEY = 'aj_device_id';
const DEVICE_NAME_KEY = 'aj_device_name';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getDeviceId(): string {
  let devId = localStorage.getItem(DEVICE_KEY);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(DEVICE_KEY, devId);
  }
  return devId;
}

export function getDeviceName(): string {
  let name = localStorage.getItem(DEVICE_NAME_KEY);
  if (!name) {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    name = isMobile ? 'Mobile Field Unit' : 'Hubli HQ Workstation';
    localStorage.setItem(DEVICE_NAME_KEY, name);
  }
  return name;
}

export function setDeviceName(name: string) {
  localStorage.setItem(DEVICE_NAME_KEY, name);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  const rawText = await res.text();

  if (!res.ok) {
    let errMessage = `Request failed (${res.status} ${res.statusText})`;
    try {
      const errorData = JSON.parse(rawText);
      errMessage = errorData.error || errorData.message || rawText || errMessage;
    } catch {
      errMessage = rawText || errMessage;
    }

    if (res.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('aj_auth_expired'));
    }

    throw new Error(errMessage);
  }

  if (!rawText || rawText.trim() === '') {
    return {} as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return rawText as unknown as T;
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ mfaRequired: boolean; challengeToken: string; email: string; fullName: string; role: string; message: string; demoTotpHint: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(credentials) }
    ),

  verifyMfa: (data: { email: string; code: string; deviceName: string }) =>
    request<{ token: string; deviceId: string; user: User }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: () => request<{ user: User }>('/auth/session'),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardOverview: () => request<any>('/dashboard/overview'),

  // Managed Websites
  getManagedWebsites: () => request<ManagedSite[]>('/managed-websites'),

  // Industrial Products
  getIndustrialProducts: (query?: { search?: string; category?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.category) params.set('category', query.category);
    if (query?.status) params.set('status', query.status);
    return request<IndustrialProduct[]>(`/industrial/products?${params.toString()}`);
  },

  getProduct: (id: string) => request<{ product: IndustrialProduct; versions: any[]; mapping: SyncMapping | null }>(`/industrial/products/${id}`),

  createProduct: (data: Partial<IndustrialProduct>) =>
    request<IndustrialProduct>('/industrial/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<IndustrialProduct>) =>
    request<IndustrialProduct>(`/industrial/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  syncProduct: (id: string) =>
    request<{ success: boolean; message: string; product: IndustrialProduct; targetId: string; targetUrl: string; targetAdminUrl: string }>(
      `/industrial/products/${id}/sync`,
      { method: 'POST' }
    ),

  // Education Courses
  getEducationCourses: (query?: { search?: string; category?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.category) params.set('category', query.category);
    if (query?.status) params.set('status', query.status);
    return request<EducationCourse[]>(`/education/courses?${params.toString()}`);
  },

  getCourse: (id: string) => request<{ course: EducationCourse; versions: any[]; mapping: SyncMapping | null }>(`/education/courses/${id}`),

  createCourse: (data: Partial<EducationCourse>) =>
    request<EducationCourse>('/education/courses', { method: 'POST', body: JSON.stringify(data) }),

  updateCourse: (id: string, data: Partial<EducationCourse>) =>
    request<EducationCourse>(`/education/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  syncCourse: (id: string) =>
    request<{ success: boolean; message: string; course: EducationCourse; targetId: string; targetUrl: string; targetAdminUrl: string }>(
      `/education/courses/${id}/sync`,
      { method: 'POST' }
    ),

  // Integrations & Health
  getIntegrations: () => request<ManagedSite[]>('/integrations'),
  testIndustrialHealth: () => request<any>('/integrations/industrial/test', { method: 'POST' }),
  testEducationHealth: () => request<any>('/integrations/education/test', { method: 'POST' }),
  updateIntegrationConfig: (code: string, data: any) =>
    request<ManagedSite>(`/integrations/${code}`, { method: 'PUT', body: JSON.stringify(data) }),

  // SSO Handoff Tokens
  startIndustrialSso: (deepLinkUrl?: string) =>
    request<{ success: boolean; handoffToken: string; redirectUrl: string; targetSite: string; expiresInSeconds: number }>(
      '/sso/industrial/start',
      { method: 'POST', body: JSON.stringify({ deepLinkUrl }) }
    ),

  startEducationSso: (deepLinkUrl?: string) =>
    request<{ success: boolean; handoffToken: string; redirectUrl: string; targetSite: string; expiresInSeconds: number }>(
      '/sso/education/start',
      { method: 'POST', body: JSON.stringify({ deepLinkUrl }) }
    ),

  // Sync Jobs & Retry
  getSyncJobs: () => request<{ jobs: SyncJob[]; mappings: SyncMapping[] }>('/sync/jobs'),
  retrySyncJob: (id: string) => request<{ success: boolean; message: string }>(`/sync/jobs/${id}/retry`, { method: 'POST' }),

  // Change Requests & Approvals
  getChangeRequests: () => request<ChangeRequest[]>('/change-requests'),
  createChangeRequest: (data: Partial<ChangeRequest>) =>
    request<ChangeRequest>('/change-requests', { method: 'POST', body: JSON.stringify(data) }),
  approveChangeRequest: (id: string, reviewNotes?: string) =>
    request<ChangeRequest>(`/change-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ reviewNotes }) }),

  // Features
  getFeatures: () => request<FeaturePolicy[]>('/features'),
  updateFeatureState: (id: number, state: string) =>
    request<FeaturePolicy>(`/features/${id}`, { method: 'PUT', body: JSON.stringify({ state }) }),

  // Incidents
  getIncidents: () => request<Incident[]>('/incidents'),
  createIncident: (data: Partial<Incident>) =>
    request<Incident>('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateIncident: (id: string, data: any) =>
    request<Incident>(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Audit Logs
  getAuditEvents: (query?: { action?: string; targetType?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.action) params.set('action', query.action);
    if (query?.targetType) params.set('targetType', query.targetType);
    if (query?.limit) params.set('limit', query.limit.toString());
    return request<AuditEvent[]>(`/audit?${params.toString()}`);
  },

  // Users & Roles
  getUsers: () => request<User[]>('/users'),
  getRoles: () => request<any[]>('/roles'),

  // Cross-Device Progress Sync
  sendDeviceHeartbeat: (data: { activeView: string; currentDraft?: any; recentActivity?: any[] }) =>
    request<{ success: boolean; syncedAt: string }>('/sync/devices/heartbeat', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
        activeView: data.activeView,
        currentDraft: data.currentDraft,
        recentActivity: data.recentActivity,
      }),
    }),

  getPairedDevices: () => request<DeviceSyncRecord[]>('/sync/devices'),

  getCrossDeviceState: () =>
    request<{
      devicesCount: number;
      latestDraft: any;
      sourceDevice: string | null;
      lastSyncAt: string | null;
      activeDevices: DeviceSyncRecord[];
    }>('/sync/devices/state'),
};
