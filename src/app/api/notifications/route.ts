import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const onlyUnread = searchParams.get('unread') === 'true'

    // Build where clause
    const where: Record<string, unknown> = { userId: authResult.userId }
    if (onlyUnread) {
      where.isRead = false
    }

    // Fetch notifications from database
    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where: { userId: authResult.userId } }),
      db.notification.count({ where: { userId: authResult.userId, isRead: false } })
    ])

    // Transform to match frontend types
    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }))

    return NextResponse.json({ 
      notifications: formattedNotifications, 
      unreadCount,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications - Create notification (admin or system only)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { userId, type, title, message, link } = body

    // Only admins can create notifications for other users
    if (userId && userId !== authResult.userId) {
      if (!['ADMIN', 'DEVELOPER'].includes(authResult.role!)) {
        return NextResponse.json({ error: 'Only admins can create notifications for other users' }, { status: 403 })
      }
    }

    // Use current user's ID if not specified
    const targetUserId = userId || authResult.userId

    // Create notification in database
    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        type: type || 'SYSTEM',
        title,
        message,
        link: link || null,
        isRead: false,
      },
    })

    return NextResponse.json({
      notification: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/notifications - Mark as read
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { notificationId, markAll } = body
    const userId = authResult.userId

    if (markAll) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
    } else if (notificationId) {
      // Verify ownership before marking as read
      const notification = await db.notification.findFirst({
        where: { id: notificationId, userId }
      })

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }

      // Mark single notification as read
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('notificationId')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Verify ownership before deleting
    const notification = await db.notification.findFirst({
      where: { id: notificationId, userId: authResult.userId }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Delete notification
    await db.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
