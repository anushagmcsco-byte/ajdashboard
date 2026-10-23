export interface User {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface ManagedSite {
  id: number;
  code: 'INDUSTRIAL' | 'EDUCATION';
  name: string;
  publicUrl: string;
  adminUrl: string;
  apiUrl: string;
  healthEndpoint: string;
  apiKeyMasked: string;
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'DOWN' | 'NOT_CONFIGURED';
  lastHealthCheck: string;
  latencyMs: number;
  version: string;
  errorMessage?: string;
  owner: string;
  config: Record<string, any>;
  updatedAt: string;
}

export interface IndustrialProduct {
  id: string;
  title: string;
  sku: string;
  productCode: string;
  category: string;
  subcategory?: string;
  shortDescription: string;
  fullDescription: string;
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
  technicalDetails: Record<string, string>;
  images: string[];
  documents: { name: string; url: string; size: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SYNC_PENDING' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
  websiteStatus: string;
  targetProductId?: string;
  targetProductUrl?: string;
  syncStatus: string;
  syncVersion: number;
  syncError?: string;
  lastSyncedAt?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EducationCourse {
  id: string;
  title: string;
  courseCode: string;
  category: string;
  description: string;
  courseOverview: string;
  learningObjectives: string[];
  curriculum: { title: string; hours: number; topics: string[] }[];
  modules: string[];
  duration: string;
  instructor: string;
  trainer: string;
  eligibility: string;
  prerequisites: string;
  imageUrl: string;
  documents: { name: string; url: string; size: string }[];
  price: number;
  discount: number;
  batchInfo: string;
  startDate?: string;
  endDate?: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  certificateAvailable: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SYNC_PENDING' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
  websiteStatus: string;
  targetCourseId?: string;
  targetCourseUrl?: string;
  syncStatus: string;
  syncVersion: number;
  syncError?: string;
  lastSyncedAt?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncJob {
  id: string;
  contentType: 'PRODUCT' | 'COURSE';
  sourceId: string;
  contentName: string;
  targetSite: 'INDUSTRIAL' | 'EDUCATION';
  targetUrl: string;
  targetId?: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  lastSuccessfulSyncAt?: string;
  errorReason?: string;
  idempotencyKey: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncMapping {
  id: number;
  sourceType: string;
  sourceId: string;
  targetSite: string;
  targetSiteUrl: string;
  targetId: string;
  syncStatus: string;
  syncVersion: number;
  lastSync: string;
  lastSuccessfulSync: string;
  lastError?: string;
  retryCount: number;
  createdBy: string;
  updatedBy: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  type: 'PRODUCT_PUBLISH' | 'COURSE_PUBLISH' | 'INTEGRATION_CONFIG' | 'FEATURE_FLAG';
  referenceId: string;
  referenceTitle: string;
  changeSummary: string;
  proposedChanges: any;
  requesterId: string;
  requesterName: string;
  approverId?: string;
  approverName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FeaturePolicy {
  id: number;
  siteCode: 'INDUSTRIAL' | 'EDUCATION';
  featureKey: string;
  featureName: string;
  description: string;
  state: 'OFF' | 'INTERNAL' | 'PILOT' | 'ON' | 'READ_ONLY' | 'MAINTENANCE';
  updatedBy: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedSite: 'INDUSTRIAL' | 'EDUCATION' | 'CONTROL_PLANE';
  affectedService: string;
  status: 'OPEN' | 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  summary: string;
  rootCause?: string;
  correctiveAction?: string;
  timeline: { timestamp: string; note: string; author: string }[];
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  beforeState?: any;
  afterState?: any;
  result: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  userAgent: string;
  correlationId: string;
  timestamp: string;
}

export interface DeviceSyncRecord {
  id: number;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  activeView: string;
  currentDraft: any;
  recentActivity: any[];
  lastSyncAt: string;
  createdAt: string;
}
