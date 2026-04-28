import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET /api/chat/messages - Get messages for a room
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if user is a participant in this room
    const participant = await db.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId: authResult.userId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 })
    }

    // Fetch messages for the room
    const [messages, total, unreadMessages] = await Promise.all([
      db.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      }),
      db.chatMessage.count({ where: { roomId } }),
      db.chatMessage.count({
        where: {
          roomId,
          isRead: false,
          senderId: { not: authResult.userId }
        }
      })
    ])

    // Format messages (reverse to show oldest first)
    const formattedMessages = [...messages].reverse().map(msg => ({
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      senderName: msg.sender?.name,
      content: msg.content,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString()
    }))

    return NextResponse.json({ 
      messages: formattedMessages,
      unreadCount: unreadMessages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/messages - Send a message
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { roomId, content, attachments } = body

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Room ID and content are required' }, { status: 400 })
    }

    // Check if user is a participant in this room
    const participant = await db.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId: authResult.userId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 })
    }

    // Create message
    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: authResult.userId!,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        isRead: false,
        readBy: JSON.stringify([])
      }
    })

    // Update room's last message timestamp
    await db.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date()
      }
    })

    // Get sender info for response
    const sender = await db.user.findUnique({
      where: { id: authResult.userId },
      select: { id: true, name: true, email: true, avatar: true }
    })

    const formattedMessage = {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: sender?.name,
      content: message.content,
      attachments: message.attachments ? JSON.parse(message.attachments) : null,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString()
    }

    return NextResponse.json({ message: formattedMessage }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/chat/messages - Mark messages as read
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { roomId, messageId, markAllRead } = body

    if (!roomId && !messageId) {
      return NextResponse.json({ error: 'Room ID or Message ID is required' }, { status: 400 })
    }

    if (markAllRead && roomId) {
      // Mark all messages in room as read
      await db.chatMessage.updateMany({
        where: {
          roomId,
          isRead: false,
          senderId: { not: authResult.userId }
        },
        data: {
          isRead: true,
          readBy: JSON.stringify([authResult.userId])
        }
      })
    } else if (messageId) {
      // Mark single message as read
      const readByObj = await db.chatMessage.findUnique({
        where: { id: messageId },
        select: { readBy: true }
      })

      if (readByObj && readByObj.readBy) {
        const readBy = JSON.parse(readByObj.readBy) as string[]
        if (!readBy.includes(authResult.userId!)) {
          readBy.push(authResult.userId!)
          await db.chatMessage.update({
            where: { id: messageId },
            data: {
              isRead: true,
              readBy: JSON.stringify(readBy)
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
