import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// Types for the response
interface DashboardStats {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeTasks: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
  ordersByStatus: Record<string, number>;
  tasksByDepartment: Record<string, number>;
  activeUsers: number;
  revenueTrend: Array<{ month: string; revenue: number }>;
  ordersByServiceType: Array<{ service: string; count: number; revenue: number }>;
  recentActivity: {
    orders: Array<{
      id: string;
      orderNumber: string;
      title: string;
      status: string;
      totalAmount: number;
      client: { name: string | null; email: string };
      createdAt: Date;
    }>;
    tasks: Array<{
      id: string;
      status: string;
      department: string;
      editor: { name: string | null; email: string } | null;
      order: { orderNumber: string; title: string };
      createdAt: Date;
    }>;
    users: Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      createdAt: Date;
    }>;
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      status: string;
      user: { name: string | null; email: string };
      createdAt: Date;
    }>;
  };
  departmentPerformance: Array<{
    department: string;
    activeTasks: number;
    completedTasks: number;
    averageCompletionTime: number | null;
    totalPayouts: number;
  }>;
}

interface AnalyticsStats {
  timeRange: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    orders: {
      total: number;
      byStatus: Record<string, number>;
      byServiceType: Record<string, number>;
      growth: number;
    };
    revenue: {
      total: number;
      byService: Array<{ service: string; revenue: number }>;
      growth: number;
    };
    tasks: {
      total: number;
      completed: number;
      byDepartment: Record<string, number>;
      avgCompletionTime: number | null;
    };
    users: {
      new: number;
      active: number;
      byRole: Record<string, number>;
    };
  };
  trends: {
    daily: Array<{ date: string; orders: number; revenue: number }>;
    weekly: Array<{ week: string; orders: number; revenue: number }>;
    monthly: Array<{ month: string; orders: number; revenue: number }>;
  };
}

interface RevenueStats {
  total: number;
  byType: Record<string, number>;
  byService: Array<{
    service: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  byPeriod: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    weekly: Array<{ week: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
  };
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface PerformanceStats {
  departments: Array<{
    name: string;
    activeTasks: number;
    completedTasks: number;
    pendingTasks: number;
    avgCompletionTime: number | null;
    qualityScore: number | null;
    totalPayouts: number;
    topPerformers: Array<{ name: string | null; completedCount: number; avgScore: number | null }>;
  }>;
  teamOverview: {
    totalEditors: number;
    totalQA: number;
    activeEditors: number;
    activeQA: number;
  };
  productivity: {
    avgTasksPerEditor: number;
    avgReviewTime: number | null;
    revisionRate: number;
  };
}

// Helper function to get date range based on timeRange parameter
function getDateRange(timeRange: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date();

  switch (timeRange) {
    case '24h':
      start = new Date(now);
      start.setHours(start.getHours() - 24);
      break;
    case '7d':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

// Helper function to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// GET /api/admin/statistics - Comprehensive dashboard statistics
export async function GET(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'dashboard';
    const timeRange = searchParams.get('timeRange') || '30d';
    const department = searchParams.get('department');

    // Route to different scope handlers
    switch (scope) {
      case 'dashboard':
        return await getDashboardStats();
      case 'analytics':
        return await getAnalyticsStats(timeRange, department);
      case 'revenue':
        return await getRevenueStats(timeRange);
      case 'performance':
        return await getPerformanceStats(department);
      default:
        return await getDashboardStats();
    }
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Dashboard scope - Full dashboard data with KPIs, charts, recent activity
async function getDashboardStats() {
  // Get current period stats
  const [
    totalUsers,
    totalOrders,
    totalRevenueResult,
    ordersByStatusRaw,
    tasksByDepartmentRaw,
    activeUsersCount,
  ] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    db.order.groupBy({
      by: ['status'],
      _count: true,
    }),
    db.task.groupBy({
      by: ['department'],
      _count: true,
    }),
    db.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  // Calculate KPIs
  const totalRevenue = totalRevenueResult._sum.amount || 0;
  const pendingOrders = ordersByStatusRaw
    .filter((o) => ['PENDING', 'IN_PROGRESS', 'QA'].includes(o.status))
    .reduce((sum, o) => sum + o._count, 0);
  const completedOrders = ordersByStatusRaw
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o._count, 0);
  const activeTasks = tasksByDepartmentRaw
    .filter((t) => t.department !== 'COMPLETED')
    .reduce((sum, t) => sum + t._count, 0);

  // Calculate average order value
  const orderTotalResult = await db.order.aggregate({
    _sum: { totalAmount: true },
    _count: true,
  });
  const averageOrderValue = orderTotalResult._count > 0 
    ? (orderTotalResult._sum.totalAmount || 0) / orderTotalResult._count 
    : 0;

  // Get previous period for growth calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [currentPeriodRevenue, previousPeriodRevenue, currentPeriodOrders, previousPeriodOrders] = await Promise.all([
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    db.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    db.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
  ]);

  const revenueGrowth = calculateGrowth(
    currentPeriodRevenue._sum.amount || 0,
    previousPeriodRevenue._sum.amount || 0
  );
  const orderGrowth = calculateGrowth(currentPeriodOrders, previousPeriodOrders);

  // Get revenue trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const revenueByMonthRaw = await db.$queryRaw<Array<{ month: string; revenue: number }>>`
    SELECT 
      strftime('%Y-%m', createdAt) as month,
      SUM(amount) as revenue
    FROM transactions
    WHERE type = 'DEPOSIT' 
      AND status = 'SUCCESS'
      AND createdAt >= ${twelveMonthsAgo.toISOString()}
    GROUP BY strftime('%Y-%m', createdAt)
    ORDER BY month ASC
  `;

  // Get orders by service type
  const ordersByServiceRaw = await db.order.groupBy({
    by: ['serviceId'],
    _count: true,
    _sum: { totalAmount: true },
  });

  const serviceIds = [...new Set(ordersByServiceRaw.map((o) => o.serviceId))];
  const services = await db.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const ordersByServiceType = ordersByServiceRaw.map((item) => ({
    service: serviceMap.get(item.serviceId) || 'Unknown',
    count: item._count,
    revenue: item._sum.totalAmount || 0,
  }));

  // Get recent activity
  const [recentOrders, recentTasks, recentUsers, recentTransactions] = await Promise.all([
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        client: { select: { name: true, email: true } },
      },
    }),
    db.task.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        department: true,
        createdAt: true,
        editor: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, title: true } },
      },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Get department performance
  const departments = ['CLIPPING_PATH', 'RETOUCHING', 'COLOR_CORRECTION', 'MOTION_GRAPHICS', 'AI_PROCESSING', 'WEB_DEVELOPMENT'];
  const departmentPerformance = await Promise.all(
    departments.map(async (dept) => {
      const [active, completed, totalPayout] = await Promise.all([
        db.task.count({
          where: {
            department: dept,
            status: { in: ['AVAILABLE', 'CLAIMED', 'IN_PROGRESS'] },
          },
        }),
        db.task.count({
          where: {
            department: dept,
            status: 'APPROVED',
          },
        }),
        db.task.aggregate({
          where: {
            department: dept,
            status: 'APPROVED',
          },
          _sum: { payoutAmount: true },
        }),
      ]);

      // Calculate average completion time manually
      const completedTasksWithTime = await db.task.findMany({
        where: {
          department: dept,
          status: 'APPROVED',
          claimedAt: { not: null },
          submittedAt: { not: null },
        },
        select: {
          claimedAt: true,
          submittedAt: true,
        },
      });

      let avgCompletionTime: number | null = null;
      if (completedTasksWithTime.length > 0) {
        const totalTime = completedTasksWithTime.reduce((sum, task) => {
          if (task.claimedAt && task.submittedAt) {
            return sum + (task.submittedAt.getTime() - task.claimedAt.getTime());
          }
          return sum;
        }, 0);
        avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60); // in hours
      }

      return {
        department: dept,
        activeTasks: active,
        completedTasks: completed,
        averageCompletionTime: avgCompletionTime,
        totalPayouts: totalPayout._sum.payoutAmount || 0,
      };
    })
  );

  // Format response
  const response: DashboardStats = {
    kpis: {
      totalRevenue,
      totalOrders,
      totalUsers,
      activeTasks,
      completedOrders,
      pendingOrders,
      averageOrderValue,
      revenueGrowth,
      orderGrowth,
    },
    ordersByStatus: ordersByStatusRaw.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
    tasksByDepartment: tasksByDepartmentRaw.reduce((acc, item) => {
      acc[item.department] = item._count;
      return acc;
    }, {} as Record<string, number>),
    activeUsers: activeUsersCount,
    revenueTrend: revenueByMonthRaw.map((item) => ({
      month: item.month,
      revenue: item.revenue || 0,
    })),
    ordersByServiceType,
    recentActivity: {
      orders: recentOrders,
      tasks: recentTasks,
      users: recentUsers,
      transactions: recentTransactions,
    },
    departmentPerformance,
  };

  return NextResponse.json(response);
}

// Analytics scope - Detailed analytics with time ranges
async function getAnalyticsStats(timeRange: string, department: string | null) {
  const { start, end } = getDateRange(timeRange);
  const previousStart = new Date(start);
  previousStart.setTime(previousStart.getTime() - (end.getTime() - start.getTime()));

  // Base filter for tasks if department specified
  const taskWhere = department ? { department } : {};

  // Get metrics for current and previous period
  const [
    currentOrders,
    previousOrders,
    currentRevenue,
    previousRevenue,
    ordersByStatus,
    ordersByServiceType,
    tasksByDepartment,
    completedTasks,
    newUsers,
    activeUsers,
    usersByRole,
  ] = await Promise.all([
    // Current period orders
    db.order.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    // Previous period orders
    db.order.count({
      where: { createdAt: { gte: previousStart, lt: start } },
    }),
    // Current period revenue
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    // Previous period revenue
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: previousStart, lt: start },
      },
      _sum: { amount: true },
    }),
    // Orders by status
    db.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    }),
    // Orders by service type
    db.order.groupBy({
      by: ['serviceType'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    }),
    // Tasks by department
    db.task.groupBy({
      by: ['department'],
      where: {
        createdAt: { gte: start, lte: end },
        ...taskWhere,
      },
      _count: true,
    }),
    // Completed tasks
    db.task.count({
      where: {
        status: 'APPROVED',
        submittedAt: { gte: start, lte: end },
        ...taskWhere,
      },
    }),
    // New users
    db.user.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    // Active users (logged in)
    db.user.count({
      where: {
        lastLoginAt: { gte: start, lte: end },
      },
    }),
    // Users by role
    db.user.groupBy({
      by: ['role'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    }),
  ]);

  // Calculate growth
  const orderGrowth = calculateGrowth(currentOrders, previousOrders);
  const revenueGrowth = calculateGrowth(
    currentRevenue._sum.amount || 0,
    previousRevenue._sum.amount || 0
  );

  // Get trends
  const dailyTrends = await db.$queryRaw<Array<{ date: string; orders: number; revenue: number }>>`
    SELECT 
      strftime('%Y-%m-%d', createdAt) as date,
      COUNT(DISTINCT id) as orders,
      SUM(CASE WHEN type = 'DEPOSIT' AND status = 'SUCCESS' THEN amount ELSE 0 END) as revenue
    FROM (
      SELECT id, createdAt, 'ORDER' as type, 0 as amount, 'SUCCESS' as status FROM orders
      WHERE createdAt >= ${start.toISOString()} AND createdAt <= ${end.toISOString()}
      UNION ALL
      SELECT id, createdAt, type, amount, status FROM transactions
      WHERE createdAt >= ${start.toISOString()} AND createdAt <= ${end.toISOString()}
    )
    GROUP BY strftime('%Y-%m-%d', createdAt)
    ORDER BY date ASC
    LIMIT 30
  `;

  // Monthly trends
  const monthlyTrends = await db.$queryRaw<Array<{ month: string; orders: number; revenue: number }>>`
    SELECT 
      strftime('%Y-%m', createdAt) as month,
      COUNT(*) as orders,
      SUM(totalAmount) as revenue
    FROM orders
    WHERE createdAt >= ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}
    GROUP BY strftime('%Y-%m', createdAt)
    ORDER BY month ASC
  `;

  // Calculate average completion time
  const tasksWithTime = await db.task.findMany({
    where: {
      status: 'APPROVED',
      claimedAt: { not: null },
      submittedAt: { not: null, gte: start, lte: end },
      ...taskWhere,
    },
    select: {
      claimedAt: true,
      submittedAt: true,
    },
  });

  let avgCompletionTime: number | null = null;
  if (tasksWithTime.length > 0) {
    const totalTime = tasksWithTime.reduce((sum, task) => {
      if (task.claimedAt && task.submittedAt) {
        return sum + (task.submittedAt.getTime() - task.claimedAt.getTime());
      }
      return sum;
    }, 0);
    avgCompletionTime = totalTime / tasksWithTime.length / (1000 * 60 * 60); // in hours
  }

  const response: AnalyticsStats = {
    timeRange,
    period: { start, end },
    metrics: {
      orders: {
        total: currentOrders,
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byServiceType: ordersByServiceType.reduce((acc, item) => {
          acc[item.serviceType] = item._count;
          return acc;
        }, {} as Record<string, number>),
        growth: orderGrowth,
      },
      revenue: {
        total: currentRevenue._sum.amount || 0,
        byService: [], // Will be populated below
        growth: revenueGrowth,
      },
      tasks: {
        total: tasksByDepartment.reduce((sum, t) => sum + t._count, 0),
        completed: completedTasks,
        byDepartment: tasksByDepartment.reduce((acc, item) => {
          acc[item.department] = item._count;
          return acc;
        }, {} as Record<string, number>),
        avgCompletionTime,
      },
      users: {
        new: newUsers,
        active: activeUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    },
    trends: {
      daily: dailyTrends,
      weekly: [], // Weekly aggregation not critical for now
      monthly: monthlyTrends,
    },
  };

  // Get revenue by service
  const revenueByService = await db.order.groupBy({
    by: ['serviceId'],
    where: { createdAt: { gte: start, lte: end } },
    _sum: { totalAmount: true },
  });

  const serviceIds = [...new Set(revenueByService.map((o) => o.serviceId))];
  const services = await db.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  response.metrics.revenue.byService = revenueByService.map((item) => ({
    service: serviceMap.get(item.serviceId) || 'Unknown',
    revenue: item._sum.totalAmount || 0,
  }));

  return NextResponse.json(response);
}

// Revenue scope - Revenue breakdown by service, period
async function getRevenueStats(timeRange: string) {
  const { start, end } = getDateRange(timeRange);
  const previousStart = new Date(start);
  previousStart.setTime(previousStart.getTime() - (end.getTime() - start.getTime()));

  // Get total revenue by transaction type
  const revenueByType = await db.transaction.groupBy({
    by: ['type'],
    where: {
      status: 'SUCCESS',
      createdAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });

  // Get revenue by service
  const revenueByServiceRaw = await db.order.groupBy({
    by: ['serviceId'],
    where: { createdAt: { gte: start, lte: end } },
    _sum: { totalAmount: true },
    _count: true,
  });

  const serviceIds = [...new Set(revenueByServiceRaw.map((o) => o.serviceId))];
  const services = await db.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const totalRevenue = revenueByServiceRaw.reduce(
    (sum, item) => sum + (item._sum.totalAmount || 0),
    0
  );

  const revenueByService = revenueByServiceRaw.map((item) => ({
    service: serviceMap.get(item.serviceId) || 'Unknown',
    count: item._count,
    revenue: item._sum.totalAmount || 0,
    percentage: totalRevenue > 0 ? ((item._sum.totalAmount || 0) / totalRevenue) * 100 : 0,
  }));

  // Daily revenue
  const dailyRevenue = await db.$queryRaw<Array<{ date: string; revenue: number; orders: number }>>`
    SELECT 
      strftime('%Y-%m-%d', createdAt) as date,
      SUM(totalAmount) as revenue,
      COUNT(*) as orders
    FROM orders
    WHERE createdAt >= ${start.toISOString()} AND createdAt <= ${end.toISOString()}
    GROUP BY strftime('%Y-%m-%d', createdAt)
    ORDER BY date ASC
  `;

  // Monthly revenue
  const monthlyRevenue = await db.$queryRaw<Array<{ month: string; revenue: number; orders: number }>>`
    SELECT 
      strftime('%Y-%m', createdAt) as month,
      SUM(totalAmount) as revenue,
      COUNT(*) as orders
    FROM orders
    WHERE createdAt >= ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}
    GROUP BY strftime('%Y-%m', createdAt)
    ORDER BY month ASC
  `;

  // Calculate growth rates
  const [currentRevenue, previousRevenue] = await Promise.all([
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        type: 'DEPOSIT',
        status: 'SUCCESS',
        createdAt: { gte: previousStart, lt: start },
      },
      _sum: { amount: true },
    }),
  ]);

  // Calculate different growth periods
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [dailyCurrent, dailyPrevious, weeklyCurrent, weeklyPrevious, monthlyCurrent, monthlyPrevious] = await Promise.all([
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: oneDayAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: twoDaysAgo, lt: oneDayAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
  ]);

  const response: RevenueStats = {
    total: currentRevenue._sum.amount || 0,
    byType: revenueByType.reduce((acc, item) => {
      acc[item.type] = item._sum.amount || 0;
      return acc;
    }, {} as Record<string, number>),
    byService: revenueByService,
    byPeriod: {
      daily: dailyRevenue,
      weekly: [], // Weekly not critical
      monthly: monthlyRevenue,
    },
    growth: {
      daily: calculateGrowth(dailyCurrent._sum.amount || 0, dailyPrevious._sum.amount || 0),
      weekly: calculateGrowth(weeklyCurrent._sum.amount || 0, weeklyPrevious._sum.amount || 0),
      monthly: calculateGrowth(monthlyCurrent._sum.amount || 0, monthlyPrevious._sum.amount || 0),
    },
  };

  return NextResponse.json(response);
}

// Performance scope - Department/team performance metrics
async function getPerformanceStats(department: string | null) {
  const departments = department 
    ? [department] 
    : ['CLIPPING_PATH', 'RETOUCHING', 'COLOR_CORRECTION', 'MOTION_GRAPHICS', 'AI_PROCESSING', 'WEB_DEVELOPMENT'];

  // Get team overview
  const [totalEditors, totalQA, activeEditors, activeQA] = await Promise.all([
    db.user.count({ where: { role: 'EDITOR' } }),
    db.user.count({ where: { role: 'QA' } }),
    db.user.count({
      where: {
        role: 'EDITOR',
        tasks: {
          some: {
            status: { in: ['CLAIMED', 'IN_PROGRESS'] },
          },
        },
      },
    }),
    db.user.count({
      where: {
        role: 'QA',
        reviews: {
          some: {
            status: 'PENDING',
          },
        },
      },
    }),
  ]);

  // Get department performance
  const departmentStats = await Promise.all(
    departments.map(async (dept) => {
      const [activeTasks, completedTasks, pendingTasks, totalPayout] = await Promise.all([
        db.task.count({
          where: {
            department: dept,
            status: { in: ['AVAILABLE', 'CLAIMED', 'IN_PROGRESS'] },
          },
        }),
        db.task.count({
          where: { department: dept, status: 'APPROVED' },
        }),
        db.task.count({
          where: { department: dept, status: 'SUBMITTED' },
        }),
        db.task.aggregate({
          where: { department: dept, status: 'APPROVED' },
          _sum: { payoutAmount: true },
        }),
      ]);

      // Calculate average completion time
      const completedTasksWithTime = await db.task.findMany({
        where: {
          department: dept,
          status: 'APPROVED',
          claimedAt: { not: null },
          submittedAt: { not: null },
        },
        select: { claimedAt: true, submittedAt: true },
        take: 100, // Limit for performance
      });

      let avgCompletionTime: number | null = null;
      if (completedTasksWithTime.length > 0) {
        const totalTime = completedTasksWithTime.reduce((sum, task) => {
          if (task.claimedAt && task.submittedAt) {
            return sum + (task.submittedAt.getTime() - task.claimedAt.getTime());
          }
          return sum;
        }, 0);
        avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60);
      }

      // Calculate quality score from QA reviews
      const qaScores = await db.qAReview.aggregate({
        where: {
          task: { department: dept },
          score: { not: null },
        },
        _avg: { score: true },
      });

      // Get top performers
      const topPerformersRaw = await db.task.groupBy({
        by: ['editorId'],
        where: {
          department: dept,
          status: 'APPROVED',
          editorId: { not: null },
        },
        _count: true,
      });

      const editorIds = topPerformersRaw
        .filter((t) => t.editorId)
        .map((t) => t.editorId!)
        .slice(0, 5);

      const editors = await db.user.findMany({
        where: { id: { in: editorIds } },
        select: { id: true, name: true },
      });
      const editorMap = new Map(editors.map((e) => [e.id, e.name]));

      // Get quality scores for top performers
      const topPerformers = await Promise.all(
        topPerformersRaw.slice(0, 5).map(async (item) => {
          const avgScore = await db.qAReview.aggregate({
            where: {
              task: { editorId: item.editorId },
              score: { not: null },
            },
            _avg: { score: true },
          });

          return {
            name: editorMap.get(item.editorId!) || 'Unknown',
            completedCount: item._count,
            avgScore: avgScore._avg.score,
          };
        })
      );

      return {
        name: dept,
        activeTasks,
        completedTasks,
        pendingTasks,
        avgCompletionTime,
        qualityScore: qaScores._avg.score,
        totalPayouts: totalPayout._sum.payoutAmount || 0,
        topPerformers: topPerformers.sort((a, b) => b.completedCount - a.completedCount),
      };
    })
  );

  // Calculate productivity metrics
  const totalActiveTasks = departmentStats.reduce((sum, d) => sum + d.activeTasks, 0);
  const totalCompletedTasks = departmentStats.reduce((sum, d) => sum + d.completedTasks, 0);
  
  const avgTasksPerEditor = totalEditors > 0 ? totalCompletedTasks / totalEditors : 0;

  // Calculate average review time
  const reviewsWithTime = await db.qAReview.findMany({
    where: {
      status: { not: 'PENDING' },
      reviewedAt: { not: null },
    },
    select: { createdAt: true, reviewedAt: true },
    take: 100,
  });

  let avgReviewTime: number | null = null;
  if (reviewsWithTime.length > 0) {
    const totalTime = reviewsWithTime.reduce((sum, review) => {
      if (review.reviewedAt) {
        return sum + (review.reviewedAt.getTime() - review.createdAt.getTime());
      }
      return sum;
    }, 0);
    avgReviewTime = totalTime / reviewsWithTime.length / (1000 * 60 * 60); // in hours
  }

  // Calculate revision rate
  const [totalTasksWithRevisions, totalTasks] = await Promise.all([
    db.task.count({
      where: { revisionCount: { gt: 0 } },
    }),
    db.task.count(),
  ]);

  const revisionRate = totalTasks > 0 ? (totalTasksWithRevisions / totalTasks) * 100 : 0;

  const response: PerformanceStats = {
    departments: departmentStats,
    teamOverview: {
      totalEditors,
      totalQA,
      activeEditors,
      activeQA,
    },
    productivity: {
      avgTasksPerEditor,
      avgReviewTime,
      revisionRate,
    },
  };

  return NextResponse.json(response);
}
