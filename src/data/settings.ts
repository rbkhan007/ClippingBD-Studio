// Site Settings - Easily editable configuration
// Dev account can modify these values through the Admin CMS

export interface SiteSetting {
  key: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'color' | 'url' | 'email' | 'json';
  category: 'general' | 'branding' | 'seo' | 'features' | 'limits' | 'notifications';
  label: string;
  description: string;
  isPublic: boolean; // Can be seen by non-admin users
  isEditable: boolean; // Can be edited by admin
  isDevOnly: boolean; // Only dev can change
}

export const siteSettings: SiteSetting[] = [
  // General Settings
  {
    key: 'site_name',
    value: 'ClippingPath & Website Services Studio',
    type: 'text',
    category: 'general',
    label: 'Site Name',
    description: 'The name of your website displayed in headers and titles',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'site_tagline',
    value: 'Professional Image & Video Editing Services',
    type: 'text',
    category: 'general',
    label: 'Site Tagline',
    description: 'Short tagline displayed next to the logo',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'support_email',
    value: 'support@clippingbd.com',
    type: 'email',
    category: 'general',
    label: 'Support Email',
    description: 'Main support email address',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'support_phone',
    value: '+1 (555) 123-4567',
    type: 'text',
    category: 'general',
    label: 'Support Phone',
    description: 'Customer support phone number',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },

  // Branding Settings
  {
    key: 'primary_color',
    value: '#10b981',
    type: 'color',
    category: 'branding',
    label: 'Primary Color',
    description: 'Main brand color (emerald)',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'secondary_color',
    value: '#14b8a6',
    type: 'color',
    category: 'branding',
    label: 'Secondary Color',
    description: 'Secondary brand color (teal)',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'accent_color',
    value: '#06b6d4',
    type: 'color',
    category: 'branding',
    label: 'Accent Color',
    description: 'Accent color for highlights',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'logo_url',
    value: '/icon', // Next.js 16 dynamic icon route
    type: 'url',
    category: 'branding',
    label: 'Logo URL',
    description: 'URL to the site logo (dynamically generated)',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'favicon_url',
    value: '/favicon.ico',
    type: 'url',
    category: 'branding',
    label: 'Favicon URL',
    description: 'URL to the site favicon',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },

  // SEO Settings
  {
    key: 'meta_title',
    value: 'ClippingPath & Website Services Studio - Professional Image & Video Editing Services',
    type: 'text',
    category: 'seo',
    label: 'Meta Title',
    description: 'Default meta title for SEO',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'meta_description',
    value: 'Precision Clipping Paths • Professional Image & Video Editing • Complete Web Design & Development Solutions',
    type: 'text',
    category: 'seo',
    label: 'Meta Description',
    description: 'Default meta description for SEO',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'meta_keywords',
    value: 'Clipping Path, Image Editing, Video Editing, Retouching, Color Correction, E-commerce, AI Automation, Web Development',
    type: 'text',
    category: 'seo',
    label: 'Meta Keywords',
    description: 'Keywords for SEO (comma-separated)',
    isPublic: true,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'google_analytics_id',
    value: '',
    type: 'text',
    category: 'seo',
    label: 'Google Analytics ID',
    description: 'Google Analytics tracking ID',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },

  // Feature Toggles
  {
    key: 'feature_chat_enabled',
    value: true,
    type: 'boolean',
    category: 'features',
    label: 'Enable Chat',
    description: 'Enable real-time chat system',
    isPublic: true,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'feature_notifications_enabled',
    value: true,
    type: 'boolean',
    category: 'features',
    label: 'Enable Notifications',
    description: 'Enable real-time notifications',
    isPublic: true,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'feature_nitro_enabled',
    value: true,
    type: 'boolean',
    category: 'features',
    label: 'Enable Nitro Priority',
    description: 'Enable Nitro express delivery option',
    isPublic: true,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'feature_ai_upload_enabled',
    value: true,
    type: 'boolean',
    category: 'features',
    label: 'Enable AI Upload',
    description: 'Enable AI-powered image analysis on upload',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'feature_signup_enabled',
    value: true,
    type: 'boolean',
    category: 'features',
    label: 'Enable Signups',
    description: 'Allow new user registrations',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'feature_maintenance_mode',
    value: false,
    type: 'boolean',
    category: 'features',
    label: 'Maintenance Mode',
    description: 'Show maintenance page to non-admin users',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },

  // Limit Settings
  {
    key: 'limit_free_trial_images',
    value: 3,
    type: 'number',
    category: 'limits',
    label: 'Free Trial Images',
    description: 'Number of free images for trial users',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'limit_max_file_size_mb',
    value: 100,
    type: 'number',
    category: 'limits',
    label: 'Max File Size (MB)',
    description: 'Maximum file upload size in megabytes',
    isPublic: true,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'limit_max_batch_upload',
    value: 500,
    type: 'number',
    category: 'limits',
    label: 'Max Batch Upload',
    description: 'Maximum files per batch upload',
    isPublic: true,
    isEditable: true,
    isDevOnly: true,
  },
  {
    key: 'limit_min_wallet_balance',
    value: 0,
    type: 'number',
    category: 'limits',
    label: 'Min Wallet Balance',
    description: 'Minimum wallet balance required to place orders',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },

  // Notification Settings
  {
    key: 'notification_email_on_order',
    value: true,
    type: 'boolean',
    category: 'notifications',
    label: 'Email on New Order',
    description: 'Send email notification for new orders',
    isPublic: false,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'notification_email_on_delivery',
    value: true,
    type: 'boolean',
    category: 'notifications',
    label: 'Email on Delivery',
    description: 'Send email notification when order is delivered',
    isPublic: false,
    isEditable: true,
    isDevOnly: false,
  },
  {
    key: 'notification_slack_webhook',
    value: '',
    type: 'url',
    category: 'notifications',
    label: 'Slack Webhook URL',
    description: 'Slack webhook for notifications',
    isPublic: false,
    isEditable: true,
    isDevOnly: true,
  },
];

// Get setting by key
export function getSetting(key: string): SiteSetting | undefined {
  return siteSettings.find(s => s.key === key);
}

// Get settings by category
export function getSettingsByCategory(category: SiteSetting['category']): SiteSetting[] {
  return siteSettings.filter(s => s.category === category);
}

// Get public settings (for frontend)
export function getPublicSettings(): SiteSetting[] {
  return siteSettings.filter(s => s.isPublic);
}

// Get editable settings (for admin)
export function getEditableSettings(): SiteSetting[] {
  return siteSettings.filter(s => s.isEditable);
}

// Get dev-only settings
export function getDevOnlySettings(): SiteSetting[] {
  return siteSettings.filter(s => s.isDevOnly);
}

// Get settings as object
export function getSettingsObject(): Record<string, string | number | boolean> {
  return siteSettings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string | number | boolean>);
}
