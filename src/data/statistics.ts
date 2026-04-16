// Statistics Data - Easily editable configuration
// This file contains all statistics displayed across the application
// Dev account can modify these values through the Admin CMS

export interface StatisticItem {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string; // Icon name as string
  category: 'home' | 'dashboard' | 'marketing';
  isVisible: boolean;
  order: number;
}

export const statisticsData: StatisticItem[] = [
  // Home Page Statistics
  {
    id: 'stat_images_processed',
    label: 'Images Processed',
    value: '50M+',
    description: 'Professional edits delivered',
    icon: 'Image',
    category: 'home',
    isVisible: true,
    order: 1,
  },
  {
    id: 'stat_videos_edited',
    label: 'Videos Edited',
    value: '100K+',
    description: 'Cinematic productions',
    icon: 'Video',
    category: 'home',
    isVisible: true,
    order: 2,
  },
  {
    id: 'stat_happy_clients',
    label: 'Happy Clients',
    value: '10K+',
    description: 'Global customer base',
    icon: 'Users',
    category: 'home',
    isVisible: true,
    order: 3,
  },
  {
    id: 'stat_countries',
    label: 'Countries Served',
    value: '120+',
    description: 'Worldwide reach',
    icon: 'TrendingUp',
    category: 'home',
    isVisible: true,
    order: 4,
  },

  // Dashboard Statistics
  {
    id: 'stat_active_projects',
    label: 'Active Projects',
    value: '1,234',
    description: 'Currently in progress',
    icon: 'Folder',
    category: 'dashboard',
    isVisible: true,
    order: 1,
  },
  {
    id: 'stat_pending_tasks',
    label: 'Pending Tasks',
    value: '567',
    description: 'Awaiting processing',
    icon: 'Clock',
    category: 'dashboard',
    isVisible: true,
    order: 2,
  },
  {
    id: 'stat_completed_today',
    label: 'Completed Today',
    value: '89',
    description: 'Tasks finished today',
    icon: 'CheckCircle',
    category: 'dashboard',
    isVisible: true,
    order: 3,
  },
  {
    id: 'stat_revenue_month',
    label: 'Monthly Revenue',
    value: '$125,000',
    description: 'This month total',
    icon: 'DollarSign',
    category: 'dashboard',
    isVisible: true,
    order: 4,
  },

  // Marketing Statistics
  {
    id: 'stat_retention_rate',
    label: 'Client Retention',
    value: '98%',
    description: 'Repeat customer rate',
    icon: 'Heart',
    category: 'marketing',
    isVisible: true,
    order: 1,
  },
  {
    id: 'stat_avg_turnaround',
    label: 'Avg. Turnaround',
    value: '18h',
    description: 'Average delivery time',
    icon: 'Zap',
    category: 'marketing',
    isVisible: true,
    order: 2,
  },
];

// Get statistics by category
export function getStatisticsByCategory(category: StatisticItem['category']): StatisticItem[] {
  return statisticsData
    .filter(stat => stat.category === category && stat.isVisible)
    .sort((a, b) => a.order - b.order);
}

// Get all visible statistics
export function getAllVisibleStatistics(): StatisticItem[] {
  return statisticsData
    .filter(stat => stat.isVisible)
    .sort((a, b) => a.order - b.order);
}
