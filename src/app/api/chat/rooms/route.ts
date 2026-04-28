import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, canAccessResource } from '@/lib/api-auth'

// GET /api/chat/rooms - Get user's chat rooms
export async function GET(request: NextRequest) {
  // Use centralized auth
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    // Find rooms where user is a participant
    const rooms = await db.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: authResult.userId
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        order: {
          select: { id: true, orderNumber: true, title: true }
        }
      }
    })

    // Transform response to include last message info
    const formattedRooms = rooms.map(room => ({
      id: room.id,
      type: room.type,
      name: room.name,
      orderId: room.orderId,
      lastMessage: room.lastMessage,
      lastMessageAt: room.lastMessageAt?.toISOString(),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      participants: room.participants.map(p => p.user.id)
    }))

    return NextResponse.json({ rooms: formattedRooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/rooms - Create a new chat room
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { type, participantIds, orderId, name } = body

    // Ensure all participants including the creator are in the room
    const allParticipantIds = [...new Set([authResult.userId!, ...(participantIds || [])])]

    // Create the chat room with participants
    const room = await db.chatRoom.create({
      data: {
        type: type || 'DIRECT',
        name: name,
        orderId: orderId,
        participants: {
          create: allParticipantIds.map(userId => ({ userId }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    const formattedRoom = {
      id: room.id,
      type: room.type,
      name: room.name,
      orderId: room.orderId,
      lastMessage: room.lastMessage,
      lastMessageAt: room.lastMessageAt?.toISOString(),
      createdAt: room.createdAt.toISOString(),
      participants: room.participants.map(p => p.user.id)
    }

    return NextResponse.json({ room: formattedRoom }, { status: 201 })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/chat/rooms - Update chat room (e.g., update last message)
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { roomId, name, lastMessage } = body

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if user is a participant
    const participant = await db.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId: authResult.userId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (lastMessage !== undefined) {
      updateData.lastMessage = lastMessage
      updateData.lastMessageAt = new Date()
    }

    const room = await db.chatRoom.update({
      where: { id: roomId },
      data: updateData
    })

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/chat/rooms - Delete a chat room
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authorized) {
    return authResult.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if user is a participant
    const participant = await db.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId: authResult.userId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 })
    }

    // Delete room and all participants
    await db.chatRoom.delete({
      where: { id: roomId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
