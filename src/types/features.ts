/**
 * ClippingBD Studio - Role-Based Feature Definitions
 * 
 * This file defines all features accessible to each user role.
 * Use this for documentation, UI filtering, and access control.
 */

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'QA' | 'CLIENT' | 'PARTNER' | 'GUEST';

export interface RoleFeatures {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
  features: FeatureCategory[];
}

export interface FeatureCategory {
  category: string;
  features: Feature[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  route?: string;
  icon?: string;
}

/* ============================================
   ADMIN FEATURES
   ============================================ */
export const AdminFeatures: RoleFeatures = {
  role: 'ADMIN',
  label: 'Administrator',
  description: 'Full Control - Site Owner. Manage platform, users, content, and business operations.',
  permissions: [
    'manage_users',
    'manage_content', 
    'view_analytics',
    'manage_payments',
    'manage_system',
    'view_audit_logs',
    'approve_editors',
    'manage_settings'
  ],
  features: [
    {
      category: 'User Management',
      features: [
        { id: 'admin.users.view', name: 'View All Users', description: 'View list of all registered users', route: '/dashboard/users' },
        { id: 'admin.users.approve', name: 'Approve Reject Users', description: 'Approve or reject new user registrations' },
        { id: 'admin.users.roles', name: 'Assign Roles', description: 'Assign or change user roles' },
        { id: 'admin.users.block', name: 'Block Suspend Users', description: 'Block or suspend user accounts' },
        { id: 'admin.users.activity', name: 'View User Activity', description: 'View user login history and activity' }
      ]
    },
    {
      category: 'Content Management (CMS)',
      features: [
        { id: 'admin.cms.pages', name: 'Edit Public Pages', description: 'Edit Home, Services, Pricing, Portfolio, Studio, Team, Contact', route: '/dashboard/cms/pages' },
        { id: 'admin.cms.services', name: 'Manage Services', description: 'Add/edit/delete services with pricing' },
        { id: 'admin.cms.portfolio', name: 'Manage Portfolio', description: 'Add Before/After images and client projects' },
        { id: 'admin.cms.team', name: 'Manage Team', description: 'Add/edit team member profiles' },
        { id: 'admin.cms.testimonials', name: 'Manage Testimonials', description: 'Approve/reject client testimonials' },
        { id: 'admin.cms.settings', name: 'Site Settings', description: 'Logo, contact info, social links configuration' }
      ]
    },
    {
      category: 'Analytics Reports',
      features: [
        { id: 'admin.analytics.dashboard', name: 'Revenue Dashboard', description: 'Revenue metrics and KPIs', route: '/dashboard' },
        { id: 'admin.analytics.orders', name: 'Order Statistics', description: 'Order volume, status breakdown' },
        { id: 'admin.analytics.users', name: 'User Growth', description: 'User registration and retention metrics' },
        { id: 'admin.analytics.editors', name: 'Editor Performance', description: 'Editor productivity and quality scores' },
        { id: 'admin.analytics.services', name: 'Service Popularity', description: 'Most ordered services and trends' },
        { id: 'admin.analytics.export', name: 'Export Reports', description: 'Export to PDF, CSV, Excel formats' }
      ]
    },
    {
      category: 'Payments Finance',
      features: [
        { id: 'admin.payment.gateways', name: 'Payment Gateways', description: 'Manage Stripe, bKash, Nagad integrations', route: '/dashboard/payments' },
        { id: 'admin.payment.transactions', name: 'All Transactions', description: 'View all payment transactions' },
        { id: 'admin.payment.wallets', name: 'Wallet Management', description: 'Manage user wallet credits' },
        { id: 'admin.payment.payouts', name: 'Editor Payouts', description: 'Approve editor payout requests' },
        { id: 'admin.payment.invoices', name: 'Invoice Generation', description: 'Generate and manage invoices' }
      ]
    },
    {
      category: 'System Management',
      features: [
        { id: 'admin.system.health', name: 'System Health', description: 'Server, database, cache status', route: '/dashboard/system' },
        { id: 'admin.system.features', name: 'Feature Flags', description: 'Enable/disable features' },
        { id: 'admin.system.notifications', name: 'Email SMS Config', description: 'Configure notification templates' },
        { id: 'admin.system.backup', name: 'Backup Recovery', description: 'Database backup and restore' },
        { id: 'admin.system.api', name: 'API Key Management', description: 'Manage API keys for external integrations' }
      ]
    },
    {
      category: 'Security',
      features: [
        { id: 'admin.security.audit', name: 'Audit Logs', description: 'View all admin actions and changes' },
        { id: 'admin.security.rate', name: 'Rate Limiting', description: 'Configure API rate limits' },
        { id: 'admin.security.approval', name: 'User Approval Workflow', description: 'Require admin approval for new users' }
      ]
    }
  ]
};

/* ============================================
   CLIENT FEATURES  
   ============================================ */
export const ClientFeatures: RoleFeatures = {
  role: 'CLIENT',
  label: 'Client',
  description: 'Customer Portal - Submit work, track projects, communicate, and manage payments.',
  permissions: [
    'create_orders',
    'view_orders',
    'upload_files',
    'chat',
    'manage_wallet',
    'create_tickets',
    'view_reviews'
  ],
  features: [
    {
      category: 'Dashboard',
      features: [
        { id: 'client.dashboard.overview', name: 'Overview', description: 'Active orders, quick stats', route: '/dashboard' },
        { id: 'client.dashboard.activity', name: 'Recent Activity', description: 'Activity feed of recent updates' }
      ]
    },
    {
      category: 'Projects Orders',
      features: [
        { id: 'client.orders.view', name: 'View All Orders', description: 'List of all your projects', route: '/dashboard/projects' },
        { id: 'client.orders.create', name: 'Create New Project', description: '5-step project wizard to submit work', route: '/dashboard/new-project' },
        { id: 'client.orders.track', name: 'Track Status', description: 'Real-time project status tracking' },
        { id: 'client.orders.details', name: 'View Details', description: 'Project brief and timeline' }
      ]
    },
    {
      category: 'File Management',
      features: [
        { id: 'client.files.upload', name: 'Upload Files', description: 'Upload source images/videos', route: '/dashboard/upload' },
        { id: 'client.files.download', name: 'Download Results', description: 'Download delivered final files' },
        { id: 'client.files.view', name: 'Safe-View', description: 'Secure preview without download' }
      ]
    },
    {
      category: 'Communication',
      features: [
        { id: 'client.chat.realtime', name: 'Real-time Chat', description: 'Chat with Editor/QA/Admin', route: '/dashboard/messages' },
        { id: 'client.chat.inbox', name: 'Message Inbox', description: 'View all conversations' }
      ]
    },
    {
      category: 'Billing Payments',
      features: [
        { id: 'client.billing.wallet', name: 'Wallet Balance', description: 'View balance and top-up', route: '/dashboard/billing' },
        { id: 'client.billing.topup', name: 'Add Funds', description: 'Add money to wallet (Stripe, bKash)' },
        { id: 'client.billing.history', name: 'Transaction History', description: 'All deposits and payments' },
        { id: 'client.billing.methods', name: 'Payment Methods', description: 'Manage saved payment methods' },
        { id: 'client.billing.invoices', name: 'Download Invoices', description: 'View and download invoices' }
      ]
    },
    {
      category: 'Support',
      features: [
        { id: 'client.support.tickets', name: 'Create Ticket', description: 'Submit support tickets', route: '/dashboard/support' },
        { id: 'client.support.status', name: 'View Status', description: 'Track ticket resolution status' }
      ]
    },
    {
      category: 'Profile',
      features: [
        { id: 'client.profile.info', name: 'Personal Information', description: 'Update name, company, contact' },
        { id: 'client.profile.password', name: 'Change Password', description: 'Update account password' },
        { id: 'client.profile.notifications', name: 'Notification Preferences', description: 'Email/SMS notification settings' }
      ]
    }
  ]
};

/* ============================================
   EDITOR FEATURES
   ============================================ */
export const EditorFeatures: RoleFeatures = {
  role: 'EDITOR',
  label: 'Editor',
  description: 'Production Team - Execute editing tasks and deliver work.',
  permissions: [
    'view_tasks',
    'claim_tasks',
    'upload_deliverables',
    'view_earnings',
    'request_payout'
  ],
  features: [
    {
      category: 'Task Board',
      features: [
        { id: 'editor.board.kanban', name: 'Kanban Board', description: 'To Do, In Progress, Review, Done columns', route: '/editor/jobs' },
        { id: 'editor.board.drag', name: 'Drag Drop', description: 'Drag tasks between columns' }
      ]
    },
    {
      category: 'Work Queue',
      features: [
        { id: 'editor.queue.assigned', name: 'Assigned Tasks', description: 'List of tasks assigned to you', route: '/editor/queue' },
        { id: 'editor.queue.priority', name: 'Priority Queue', description: 'Sorted by priority and deadline' }
      ]
    },
    {
      category: 'Task Details',
      features: [
        { id: 'editor.task.brief', name: 'View Brief', description: 'Project requirements and instructions' },
        { id: 'editor.task.files', name: 'Download Sources', description: 'Access client source files' },
        { id: 'editor.task.upload', name: 'Submit Work', description: 'Upload edited deliverables' }
      ]
    },
    {
      category: 'File Handling',
      features: [
        { id: 'editor.files.secure', name: 'Secure Asset Access', description: 'Access files for active tasks only' },
        { id: 'editor.files.submit', name: 'Submit for QA', description: 'Upload completed work for review' }
      ]
    },
    {
      category: 'Earnings',
      features: [
        { id: 'editor.earnings.tracker', name: 'Earnings Tracker', description: 'Personal earnings dashboard', route: '/editor/earnings' },
        { id: 'editor.earnings.payout', name: 'Request Payout', description: 'Request payment to bank/PayPal' },
        { id: 'editor.earnings.history', name: 'Payment History', description: 'Past payouts and transactions' }
      ]
    },
    {
      category: 'Profile',
      features: [
        { id: 'editor.profile.availability', name: 'Availability', description: 'Set available hours' },
        { id: 'editor.profile.skills', name: 'Skills Expertise', description: 'Tags for expertise areas' }
      ]
    }
  ]
};

/* ============================================
   QA FEATURES
   ============================================ */
export const QAFeatures: RoleFeatures = {
  role: 'QA',
  label: 'QA (Quality Assurance)',
  description: 'Quality Assurance - Review and ensure quality standards.',
  permissions: [
    'view_review_queue',
    'approve_work',
    'request_revisions',
    'view_stats'
  ],
  features: [
    {
      category: 'Review Queue',
      features: [
        { id: 'qa.queue.list', name: 'Submission Queue', description: 'List of submissions waiting for review', route: '/qa/queue' },
        { id: 'qa.queue.priority', name: 'Priority Sort', description: 'Sort by submission date/priority' }
      ]
    },
    {
      category: 'Review Interface',
      features: [
        { id: 'qa.review.compare', name: 'Side-by-Side', description: 'Before/after comparison view' },
        { id: 'qa.review.annotate', name: 'Annotation Tools', description: 'Mark problem areas on image' },
        { id: 'qa.review.score', name: 'Quality Scoring', description: 'Rate quality 1-10' }
      ]
    },
    {
      category: 'Approval Workflow',
      features: [
        { id: 'qa.workflow.approve', name: 'Approve Work', description: 'Approve and mark complete' },
        { id: 'qa.workflow.reject', name: 'Reject Work', description: 'Reject with reason' },
        { id: 'qa.workflow.feedback', name: 'Provide Feedback', description: 'Detailed revision instructions' }
      ]
    },
    {
      category: 'Revision Management',
      features: [
        { id: 'qa.revision.track', name: 'Track Revisions', description: 'View all revision requests' },
        { id: 'qa.revision.review', name: 'Re-review', description: 'Review resubmitted work' }
      ]
    },
    {
      category: 'Dashboard',
      features: [
        { id: 'qa.dashboard.stats', name: 'Statistics', description: 'Personal review metrics', route: '/qa' },
        { id: 'qa.dashboard.pending', name: 'Pending Reviews', description: 'Count of pending reviews' },
        { id: 'qa.dashboard.completed', name: 'Completed', description: 'Count of completed reviews' }
      ]
    }
  ]
};

/* ============================================
   PARTNER FEATURES
   ============================================ */
export const PartnerFeatures: RoleFeatures = {
  role: 'PARTNER',
  label: 'Partner (External Editor)',
  description: 'External freelance editors with application-based job system.',
  permissions: [
    'apply_jobs',
    'same_as_editor',
    'view_public_profile'
  ],
  features: [
    {
      category: 'Partner Dashboard',
      features: [
        { id: 'partner.dashboard.jobs', name: 'Available Jobs', description: 'Open jobs for external editors', route: '/partner/jobs' },
        { id: 'partner.dashboard.apply', name: 'Application System', description: 'Apply for available positions' }
      ]
    }
  ]
};

/* ============================================
   DEVELOPER FEATURES
   ============================================ */
export const DeveloperFeatures: RoleFeatures = {
  role: 'DEVELOPER',
  label: 'Developer',
  description: 'Tech Admin - Technical oversight and system maintenance.',
  permissions: [
    'admin_all',
    'view_system',
    'manage_config',
    'view_logs',
    'backup_restore'
  ],
  features: [
    {
      category: 'System Health',
      features: [
        { id: 'dev.health.overview', name: 'Real-time Status', description: 'Server, DB, cache metrics', route: '/dev/system' },
        { id: 'dev.health.api', name: 'API Response Times', description: 'Monitor API performance' }
      ]
    },
    {
      category: 'Configuration',
      features: [
        { id: 'dev.config.env', name: 'Environment Variables', description: 'View/edit env vars' },
        { id: 'dev.config.features', name: 'Feature Flags', description: 'Toggle features on/off' }
      ]
    },
    {
      category: 'API Documentation',
      features: [
        { id: 'dev.api.docs', name: 'Interactive API Docs', description: 'Swagger/OpenAPI docs with examples', route: '/dev/api' }
      ]
    },
    {
      category: 'Logs Monitoring',
      features: [
        { id: 'dev.logs.app', name: 'Application Logs', description: 'View app error logs' },
        { id: 'dev.logs.audit', name: 'User Activity Audit', description: 'Track user actions' }
      ]
    },
    {
      category: 'Backup Recovery',
      features: [
        { id: 'dev.backup.database', name: 'Database Backup', description: 'Manual and scheduled backups' },
        { id: 'dev.backup.restore', name: 'Restore Database', description: 'Restore from backup file' },
        { id: 'dev.backup.disaster', name: 'Disaster Recovery', description: 'Recovery procedures' }
      ]
    },
    {
      category: 'Developer Tools',
      features: [
        { id: 'dev.tools.prisma', name: 'Prisma Studio', description: 'Database GUI access' },
        { id: 'dev.tools.diagnostics', name: 'System Diagnostics', description: 'Run system health checks' },
        { id: 'dev.tools.seeding', name: 'Test Data Seeding', description: 'Generate test data' }
      ]
    }
  ]
};

/* ============================================
   GUEST FEATURES
   ============================================ */
export const GuestFeatures: RoleFeatures = {
  role: 'GUEST',
  label: 'Guest',
  description: 'Public visitor with no authentication required.',
  permissions: ['view_public'],
  features: [
    {
      category: 'Public Pages',
      features: [
        { id: 'guest.home', name: 'Home Page', description: 'Landing page', route: '/' },
        { id: 'guest.services', name: 'Services', description: 'Service listing', route: '/services' },
        { id: 'guest.pricing', name: 'Pricing', description: 'Pricing plans', route: '/pricing' },
        { id: 'guest.portfolio', name: 'Portfolio', description: 'Work samples', route: '/portfolio' },
        { id: 'guest.contact', name: 'Contact', description: 'Contact form', route: '/contact' }
      ]
    },
    {
      category: 'Auth',
      features: [
        { id: 'guest.login', name: 'Login', description: 'Sign in to account', route: '/auth' },
        { id: 'guest.signup', name: 'Register', description: 'Create new account', route: '/auth' }
      ]
    }
  ]
};

/* ============================================
   EXPORT ALL ROLES
   ============================================ */
export const AllRoleFeatures: RoleFeatures[] = [
  AdminFeatures,
  DeveloperFeatures,
  QAFeatures,
  EditorFeatures,
  ClientFeatures,
  PartnerFeatures,
  GuestFeatures
];

/* Helper function to check if role has feature */
export function hasFeature(role: UserRole, featureId: string): boolean {
  const roleFeatures = AllRoleFeatures.find(f => f.role === role);
  if (!roleFeatures) return false;
  
  return roleFeatures.features.some(category =>
    category.features.some(f => f.id === featureId)
  );
}

/* Get all features for a role */
export function getFeaturesForRole(role: UserRole): RoleFeatures | undefined {
  return AllRoleFeatures.find(f => f.role === role);
}

export default AllRoleFeatures;