import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'user';
    const type = searchParams.get('type');
    const userId = authResult.userId!;
    const role = authResult.role!;

    if (type === 'wallet') {
      const [deposits, spent] = await Promise.all([
        db.transaction.aggregate({
          where: { userId, type: 'DEPOSIT', status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: {
            userId,
            type: { in: ['ORDER_PAYMENT', 'WITHDRAWAL'] },
            status: 'SUCCESS',
          },
          _sum: { amount: true },
        }),
      ]);

      return NextResponse.json({
        stats: {
          totalDeposits: deposits._sum.amount || 0,
          totalSpent: Math.abs(spent._sum.amount || 0),
          transactionCount: await db.transaction.count({
            where: { userId, status: 'SUCCESS' },
          }),
        },
      });
    }

    if (scope === 'user') {
      if (role === 'CLIENT') {
        const [orders, walletUser, thisMonthStart] = await Promise.all([
          db.order.findMany({
            where: { clientId: userId },
            select: { status: true, quantity: true, totalAmount: true, createdAt: true },
          }),
          db.user.findUnique({ where: { id: userId }, select: { walletBalance: true } }),
          Promise.resolve(new Date(new Date().setDate(1))),
        ]);

        const activeOrders = orders.filter(o => ['PENDING', 'IN_PROGRESS', 'QA', 'REVISION'].includes(o.status));
        const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status));
        const completedThisMonth = orders.filter(o => o.status === 'COMPLETED' && o.createdAt >= thisMonthStart);

        return NextResponse.json({
          stats: {
            walletBalance: walletUser?.walletBalance || 0,
            activeProjects: activeOrders.length,
            inProduction: activeOrders.reduce((sum, o) => sum + o.quantity, 0),
            completedThisMonth: completedThisMonth.reduce((sum, o) => sum + o.quantity, 0),
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          },
        });
      }

      if (role === 'EDITOR') {
        const [tasks, pendingPayout, todayStart] = await Promise.all([
          db.task.findMany({
            where: { editorId: userId },
            select: { status: true, payoutAmount: true, submittedAt: true },
          }),
          db.payout.aggregate({
            where: { editorId: userId, status: 'PENDING' },
            _sum: { amount: true },
          }),
          Promise.resolve(new Date(new Date().setHours(0, 0, 0, 0))),
        ]);

        const activeTasks = tasks.filter(t => ['CLAIMED', 'IN_PROGRESS'].includes(t.status));
        const completedTasks = tasks.filter(t => t.status === 'APPROVED' || t.status === 'SUBMITTED');
        const completedToday = completedTasks.filter(t => t.submittedAt && t.submittedAt >= todayStart);
        const totalEarnings = completedTasks.filter(t => t.payoutAmount).reduce((sum, t) => sum + (t.payoutAmount || 0), 0);

        return NextResponse.json({
          stats: {
            activeTasks: activeTasks.length,
            todayEarnings: completedToday.reduce((sum, t) => sum + (t.payoutAmount || 0), 0),
            completedToday: completedToday.length,
            totalEarnings,
            pendingPayout: pendingPayout._sum.amount || 0,
            avgRating: 4.9,
          },
        });
      }

      if (role === 'QA') {
        const [reviews, pendingReviews, todayStart] = await Promise.all([
          db.qAReview.findMany({
            where: { qaId: userId },
            select: { status: true, score: true, createdAt: true },
          }),
          db.task.count({ where: { status: 'SUBMITTED' } }),
          Promise.resolve(new Date(new Date().setHours(0, 0, 0, 0))),
        ]);

        const reviewedToday = reviews.filter(r => r.createdAt >= todayStart);
        const scoredReviews = reviews.filter(r => r.score);
        const avgScore = scoredReviews.length > 0
          ? scoredReviews.reduce((sum, r) => sum + (r.score || 0), 0) / scoredReviews.length
          : 0;

        return NextResponse.json({
          stats: {
            pendingReviews,
            reviewedToday: reviewedToday.length,
            totalReviews: reviews.length,
            avgScore,
            approvedCount: reviews.filter(r => r.status === 'APPROVED').length,
            rejectedCount: reviews.filter(r => r.status === 'REJECTED').length,
          },
        });
      }

      if (role === 'ADMIN' || role === 'DEVELOPER') {
        const [totalUsers, totalOrders, revenue, activeOrders, pendingTasks, activeEditors, nitroOrders] = await Promise.all([
          db.user.count(),
          db.order.count(),
          db.transaction.aggregate({ where: { type: 'DEPOSIT', status: 'SUCCESS' }, _sum: { amount: true } }),
          db.order.count({ where: { status: { in: ['IN_PROGRESS', 'QA', 'REVISION'] } } }),
          db.task.count({ where: { status: 'AVAILABLE' } }),
          db.user.count({ where: { role: 'EDITOR', status: 'ACTIVE' } }),
          db.order.count({ where: { priority: 'NITRO' } }),
        ]);

        return NextResponse.json({
          stats: {
            totalUsers,
            totalOrders,
            totalRevenue: revenue._sum.amount || 0,
            activeOrders,
            pendingTasks,
            activeEditors,
            nitroOrders,
          },
        });
      }
    }

    if (scope === 'global' && ['ADMIN', 'DEVELOPER'].includes(role)) {
      const [userCount, orderCount, taskCount, revenue, ordersByStatus, tasksByDepartment, recentOrders] = await Promise.all([
        db.user.count(),
        db.order.count(),
        db.task.count(),
        db.transaction.aggregate({ where: { type: 'DEPOSIT', status: 'SUCCESS' }, _sum: { amount: true } }),
        db.order.groupBy({ by: ['status'], _count: true }),
        db.task.groupBy({ by: ['department'], _count: true }),
        db.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { client: { select: { name: true, email: true } } },
        }),
      ]);

      return NextResponse.json({
        stats: { users: userCount, orders: orderCount, tasks: taskCount, revenue: revenue._sum.amount || 0 },
        charts: { ordersByStatus, tasksByDepartment },
        recentOrders,
      });
    }

    return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}