import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// 1. Control Users
export const controlUsers = pgTable('control_users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('OPERATIONS_ADMIN'),
  status: text('status').notNull().default('ACTIVE'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  mfaSecret: text('mfa_secret'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Control Roles & Permissions
export const controlRoles = pgTable('control_roles', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  permissions: jsonb('permissions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Managed Websites Registry
export const managedSites = pgTable('managed_sites', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // 'INDUSTRIAL' | 'EDUCATION'
  name: text('name').notNull(),
  publicUrl: text('public_url').notNull(),
  adminUrl: text('admin_url').notNull(),
  apiUrl: text('api_url').notNull(),
  healthEndpoint: text('health_endpoint').notNull(),
  apiKeyMasked: text('api_key_masked').notNull(),
  status: text('status').notNull().default('HEALTHY'), // 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'DOWN' | 'NOT_CONFIGURED'
  lastHealthCheck: timestamp('last_health_check').defaultNow(),
  latencyMs: integer('latency_ms').default(45),
  version: text('version').default('v2.4.1'),
  errorMessage: text('error_message'),
  owner: text('owner').default('AJ Infrastructure Operations'),
  config: jsonb('config').default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Industrial Products
export const industrialProducts = pgTable('industrial_products', {
  id: text('id').primaryKey(), // AJ-PROD-xxx
  title: text('title').notNull(),
  sku: text('sku').notNull().unique(),
  productCode: text('product_code').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  specifications: jsonb('specifications').$type<Record<string, string>>().default({}),
  features: jsonb('features').$type<string[]>().default([]),
  applications: jsonb('applications').$type<string[]>().default([]),
  technicalDetails: jsonb('technical_details').$type<Record<string, string>>().default({}),
  images: jsonb('images').$type<string[]>().default([]),
  documents: jsonb('documents').$type<{ name: string; url: string; size: string }[]>().default([]),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  slug: text('slug').notNull(),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SYNC_PENDING' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'
  websiteStatus: text('website_status').default('UNPUBLISHED'),
  targetProductId: text('target_product_id'),
  targetProductUrl: text('target_product_url'),
  syncStatus: text('sync_status').default('NOT_SYNCED'),
  syncVersion: integer('sync_version').default(1),
  syncError: text('sync_error'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Industrial Product Versions
export const industrialProductVersions = pgTable('industrial_product_versions', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull(),
  version: integer('version').notNull(),
  payload: jsonb('payload').notNull(),
  changedBy: text('changed_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Education Courses
export const educationCourses = pgTable('education_courses', {
  id: text('id').primaryKey(), // AJ-CRS-xxx
  title: text('title').notNull(),
  courseCode: text('course_code').notNull().unique(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  courseOverview: text('course_overview').notNull(),
  learningObjectives: jsonb('learning_objectives').$type<string[]>().default([]),
  curriculum: jsonb('curriculum').$type<{ title: string; hours: number; topics: string[] }[]>().default([]),
  modules: jsonb('modules').$type<string[]>().default([]),
  duration: text('duration').notNull(),
  instructor: text('instructor').notNull(),
  trainer: text('trainer').notNull(),
  eligibility: text('eligibility').notNull(),
  prerequisites: text('prerequisites').notNull(),
  imageUrl: text('image_url').notNull(),
  documents: jsonb('documents').$type<{ name: string; url: string; size: string }[]>().default([])
  ,
  price: integer('price').notNull().default(0),
  discount: integer('discount').default(0),
  batchInfo: text('batch_info').notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  mode: text('mode').notNull().default('HYBRID'), // ONLINE | OFFLINE | HYBRID
  certificateAvailable: boolean('certificate_available').default(true),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  slug: text('slug').notNull(),
  status: text('status').notNull().default('DRAFT'),
  websiteStatus: text('website_status').default('UNPUBLISHED'),
  targetCourseId: text('target_course_id'),
  targetCourseUrl: text('target_course_url'),
  syncStatus: text('sync_status').default('NOT_SYNCED'),
  syncVersion: integer('sync_version').default(1),
  syncError: text('sync_error'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Education Course Versions
export const educationCourseVersions = pgTable('education_course_versions', {
  id: serial('id').primaryKey(),
  courseId: text('course_id').notNull(),
  version: integer('version').notNull(),
  payload: jsonb('payload').notNull(),
  changedBy: text('changed_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Synchronization Jobs
export const syncJobs = pgTable('sync_jobs', {
  id: text('id').primaryKey(),
  contentType: text('content_type').notNull(), // 'PRODUCT' | 'COURSE'
  sourceId: text('source_id').notNull(),
  contentName: text('content_name').notNull(),
  targetSite: text('target_site').notNull(), // 'INDUSTRIAL' | 'EDUCATION'
  targetUrl: text('target_url').notNull(),
  targetId: text('target_id'),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
  attemptCount: integer('attempt_count').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(5),
  lastAttemptAt: timestamp('last_attempt_at'),
  lastSuccessfulSyncAt: timestamp('last_successful_sync_at'),
  errorReason: text('error_reason'),
  idempotencyKey: text('idempotency_key').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 9. Sync Mappings (Permanent Mapping Table)
export const syncMappings = pgTable('sync_mappings', {
  id: serial('id').primaryKey(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id').notNull(),
  targetSite: text('target_site').notNull(),
  targetSiteUrl: text('target_site_url').notNull(),
  targetId: text('target_id').notNull(),
  syncStatus: text('sync_status').notNull().default('SYNCED'),
  syncVersion: integer('sync_version').notNull().default(1),
  lastSync: timestamp('last_sync').defaultNow(),
  lastSuccessfulSync: timestamp('last_successful_sync').defaultNow(),
  lastError: text('last_error'),
  retryCount: integer('retry_count').default(0),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
});

// 10. Change Requests & Approvals
export const changeRequests = pgTable('change_requests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'PRODUCT_PUBLISH' | 'COURSE_PUBLISH' | 'INTEGRATION_CONFIG' | 'FEATURE_FLAG'
  referenceId: text('reference_id').notNull(),
  referenceTitle: text('reference_title').notNull(),
  changeSummary: text('change_summary').notNull(),
  proposedChanges: jsonb('proposed_changes').default({}),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name').notNull(),
  approverId: text('approver_id'),
  approverName: text('approver_name'),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// 11. Feature Policies
export const featurePolicies = pgTable('feature_policies', {
  id: serial('id').primaryKey(),
  siteCode: text('site_code').notNull(), // 'INDUSTRIAL' | 'EDUCATION'
  featureKey: text('feature_key').notNull(),
  featureName: text('feature_name').notNull(),
  description: text('description').notNull(),
  state: text('state').notNull().default('ON'), // 'OFF' | 'INTERNAL' | 'PILOT' | 'ON' | 'READ_ONLY' | 'MAINTENANCE'
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 12. Incidents
export const incidents = pgTable('incidents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  severity: text('severity').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  affectedSite: text('affected_site').notNull(), // 'INDUSTRIAL' | 'EDUCATION' | 'CONTROL_PLANE'
  affectedService: text('affected_service').notNull(),
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'
  summary: text('summary').notNull(),
  rootCause: text('root_cause'),
  correctiveAction: text('corrective_action'),
  timeline: jsonb('timeline').$type<{ timestamp: string; note: string; author: string }[]>().default([]),
  assignedTo: text('assigned_to').default('Ops Team'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// 13. Audit Events
export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  summary: text('summary').notNull(),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  result: text('result').notNull().default('SUCCESS'), // 'SUCCESS' | 'FAILURE'
  ipAddress: text('ip_address').default('127.0.0.1'),
  userAgent: text('user_agent').default('AJ Control Plane'),
  correlationId: text('correlation_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 14. SSO Handoff Tokens
export const ssoHandoffTokens = pgTable('sso_handoff_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  userRole: text('user_role').notNull(),
  targetSite: text('target_site').notNull(), // 'INDUSTRIAL' | 'EDUCATION'
  targetAdminUrl: text('target_admin_url').notNull(),
  deepLinkUrl: text('deep_link_url'),
  expiresAt: timestamp('expires_at').notNull(),
  isConsumed: boolean('is_consumed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 15. Cross-Device Progress & State Sync
export const userDeviceSync = pgTable('user_device_sync', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name').notNull(),
  deviceType: text('device_type').default('desktop'),
  ipAddress: text('ip_address').default('127.0.0.1'),
  activeView: text('active_view').default('dashboard'),
  currentDraft: jsonb('current_draft').default({}),
  recentActivity: jsonb('recent_activity').default([]),
  lastSyncAt: timestamp('last_sync_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
