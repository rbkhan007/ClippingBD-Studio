// CRUD Configuration - DEV Account Only Can Modify
// This file defines all entities that can be managed through CRUD operations
// ADMIN accounts have full CRUD capabilities, DEV accounts can modify this config

export interface CRUDField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'url' | 'email' | 'date' | 'icon' | 'json';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  isVisible?: boolean;
  isEditable?: boolean;
}

export interface CRUDEntity {
  id: string;
  name: string;
  pluralName: string;
  description: string;
  icon: string;
  category: 'content' | 'users' | 'services' | 'pricing' | 'settings' | 'media';
  fields: CRUDField[];
  permissions: {
    canCreate: ('ADMIN' | 'DEVELOPER' | 'EDITOR' | 'QA' | 'CLIENT')[];
    canRead: ('ADMIN' | 'DEVELOPER' | 'EDITOR' | 'QA' | 'CLIENT')[];
    canUpdate: ('ADMIN' | 'DEVELOPER' | 'EDITOR' | 'QA' | 'CLIENT')[];
    canDelete: ('ADMIN' | 'DEVELOPER')[];
  };
  displayField: string;
  searchFields: string[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  pageSize: number;
  isVisible: boolean;
  order: number;
}

export const crudEntities: CRUDEntity[] = [
  // ============================================
  // SERVICES MANAGEMENT
  // ============================================
  {
    id: 'services',
    name: 'Service',
    pluralName: 'Services',
    description: 'Manage service offerings and pricing tiers',
    icon: 'Layers',
    category: 'services',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'title', type: 'text', label: 'Title', required: true, placeholder: 'e.g., Clipping Path', isVisible: true, isEditable: true },
      { name: 'subtitle', type: 'text', label: 'Subtitle', required: true, placeholder: 'e.g., Precision Background Removal', isVisible: true, isEditable: true },
      { name: 'description', type: 'textarea', label: 'Description', required: true, placeholder: 'Detailed service description...', isVisible: true, isEditable: true },
      { name: 'icon', type: 'icon', label: 'Icon', required: true, defaultValue: 'Layers', isVisible: true, isEditable: true },
      { name: 'href', type: 'text', label: 'URL Path', required: true, placeholder: '/services/clipping-path', isVisible: true, isEditable: true },
      { name: 'gradient', type: 'text', label: 'Gradient Classes', required: true, placeholder: 'from-emerald-500 to-teal-600', isVisible: true, isEditable: true },
      { name: 'stats', type: 'text', label: 'Stats Display', placeholder: 'e.g., 50M+ Images', isVisible: true, isEditable: true },
      { name: 'color', type: 'text', label: 'Color Theme', placeholder: 'emerald, teal, cyan', isVisible: true, isEditable: true },
      { name: 'features', type: 'multiselect', label: 'Features', options: [
        { value: 'basic_clipping', label: 'Basic Clipping Path' },
        { value: 'compound_path', label: 'Compound Path' },
        { value: 'complex_path', label: 'Complex Path' },
        { value: 'multi_path', label: 'Multi-Path' },
        { value: 'shadow', label: 'Shadow Creation' },
        { value: 'color_path', label: 'Color Path' },
      ], isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'title',
    searchFields: ['title', 'subtitle', 'description'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 10,
    isVisible: true,
    order: 1,
  },

  // ============================================
  // PRICING MANAGEMENT
  // ============================================
  {
    id: 'pricing_plans',
    name: 'Pricing Plan',
    pluralName: 'Pricing Plans',
    description: 'Manage subscription plans and pricing',
    icon: 'DollarSign',
    category: 'pricing',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'name', type: 'text', label: 'Plan Name', required: true, placeholder: 'e.g., Professional', isVisible: true, isEditable: true },
      { name: 'description', type: 'textarea', label: 'Description', required: true, isVisible: true, isEditable: true },
      { name: 'monthlyPrice', type: 'number', label: 'Monthly Price ($)', required: true, defaultValue: 0, isVisible: true, isEditable: true },
      { name: 'yearlyPrice', type: 'number', label: 'Yearly Price ($)', required: true, defaultValue: 0, isVisible: true, isEditable: true },
      { name: 'features', type: 'multiselect', label: 'Features', options: [
        { value: 'images_50', label: '50 images/month' },
        { value: 'images_200', label: '200 images/month' },
        { value: 'unlimited', label: 'Unlimited images' },
        { value: 'all_services', label: 'All service types' },
        { value: 'priority', label: 'Priority support' },
        { value: 'api', label: 'API access' },
        { value: 'manager', label: 'Dedicated manager' },
      ], isVisible: true, isEditable: true },
      { name: 'limitations', type: 'multiselect', label: 'Limitations', options: [
        { value: 'no_api', label: 'No API access' },
        { value: 'no_manager', label: 'No dedicated manager' },
        { value: 'watermark', label: 'Watermarked previews' },
      ], isVisible: true, isEditable: true },
      { name: 'isPopular', type: 'boolean', label: 'Mark as Popular', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'isEnterprise', type: 'boolean', label: 'Enterprise Plan', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'maxProjects', type: 'number', label: 'Max Projects (null = unlimited)', isVisible: true, isEditable: true },
      { name: 'maxUsers', type: 'number', label: 'Max Users', defaultValue: 1, isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'name',
    searchFields: ['name', 'description'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 10,
    isVisible: true,
    order: 2,
  },

  // ============================================
  // TESTIMONIALS MANAGEMENT
  // ============================================
  {
    id: 'testimonials',
    name: 'Testimonial',
    pluralName: 'Testimonials',
    description: 'Manage customer testimonials and reviews',
    icon: 'MessageSquare',
    category: 'content',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'name', type: 'text', label: 'Customer Name', required: true, placeholder: 'John Doe', isVisible: true, isEditable: true },
      { name: 'role', type: 'text', label: 'Role/Title', required: true, placeholder: 'CEO, Marketing Director', isVisible: true, isEditable: true },
      { name: 'company', type: 'text', label: 'Company', required: true, placeholder: 'Company name', isVisible: true, isEditable: true },
      { name: 'content', type: 'textarea', label: 'Testimonial', required: true, placeholder: 'What did the customer say?', isVisible: true, isEditable: true, validation: { minLength: 50, maxLength: 500 } },
      { name: 'rating', type: 'number', label: 'Rating (1-5)', required: true, defaultValue: 5, validation: { min: 1, max: 5 }, isVisible: true, isEditable: true },
      { name: 'avatar', type: 'text', label: 'Avatar (Initials or URL)', placeholder: 'JD or https://...', isVisible: true, isEditable: true },
      { name: 'category', type: 'select', label: 'Service Category', options: [
        { value: 'general', label: 'General' },
        { value: 'image', label: 'Image Services' },
        { value: 'video', label: 'Video Services' },
        { value: 'web', label: 'Web Design' },
        { value: 'ai', label: 'AI Operations' },
      ], defaultValue: 'general', isVisible: true, isEditable: true },
      { name: 'isFeatured', type: 'boolean', label: 'Featured', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'name',
    searchFields: ['name', 'company', 'content'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 10,
    isVisible: true,
    order: 3,
  },

  // ============================================
  // STATISTICS MANAGEMENT
  // ============================================
  {
    id: 'statistics',
    name: 'Statistic',
    pluralName: 'Statistics',
    description: 'Manage displayed statistics and metrics',
    icon: 'TrendingUp',
    category: 'content',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'label', type: 'text', label: 'Label', required: true, placeholder: 'e.g., Images Processed', isVisible: true, isEditable: true },
      { name: 'value', type: 'text', label: 'Value', required: true, placeholder: 'e.g., 50M+', isVisible: true, isEditable: true },
      { name: 'description', type: 'text', label: 'Description', placeholder: 'Brief description', isVisible: true, isEditable: true },
      { name: 'icon', type: 'icon', label: 'Icon', defaultValue: 'Image', isVisible: true, isEditable: true },
      { name: 'category', type: 'select', label: 'Category', options: [
        { value: 'home', label: 'Home Page' },
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'marketing', label: 'Marketing' },
      ], defaultValue: 'home', isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'label',
    searchFields: ['label', 'value', 'description'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 20,
    isVisible: true,
    order: 4,
  },

  // ============================================
  // FEATURES MANAGEMENT
  // ============================================
  {
    id: 'features',
    name: 'Feature',
    pluralName: 'Features',
    description: 'Manage features and highlights displayed on site',
    icon: 'Zap',
    category: 'content',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'title', type: 'text', label: 'Title', required: true, placeholder: 'e.g., 24-Hour Turnaround', isVisible: true, isEditable: true },
      { name: 'description', type: 'textarea', label: 'Description', required: true, isVisible: true, isEditable: true },
      { name: 'icon', type: 'icon', label: 'Icon', defaultValue: 'Zap', isVisible: true, isEditable: true },
      { name: 'gradient', type: 'text', label: 'Gradient Classes', placeholder: 'from-emerald-500 to-teal-500', isVisible: true, isEditable: true },
      { name: 'category', type: 'select', label: 'Category', options: [
        { value: 'why_us', label: 'Why Choose Us' },
        { value: 'security', label: 'Security' },
        { value: 'nitro', label: 'Nitro Features' },
        { value: 'support', label: 'Support' },
        { value: 'platform', label: 'Platform' },
      ], defaultValue: 'why_us', isVisible: true, isEditable: true },
      { name: 'isHighlighted', type: 'boolean', label: 'Highlighted', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'title',
    searchFields: ['title', 'description'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 20,
    isVisible: true,
    order: 5,
  },

  // ============================================
  // FAQ MANAGEMENT
  // ============================================
  {
    id: 'faqs',
    name: 'FAQ',
    pluralName: 'FAQs',
    description: 'Manage frequently asked questions',
    icon: 'HelpCircle',
    category: 'content',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'question', type: 'text', label: 'Question', required: true, placeholder: 'e.g., How do I get started?', isVisible: true, isEditable: true },
      { name: 'answer', type: 'textarea', label: 'Answer', required: true, placeholder: 'Provide a helpful answer...', isVisible: true, isEditable: true },
      { name: 'category', type: 'select', label: 'Category', options: [
        { value: 'general', label: 'General' },
        { value: 'pricing', label: 'Pricing' },
        { value: 'services', label: 'Services' },
        { value: 'technical', label: 'Technical' },
        { value: 'account', label: 'Account' },
      ], defaultValue: 'general', isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'question',
    searchFields: ['question', 'answer'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 20,
    isVisible: true,
    order: 6,
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================
  {
    id: 'users',
    name: 'User',
    pluralName: 'Users',
    description: 'Manage user accounts and permissions',
    icon: 'Users',
    category: 'users',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'user@example.com', isVisible: true, isEditable: true },
      { name: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'John Doe', isVisible: true, isEditable: true },
      { name: 'role', type: 'select', label: 'Role', required: true, options: [
        { value: 'CLIENT', label: 'Client' },
        { value: 'EDITOR', label: 'Editor' },
        { value: 'QA', label: 'QA' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'DEVELOPER', label: 'Developer' },
      ], defaultValue: 'CLIENT', isVisible: true, isEditable: true },
      { name: 'status', type: 'select', label: 'Status', options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ], defaultValue: 'active', isVisible: true, isEditable: true },
      { name: 'company', type: 'text', label: 'Company', placeholder: 'Company name', isVisible: true, isEditable: true },
      { name: 'phone', type: 'text', label: 'Phone', placeholder: '+1 234 567 8900', isVisible: true, isEditable: true },
      { name: 'avatar', type: 'url', label: 'Avatar URL', placeholder: 'https://...', isVisible: true, isEditable: true },
      { name: 'createdAt', type: 'date', label: 'Created', isVisible: true, isEditable: false },
      { name: 'lastLogin', type: 'date', label: 'Last Login', isVisible: true, isEditable: false },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'name',
    searchFields: ['name', 'email', 'company'],
    sortField: 'createdAt',
    sortDirection: 'desc',
    pageSize: 20,
    isVisible: true,
    order: 7,
  },

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================
  {
    id: 'orders',
    name: 'Order',
    pluralName: 'Orders',
    description: 'Manage client orders and projects',
    icon: 'ShoppingCart',
    category: 'services',
    fields: [
      { name: 'id', type: 'text', label: 'Order ID', required: true, isVisible: true, isEditable: false },
      { name: 'clientId', type: 'text', label: 'Client ID', required: true, isVisible: true, isEditable: false },
      { name: 'clientName', type: 'text', label: 'Client Name', isVisible: true, isEditable: false },
      { name: 'service', type: 'select', label: 'Service Type', required: true, options: [
        { value: 'clipping_path', label: 'Clipping Path' },
        { value: 'image_editing', label: 'Image Editing' },
        { value: 'video_editing', label: 'Video Editing' },
        { value: 'ai_services', label: 'AI Services' },
        { value: 'web_design', label: 'Web Design' },
      ], isVisible: true, isEditable: true },
      { name: 'status', type: 'select', label: 'Status', required: true, options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'revision', label: 'Revision' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ], defaultValue: 'pending', isVisible: true, isEditable: true },
      { name: 'priority', type: 'select', label: 'Priority', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'nitro', label: 'Nitro Express' },
      ], defaultValue: 'normal', isVisible: true, isEditable: true },
      { name: 'quantity', type: 'number', label: 'Quantity', required: true, isVisible: true, isEditable: true },
      { name: 'totalAmount', type: 'number', label: 'Total Amount ($)', required: true, isVisible: true, isEditable: true },
      { name: 'deadline', type: 'date', label: 'Deadline', isVisible: true, isEditable: true },
      { name: 'notes', type: 'textarea', label: 'Notes', isVisible: true, isEditable: true },
      { name: 'createdAt', type: 'date', label: 'Created', isVisible: true, isEditable: false },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER', 'EDITOR'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'id',
    searchFields: ['id', 'clientName', 'service'],
    sortField: 'createdAt',
    sortDirection: 'desc',
    pageSize: 20,
    isVisible: true,
    order: 8,
  },

  // ============================================
  // SITE SETTINGS
  // ============================================
  {
    id: 'site_settings',
    name: 'Site Setting',
    pluralName: 'Site Settings',
    description: 'Manage site-wide settings and configurations',
    icon: 'Settings',
    category: 'settings',
    fields: [
      { name: 'key', type: 'text', label: 'Setting Key', required: true, placeholder: 'e.g., site_name', isVisible: true, isEditable: true },
      { name: 'value', type: 'text', label: 'Value', required: true, isVisible: true, isEditable: true },
      { name: 'type', type: 'select', label: 'Value Type', options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'color', label: 'Color' },
        { value: 'url', label: 'URL' },
        { value: 'email', label: 'Email' },
        { value: 'json', label: 'JSON' },
      ], defaultValue: 'text', isVisible: true, isEditable: true },
      { name: 'category', type: 'select', label: 'Category', options: [
        { value: 'general', label: 'General' },
        { value: 'branding', label: 'Branding' },
        { value: 'seo', label: 'SEO' },
        { value: 'features', label: 'Features' },
        { value: 'limits', label: 'Limits' },
        { value: 'notifications', label: 'Notifications' },
      ], defaultValue: 'general', isVisible: true, isEditable: true },
      { name: 'label', type: 'text', label: 'Display Label', required: true, placeholder: 'Site Name', isVisible: true, isEditable: true },
      { name: 'description', type: 'textarea', label: 'Description', isVisible: true, isEditable: true },
      { name: 'isPublic', type: 'boolean', label: 'Public', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'isDevOnly', type: 'boolean', label: 'Dev Only', defaultValue: false, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER'],
      canUpdate: ['DEVELOPER'],
      canDelete: ['DEVELOPER'],
    },
    displayField: 'label',
    searchFields: ['key', 'label', 'category'],
    sortField: 'category',
    sortDirection: 'asc',
    pageSize: 50,
    isVisible: true,
    order: 9,
  },

  // ============================================
  // PORTFOLIO/PROJECTS
  // ============================================
  {
    id: 'portfolio',
    name: 'Portfolio Item',
    pluralName: 'Portfolio',
    description: 'Manage portfolio projects and showcases',
    icon: 'Image',
    category: 'media',
    fields: [
      { name: 'id', type: 'text', label: 'ID', required: true, isVisible: false },
      { name: 'title', type: 'text', label: 'Project Title', required: true, placeholder: 'e.g., Fashion E-commerce', isVisible: true, isEditable: true },
      { name: 'client', type: 'text', label: 'Client Name', placeholder: 'Client name (optional)', isVisible: true, isEditable: true },
      { name: 'description', type: 'textarea', label: 'Description', required: true, isVisible: true, isEditable: true },
      { name: 'service', type: 'select', label: 'Service Type', options: [
        { value: 'clipping_path', label: 'Clipping Path' },
        { value: 'image_editing', label: 'Image Editing' },
        { value: 'video_editing', label: 'Video Editing' },
        { value: 'web_design', label: 'Web Design' },
      ], isVisible: true, isEditable: true },
      { name: 'thumbnailUrl', type: 'url', label: 'Thumbnail URL', required: true, placeholder: 'https://...', isVisible: true, isEditable: true },
      { name: 'beforeAfterImages', type: 'json', label: 'Before/After URLs', isVisible: true, isEditable: true },
      { name: 'tags', type: 'multiselect', label: 'Tags', options: [
        { value: 'fashion', label: 'Fashion' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'product', label: 'Product' },
        { value: 'retouching', label: 'Retouching' },
        { value: 'video', label: 'Video' },
      ], isVisible: true, isEditable: true },
      { name: 'isFeatured', type: 'boolean', label: 'Featured', defaultValue: false, isVisible: true, isEditable: true },
      { name: 'isVisible', type: 'boolean', label: 'Visible', defaultValue: true, isVisible: true, isEditable: true },
      { name: 'order', type: 'number', label: 'Sort Order', defaultValue: 1, isVisible: true, isEditable: true },
    ],
    permissions: {
      canCreate: ['ADMIN', 'DEVELOPER'],
      canRead: ['ADMIN', 'DEVELOPER', 'EDITOR', 'QA', 'CLIENT'],
      canUpdate: ['ADMIN', 'DEVELOPER'],
      canDelete: ['ADMIN', 'DEVELOPER'],
    },
    displayField: 'title',
    searchFields: ['title', 'client', 'description'],
    sortField: 'order',
    sortDirection: 'asc',
    pageSize: 20,
    isVisible: true,
    order: 10,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get entity by ID
export function getEntityById(id: string): CRUDEntity | undefined {
  return crudEntities.find(entity => entity.id === id);
}

// Get entities by category
export function getEntitiesByCategory(category: CRUDEntity['category']): CRUDEntity[] {
  return crudEntities
    .filter(entity => entity.category === category && entity.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Get all visible entities
export function getAllVisibleEntities(): CRUDEntity[] {
  return crudEntities
    .filter(entity => entity.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Check if user has permission
export function hasPermission(
  entity: CRUDEntity,
  action: 'create' | 'read' | 'update' | 'delete',
  userRole: string
): boolean {
  const permissions = entity.permissions[action];
  return (permissions as readonly string[]).includes(userRole);
}

// Get entities user can manage
export function getManageableEntities(
  userRole: 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'QA' | 'CLIENT'
): CRUDEntity[] {
  return crudEntities.filter(entity => 
    entity.isVisible && hasPermission(entity, 'read', userRole)
  );
}

// Get entity categories
export const entityCategories = [
  { id: 'content', name: 'Content', icon: 'FileText', description: 'Manage site content' },
  { id: 'users', name: 'Users', icon: 'Users', description: 'Manage user accounts' },
  { id: 'services', name: 'Services', icon: 'Layers', description: 'Manage services' },
  { id: 'pricing', name: 'Pricing', icon: 'DollarSign', description: 'Manage pricing' },
  { id: 'settings', name: 'Settings', icon: 'Settings', description: 'Site settings' },
  { id: 'media', name: 'Media', icon: 'Image', description: 'Media and portfolio' },
];
