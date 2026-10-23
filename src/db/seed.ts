import { db } from './index.ts';
import {
  controlUsers,
  controlRoles,
  managedSites,
  featurePolicies,
  industrialProducts,
  educationCourses,
  syncMappings,
  auditEvents,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedInitialData() {
  try {
    // 1. Seed Managed Sites
    const existingSites = await db.select().from(managedSites);
    if (existingSites.length === 0) {
      await db.insert(managedSites).values([
        {
          code: 'INDUSTRIAL',
          name: 'Silphor Industrial / Partner Platform',
          publicUrl: 'https://silphor.com',
          adminUrl: 'https://silphor.com/admin',
          apiUrl: 'https://silphor.com/api/v1',
          healthEndpoint: 'https://silphor.com/api/v1/health',
          apiKeyMasked: 'slp_ind_live_••••••••••••94a2',
          status: 'HEALTHY',
          latencyMs: 38,
          version: 'v3.2.0-ind',
          owner: 'AJ Enterprise Engineering',
          config: {
            timeoutMs: 5000,
            retryAttempts: 3,
            deepLinkPattern: '/admin/products/{targetId}',
            webhookSecretMasked: 'whsec_••••••••41b7',
          },
        },
        {
          code: 'EDUCATION',
          name: 'Silphor Education / Training Platform',
          publicUrl: 'https://silper.co.in',
          adminUrl: 'https://silper.co.in/admin',
          apiUrl: 'https://silper.co.in/api/v1',
          healthEndpoint: 'https://silper.co.in/api/v1/health',
          apiKeyMasked: 'slp_edu_live_••••••••••••e891',
          status: 'HEALTHY',
          latencyMs: 44,
          version: 'v2.8.4-edu',
          owner: 'AJ Enterprise Engineering',
          config: {
            timeoutMs: 5000,
            retryAttempts: 3,
            deepLinkPattern: '/admin/courses/{targetId}',
            webhookSecretMasked: 'whsec_••••••••90c2',
          },
        },
      ]);
      console.log('Seeded managed sites');
    }

    // 2. Seed Control Roles
    const existingRoles = await db.select().from(controlRoles);
    if (existingRoles.length === 0) {
      await db.insert(controlRoles).values([
        {
          code: 'SUPER_ADMIN',
          name: 'Super Administrator',
          description: 'Full root access to all control planes, sites, approvals, and security settings.',
          permissions: [
            'industrial.products.view', 'industrial.products.create', 'industrial.products.edit',
            'industrial.products.publish', 'industrial.products.unpublish', 'industrial.products.archive',
            'industrial.products.sync', 'industrial.admin.open',
            'education.courses.view', 'education.courses.create', 'education.courses.edit',
            'education.courses.publish', 'education.courses.unpublish', 'education.courses.archive',
            'education.courses.sync', 'education.admin.open',
            'integration.configure', 'integration.test',
            'audit.view', 'audit.export', 'release.approve', 'incident.manage', 'users.manage', 'security.manage',
          ],
        },
        {
          code: 'INDUSTRIAL_ADMIN',
          name: 'Industrial Administrator',
          description: 'Authority over Industrial Products, Catalog Sync, and silphor.com operations.',
          permissions: [
            'industrial.products.view', 'industrial.products.create', 'industrial.products.edit',
            'industrial.products.publish', 'industrial.products.unpublish', 'industrial.products.archive',
            'industrial.products.sync', 'industrial.admin.open', 'integration.test', 'audit.view',
          ],
        },
        {
          code: 'EDUCATION_ADMIN',
          name: 'Education Administrator',
          description: 'Authority over Education Courses, Curriculum Sync, and silper.co.in operations.',
          permissions: [
            'education.courses.view', 'education.courses.create', 'education.courses.edit',
            'education.courses.publish', 'education.courses.unpublish', 'education.courses.archive',
            'education.courses.sync', 'education.admin.open', 'integration.test', 'audit.view',
          ],
        },
        {
          code: 'RELEASE_MANAGER',
          name: 'Release & Deployment Manager',
          description: 'Approves releases, deployments, and production change requests.',
          permissions: [
            'release.approve', 'incident.manage', 'audit.view', 'integration.configure',
            'industrial.products.view', 'education.courses.view',
          ],
        },
        {
          code: 'OPERATIONS_ADMIN',
          name: 'Operations Administrator',
          description: 'Monitors integration health, incidents, sync queues, and device states.',
          permissions: [
            'industrial.products.view', 'education.courses.view', 'integration.test',
            'audit.view', 'incident.manage',
          ],
        },
      ]);
      console.log('Seeded control roles');
    }

    // 3. Seed Default Admin User
    const existingUsers = await db.select().from(controlUsers);
    if (existingUsers.length === 0) {
      await db.insert(controlUsers).values([
        {
          uid: 'aj-admin-root-01',
          email: 'admin@ajenterprises.hubli.in',
          fullName: 'AJ Hubli Admin',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          mfaEnabled: true,
          mfaSecret: 'AJENTERPRISE2026MFAKEY',
          lastLoginAt: new Date(),
        },
        {
          uid: 'aj-admin-ind-02',
          email: 'industrial.lead@ajenterprises.hubli.in',
          fullName: 'Rajesh Patil (Industrial Lead)',
          role: 'INDUSTRIAL_ADMIN',
          status: 'ACTIVE',
          mfaEnabled: true,
          mfaSecret: 'AJINDUSTRIAL2026KEY',
          lastLoginAt: new Date(),
        },
        {
          uid: 'aj-admin-edu-03',
          email: 'education.lead@ajenterprises.hubli.in',
          fullName: 'Pooja Kulkarni (Education Lead)',
          role: 'EDUCATION_ADMIN',
          status: 'ACTIVE',
          mfaEnabled: true,
          mfaSecret: 'AJEDUCATION2026KEY',
          lastLoginAt: new Date(),
        },
      ]);
      console.log('Seeded control users');
    }

    // 4. Seed Feature Policies
    const existingFeatures = await db.select().from(featurePolicies);
    if (existingFeatures.length === 0) {
      const industrialFeatures = [
        { key: 'public_partner_directory', name: 'Public Partner Directory', desc: 'Listing of verified manufacturing partners on silphor.com' },
        { key: 'product_catalog', name: 'Product Catalog Browsing', desc: 'Public and authenticated industrial product browsing' },
        { key: 'enterprise_login', name: 'Enterprise Single Sign-On', desc: 'B2B enterprise client authentication portal' },
        { key: 'partner_login', name: 'Partner Vendor Portal', desc: 'Secure vendor onboarding and RFQ response access' },
        { key: 'rfq_submission', name: 'RFQ Submission Engine', desc: 'Direct Request For Quotation submission from clients' },
        { key: 'rfq_partner_routing', name: 'Automated RFQ Routing', desc: 'Intelligent dispatch of RFQs to matching fabricators' },
        { key: 'quotation_upload', name: 'Quotation Upload & Review', desc: 'Vendor quote attachment and price breakdown review' },
        { key: 'engineering_requirements', name: 'Engineering CAD/Spec Validation', desc: 'Automated tolerance and CAD file ingest' },
        { key: 'crm_workspace', name: 'Enterprise CRM Workspace', desc: 'Deal pipeline and account management' },
        { key: 'advanced_search', name: 'Parametric Product Search', desc: 'Faceted search across technical specifications' },
        { key: 'downloads', name: 'Technical Datasheet Downloads', desc: 'Public download portal for datasheets and brochures' },
        { key: 'contact_forms', name: 'Inquiry & Support Forms', desc: 'Lead capture forms on industrial landing pages' },
      ];

      const educationFeatures = [
        { key: 'course_catalog', name: 'Course Catalog Browsing', desc: 'Public and student course browsing on silper.co.in' },
        { key: 'new_registration', name: 'New Student Registration', desc: 'Enrollment gateway for upcoming batches' },
        { key: 'otp_verification', name: 'SMS / Email OTP Verification', desc: 'Two-factor phone verification on sign up' },
        { key: 'online_payment', name: 'Online Tuition Payment Gateway', desc: 'Razorpay / UPI integrated fees collection' },
        { key: 'applicant_dashboard', name: 'Applicant Admission Dashboard', desc: 'Track application, interview, and offer letters' },
        { key: 'student_portal', name: 'Student Portal & LMS', desc: 'Classroom schedules, recorded sessions, and resources' },
        { key: 'trainer_portal', name: 'Trainer & Instructor Portal', desc: 'Attendance marking, assignment grading, and feedback' },
        { key: 'lms_content', name: 'Interactive LMS Modules', desc: 'Video lectures, code sandboxes, and reading materials' },
        { key: 'attendance', name: 'Biometric & QR Attendance', desc: 'Daily lecture attendance records' },
        { key: 'assignments', name: 'Coding & Lab Assignments', desc: 'Hands-on assignment submission and autograding' },
        { key: 'assessments', name: 'Proctored Assessments & Quizzes', desc: 'Mid-term and final term certification exams' },
        { key: 'certificate_generation', name: 'Automated Certificate Generation', desc: 'Tamper-evident cryptographically signed diplomas' },
        { key: 'certificate_verification', name: 'Public Credential Verification', desc: 'Employer QR code verification of certificates' },
        { key: 'placement_module', name: 'Campus Placement Portal', desc: 'Job drives, interview schedules, and candidate shortlist' },
        { key: 'employer_portal', name: 'Hiring Partner Employer Portal', desc: 'Access to top-ranking verified student portfolios' },
        { key: 'placement_applications', name: 'Job Applications Pipeline', desc: '1-click resume and portfolio submissions' },
        { key: 'projects_internships', name: 'Capstone Projects & Internships', desc: 'Real-world industrial project assignments' },
        { key: 'paid_opportunities', name: 'Stipend / Paid Internships', desc: 'Sponsored corporate internship assignments' },
        { key: 'unpaid_opportunities', name: 'Academic Research Projects', desc: 'Foundational mentorship modules' },
        { key: 'project_milestones', name: 'Milestone Tracking & Review', desc: 'Sprint tracking for capstone final projects' },
        { key: 'internship_evaluation', name: 'Industry Mentor Evaluation', desc: 'Structured feedback rubric from client leads' },
        { key: 'career_notifications', name: 'Career Alerts & Telegram/WhatsApp', desc: 'Automated notifications for upcoming drives' },
      ];

      const toInsert = [
        ...industrialFeatures.map((f) => ({
          siteCode: 'INDUSTRIAL',
          featureKey: f.key,
          featureName: f.name,
          description: f.desc,
          state: 'ON',
          updatedBy: 'AJ Release Operations',
        })),
        ...educationFeatures.map((f) => ({
          siteCode: 'EDUCATION',
          featureKey: f.key,
          featureName: f.name,
          description: f.desc,
          state: 'ON',
          updatedBy: 'AJ Release Operations',
        })),
      ];

      await db.insert(featurePolicies).values(toInsert);
      console.log('Seeded feature policies');
    }

    // 5. Seed Initial Industrial Products
    const existingProducts = await db.select().from(industrialProducts);
    if (existingProducts.length === 0) {
      await db.insert(industrialProducts).values([
        {
          id: 'AJ-PROD-001',
          title: 'Silphor V-Series Heavy Industrial CNC Machining Center',
          sku: 'SLP-CNC-V850',
          productCode: 'IND-EQ-850',
          category: 'CNC Machinery & Robotics',
          subcategory: 'Vertical Machining Centers',
          shortDescription: 'High-torque 5-axis vertical machining center engineered for aerospace-grade precision milling.',
          fullDescription: 'The Silphor V-Series V850 delivers class-leading spindle stiffness, 15,000 RPM high-speed direct-drive spindle, and micron-level repeatability. Equipped with optical linear scales, automated pallet changer, and IoT telematics.',
          specifications: {
            'Spindle Speed': '15,000 RPM Direct-Drive',
            'Travel (X/Y/Z)': '850 x 550 x 510 mm',
            'Table Size': '1,000 x 500 mm',
            'Rapid Traverse': '36 m/min',
            'Tool Capacity': '30-Station Dual-Arm ATC',
            'Positioning Accuracy': '±0.003 mm ISO 230-2',
            'Controller': 'Siemens Sinumerik ONE / Fanuc 31i-B',
          },
          features: [
            'Direct-drive high-torque liquid-cooled spindle',
            'Finite Element Analysis (FEA) optimized Meehanite cast-iron base',
            'Integrated Heidenhain optical linear scales',
            'Smart vibration suppression with active damping',
            'Industry 4.0 IoT telemetry gateway with MQTT/OPC-UA',
          ],
          applications: [
            'Aerospace turbine impeller fabrication',
            'Automotive precision transmission molds',
            'Medical surgical titanium implant machining',
            'Defense ordnance precision components',
          ],
          technicalDetails: {
            'Power Rating': '18.5 kW continuous / 22 kW 30-min',
            'Machine Weight': '6,800 kg',
            'Coolant Tank': '350 Liters with high-pressure CTS (20 bar)',
          },
          images: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
          ],
          documents: [
            { name: 'Silphor_V850_Datasheet.pdf', url: 'https://silphor.com/docs/v850-specs.pdf', size: '2.4 MB' },
            { name: 'Foundations_CAD_Layout.dxf', url: 'https://silphor.com/docs/v850-cad.dxf', size: '5.1 MB' },
          ],
          seoTitle: 'Silphor V850 5-Axis Heavy CNC Machining Center | silphor.com',
          seoDescription: 'High precision 5-axis vertical machining center for aerospace and toolmaking manufactured by Silphor Technologies.',
          seoKeywords: 'CNC machining center, 5-axis milling, aerospace manufacturing, precision CNC Hubli',
          slug: 'silphor-v-series-v850-heavy-cnc-machining-center',
          status: 'PUBLISHED',
          websiteStatus: 'PUBLISHED',
          targetProductId: 'IND-PROD-9842',
          targetProductUrl: 'https://silphor.com/products/silphor-v850-cnc',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSyncedAt: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
        {
          id: 'AJ-PROD-002',
          title: 'Silphor OptiWeld Robotic Laser Welding Cell',
          sku: 'SLP-WLD-L2000',
          productCode: 'IND-EQ-2000',
          category: 'Robotics & Automation',
          subcategory: 'Laser Systems',
          shortDescription: 'Integrated 2kW continuous fiber laser robotic cell with 6-axis articulated arm and seam tracking.',
          fullDescription: 'OptiWeld L2000 combines fiber laser energy with real-time seam finding optics to achieve clean, splatter-free welds on stainless steel, aluminum alloys, and carbon steels with minimal thermal distortion.',
          specifications: {
            'Laser Source': '2kW CW Fiber Laser (1070 nm)',
            'Robot Arm Reach': '1,810 mm (6-Axis)',
            'Seam Tracking': 'Optical Laser Triangulation Sensor',
            'Shielding Gas': 'Ar / He / N2 proportional mixing',
          },
          features: [
            'Class 1 laser safety interlocked enclosure',
            'Real-time adaptive wire feeding system',
            'Wobble weld head with adjustable oscillation pattern',
          ],
          applications: [
            'Automotive battery tray seam sealing',
            'Sheet metal enclosure fabrication',
            'Pressure vessel component welding',
          ],
          technicalDetails: {
            'Fiber Core Diameter': '50 μm',
            'Power Consumption': '9.2 kVA',
          },
          images: [
            'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
          ],
          documents: [
            { name: 'OptiWeld_L2000_Brochure.pdf', url: 'https://silphor.com/docs/optiweld-l2000.pdf', size: '1.8 MB' },
          ],
          seoTitle: 'OptiWeld 2kW Robotic Laser Welding System | Silphor Industrial',
          seoDescription: 'High precision industrial robotic fiber laser welding cell by Silphor Technologies.',
          seoKeywords: 'robotic laser welding, fiber laser cell, automated welding',
          slug: 'silphor-optiweld-robotic-laser-welding-cell',
          status: 'PUBLISHED',
          websiteStatus: 'PUBLISHED',
          targetProductId: 'IND-PROD-9843',
          targetProductUrl: 'https://silphor.com/products/optiweld-laser-cell',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSyncedAt: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
      ]);
      console.log('Seeded industrial products');
    }

    // 6. Seed Initial Education Courses
    const existingCourses = await db.select().from(educationCourses);
    if (existingCourses.length === 0) {
      await db.insert(educationCourses).values([
        {
          id: 'AJ-CRS-001',
          title: 'Advanced Industrial IoT & SCADA Automation Engineering',
          courseCode: 'EDU-IIOT-401',
          category: 'Automation & Embedded Systems',
          description: 'Master programmable logic controllers (Siemens/Allen-Bradley), industrial protocols, edge gateways, and cloud SCADA dashboards.',
          courseOverview: 'A rigorous hands-on engineering bootcamp covering industrial automation from field instrumentation, 4-20mA sensors, PLC ladder logic programming, Modbus/Profibus, up to MQTT IIoT clouds and real-time dashboard visualization.',
          learningObjectives: [
            'Program Siemens S7-1200 and Rockwell PLC platforms using IEC 61131-3 languages',
            'Configure industrial Ethernet, PROFINET, Modbus TCP, and OPC-UA communication networks',
            'Build edge computing applications with Node-RED and Raspberry Pi industrial gateways',
            'Deploy time-series telemetry pipelines to cloud dashboards with real-time alerting',
          ],
          curriculum: [
            { title: 'Module 1: Industrial Fieldbus & Sensor Instrumentation', hours: 24, topics: ['4-20mA loops', 'RTD/Thermocouple sensors', 'Encoder interfacing', 'Signal conditioning'] },
            { title: 'Module 2: PLC Hardware Architecture & Ladder Logic', hours: 36, topics: ['TIA Portal V19', 'Ladder diagrams', 'Function blocks', 'Hardware interrupts'] },
            { title: 'Module 3: HMI & SCADA System Design', hours: 30, topics: ['WinCC Unified', 'Tag binding', 'Alarm management', 'Historical trending'] },
            { title: 'Module 4: IIoT Edge Gateways & Cloud Dashboards', hours: 30, topics: ['OPC-UA Server setup', 'MQTT broking', 'InfluxDB + Grafana', 'Edge predictive maintenance'] },
          ],
          modules: ['Instrumentation', 'PLC Programming', 'SCADA & HMI', 'IIoT Edge Gateway', 'Capstone Industry Project'],
          duration: '16 Weeks (120 Hours)',
          instructor: 'Dr. Anand Deshpande (Ph.D. Mechatronics, IIT Bombay)',
          trainer: 'Suresh Rao (Siemens Certified Automation Specialist)',
          eligibility: 'B.E./B.Tech or Diploma in Mechanical, Electrical, Electronics, or Instrumentation Engineering',
          prerequisites: 'Basic knowledge of electrical circuits and digital logic gates',
          imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
          documents: [
            { name: 'IIoT_401_Syllabus_Prospectus.pdf', url: 'https://silper.co.in/docs/iiot-401-prospectus.pdf', size: '3.1 MB' },
          ],
          price: 38000,
          discount: 15,
          batchInfo: 'Batch 14 starting November 2, 2026 (Evening & Weekend)',
          startDate: '2026-11-02',
          endDate: '2027-02-28',
          mode: 'HYBRID',
          certificateAvailable: true,
          seoTitle: 'Industrial IoT & SCADA Automation Engineering Course | Silphor Education',
          seoDescription: 'Comprehensive training in PLC programming, SCADA design, and IIoT engineering with practical lab hardware in Hubli.',
          seoKeywords: 'PLC training Hubli, Industrial IoT course, SCADA engineering, automation training Karnataka',
          slug: 'industrial-iot-scada-automation-engineering',
          status: 'PUBLISHED',
          websiteStatus: 'PUBLISHED',
          targetCourseId: 'EDU-CRS-7102',
          targetCourseUrl: 'https://silper.co.in/courses/industrial-iot-scada',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSyncedAt: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
        {
          id: 'AJ-CRS-002',
          title: 'Precision CNC Programming, CAM & 5-Axis Multitasking',
          courseCode: 'EDU-CNC-302',
          category: 'Precision Manufacturing',
          description: 'Comprehensive certification program covering Mastercam, Siemens NX CAM, G-code optimization, tooling geometry, and 5-axis machine setup.',
          courseOverview: 'Directly mentored by tooling engineers at Silphor Industrial factory floor. Students program and machine actual components on CNC milling and turning centers.',
          learningObjectives: [
            'Read aerospace GD&T blueprints and calculate speeds/feeds for titanium and superalloys',
            'Generate efficient multi-axis toolpaths using Mastercam and Siemens NX CAM',
            'Setup CNC VMC fixtures, zero work coordinates, and touch off cutting tools',
            'Inspect finished parts using coordinate measuring machines (CMM) and surface roughness testers',
          ],
          curriculum: [
            { title: 'Module 1: Blueprint Reading, GD&T & Cutting Tool Metrology', hours: 20, topics: ['ASME Y14.5 standards', 'Carbide insert geometry', 'Chip load calculations'] },
            { title: 'Module 2: G & M Code Manual Programming & Macro B', hours: 30, topics: ['Canned cycles', 'Parametric macro programming', 'Probing routines'] },
            { title: 'Module 3: Mastercam 2D/3D & Multi-Axis CAM', hours: 40, topics: ['High-speed dynamic milling', '5-axis swarf milling', 'Post-processor editing'] },
            { title: 'Module 4: Machine Shop Floor Hands-On Machining', hours: 30, topics: ['Work holding fixtures', 'First-piece inspection', 'Tool wear monitoring'] },
          ],
          modules: ['Metrology & GD&T', 'G-Code Programming', 'Mastercam & NX CAM', 'Shop Floor Machining'],
          duration: '12 Weeks (120 Hours)',
          instructor: 'Mahesh Kulkarni (Senior Tooling Engineer, 18+ yrs exp)',
          trainer: 'Pravin Joshi (Mastercam Certified Application Engineer)',
          eligibility: 'ITI, Diploma, or B.E. in Mechanical / Automobile / Production Engineering',
          prerequisites: 'Basic drafting or AutoCAD fundamentals',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          documents: [
            { name: 'CNC_302_Brochure.pdf', url: 'https://silper.co.in/docs/cnc-302-brochure.pdf', size: '2.7 MB' },
          ],
          price: 32000,
          discount: 10,
          batchInfo: 'Batch 9 starting November 10, 2026 (Daily Morning Practical Batch)',
          startDate: '2026-11-10',
          endDate: '2027-02-15',
          mode: 'OFFLINE',
          certificateAvailable: true,
          seoTitle: 'CNC Programming & 5-Axis CAM Certification Course | Silphor Education Hubli',
          seoDescription: 'Hands-on CNC and 5-axis CAM training on industrial factory machines at Silphor Technologies Hubli.',
          seoKeywords: 'CNC training Hubli, CAM programming course, Mastercam training, NX CAM Karnataka',
          slug: 'precision-cnc-programming-cam-5-axis',
          status: 'PUBLISHED',
          websiteStatus: 'PUBLISHED',
          targetCourseId: 'EDU-CRS-7103',
          targetCourseUrl: 'https://silper.co.in/courses/cnc-programming-cam',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSyncedAt: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
      ]);
      console.log('Seeded education courses');
    }

    // 7. Seed Mappings
    const existingMappings = await db.select().from(syncMappings);
    if (existingMappings.length === 0) {
      await db.insert(syncMappings).values([
        {
          sourceType: 'PRODUCT',
          sourceId: 'AJ-PROD-001',
          targetSite: 'INDUSTRIAL',
          targetSiteUrl: 'https://silphor.com',
          targetId: 'IND-PROD-9842',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSync: new Date(),
          lastSuccessfulSync: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
        {
          sourceType: 'PRODUCT',
          sourceId: 'AJ-PROD-002',
          targetSite: 'INDUSTRIAL',
          targetSiteUrl: 'https://silphor.com',
          targetId: 'IND-PROD-9843',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSync: new Date(),
          lastSuccessfulSync: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
        {
          sourceType: 'COURSE',
          sourceId: 'AJ-CRS-001',
          targetSite: 'EDUCATION',
          targetSiteUrl: 'https://silper.co.in',
          targetId: 'EDU-CRS-7102',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSync: new Date(),
          lastSuccessfulSync: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
        {
          sourceType: 'COURSE',
          sourceId: 'AJ-CRS-002',
          targetSite: 'EDUCATION',
          targetSiteUrl: 'https://silper.co.in',
          targetId: 'EDU-CRS-7103',
          syncStatus: 'SYNCED',
          syncVersion: 1,
          lastSync: new Date(),
          lastSuccessfulSync: new Date(),
          createdBy: 'admin@ajenterprises.hubli.in',
          updatedBy: 'admin@ajenterprises.hubli.in',
        },
      ]);
      console.log('Seeded sync mappings');
    }

    // 8. Seed Audit Log Event
    const existingAudits = await db.select().from(auditEvents);
    if (existingAudits.length === 0) {
      await db.insert(auditEvents).values([
        {
          id: 'AUD-INIT-001',
          actorId: 'aj-admin-root-01',
          actorName: 'AJ Hubli Admin',
          actorRole: 'SUPER_ADMIN',
          action: 'SYSTEM_BOOTSTRAP',
          targetType: 'PLATFORM_CONTROL_CENTER',
          targetId: 'AJ-HUB-01',
          summary: 'Control plane provisioned with PostgreSQL, managed website registries, and security baselines.',
          beforeState: null,
          afterState: { sites: 2, status: 'OPERATIONAL' },
          result: 'SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'AJ Control Plane Engine v1.0',
          correlationId: 'boot-' + Date.now(),
          timestamp: new Date(),
        },
      ]);
      console.log('Seeded audit events');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
}
