import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { roomsApi, type Room } from '../services/api'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface BroadcastAnswer {
  userId: string
  username: string
  answer: string
  score: number
  feedback: string
}

export function useRoom(code: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receivedAnswers, setReceivedAnswers] = useState<Map<string, BroadcastAnswer>>(
    new Map<string, BroadcastAnswer>()
  )
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!code) return
    try {
      const { room } = await roomsApi.get(code)
      setRoom(room)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room')
    }
  }, [code])

  const broadcastAnswer = useCallback(async (answer: BroadcastAnswer) => {
    if (!channelRef.current) return
    await channelRef.current.send({
      type: 'broadcast',
      event: 'answer_submitted',
      payload: answer,
    })
  }, [])

  const resetAnswers = useCallback(() => {
    setReceivedAnswers(new Map<string, BroadcastAnswer>())
  }, [])

  useEffect(() => {
    if (!code) return

    setLoading(true)
    setReceivedAnswers(new Map<string, BroadcastAnswer>())
    fetchRoom().finally(() => setLoading(false))

    const channel = supabase
      .channel(`room:${code}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Room',
          filter: `code=eq.${code}`,
        },
        () => {
          fetchRoom()
        }
      )
      .on('broadcast', { event: 'answer_submitted' }, ({ payload }) => {
        const answer = payload as BroadcastAnswer
        setReceivedAnswers((prev) => {
          const next = new Map<string, BroadcastAnswer>(prev)
          next.set(answer.userId, answer)
          return next
        })
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [code, fetchRoom])

  const advance = async () => {
    if (!code) return
    try {
      const { room } = await roomsApi.advance(code)
      setRoom(room)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance')
    }
  }

  const finish = async () => {
    if (!code) return
    try {
      const { room } = await roomsApi.finish(code)
      setRoom(room)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish room')
    }
  }

  return {
    room,
    loading,
    error,
    fetchRoom,
    advance,
    finish,
    receivedAnswers,
    broadcastAnswer,
    resetAnswers,
  }
}