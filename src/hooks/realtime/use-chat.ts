'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ChatRoom, ChatMessage } from '@/types/database'

interface UseChatOptions {
  userId: string | undefined
  roomId?: string
}

export function useChat({ userId, roomId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState<string[]>([])

  // Fetch messages for a room via API
  const fetchMessages = useCallback(async () => {
    if (!roomId) return

    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [roomId])

  // Fetch user's chat rooms via API
  const fetchRooms = useCallback(async () => {
    if (!userId) return

    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data.rooms || [])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchRooms()
    }
  }, [userId, fetchRooms])

  // Fetch messages when room changes
  useEffect(() => {
    if (roomId) {
      fetchMessages()
    }
  }, [roomId, fetchMessages])

  // Send message via API
  const sendMessage = useCallback(async (content: string, attachments?: string[]) => {
    if (!roomId || !userId) return

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, content, attachments }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [roomId, userId])

  // Create or get direct message room
  const createDirectRoom = useCallback(async (otherUserId: string) => {
    if (!userId) return null

    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DIRECT',
          participantIds: [userId, otherUserId],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.room
      }
    } catch (error) {
      console.error('Error creating direct room:', error)
    }
    return null
  }, [userId])

  // Create project room
  const createProjectRoom = useCallback(async (orderId: string, participants: string[]) => {
    if (!userId) return null

    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROJECT',
          orderId,
          participantIds: [...new Set([...participants, userId])],
          name: 'Project Chat',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.room
      }
    } catch (error) {
      console.error('Error creating project room:', error)
    }
    return null
  }, [userId])

  // Mock typing indicator (no real-time in demo mode)
  const sendTyping = useCallback(() => {
    // No-op in demo mode
  }, [])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    // No-op in demo mode
  }, [])

  return {
    messages,
    rooms,
    loading,
    typing,
    onlineUsers: [],
    sendMessage,
    sendTyping,
    markAsRead,
    createDirectRoom,
    createProjectRoom,
    fetchMessages,
    fetchRooms,
  }
}
