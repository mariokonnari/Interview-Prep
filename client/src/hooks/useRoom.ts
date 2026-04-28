import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { roomsApi, type Room } from "../services/api";

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
    const [receivedAnswers, setReceivedAnswers] = useState<Map<string, BroadcastAnswer>>(new Map<string, BroadcastAnswer>())

    //fetch room state
    const fetchRoom = useCallback(async () => {
        if (!code) return
        try {
            const { room } = await roomsApi.get(code)
            setRoom(room)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch room')
        }
    }, [code])

    const broadcastAnswer = useCallback(
        async (answer: BroadcastAnswer) => {
            if (!code) return
            await supabase.channel(`room:${code}`).send({
                type: 'broadcast',
                event: 'answer_submitted',
                payload: answer,
            })
        },
        [code]
    )

    //subscribe to realtime changes on the Room table
    useEffect(() => {
        if (!code) return

        setLoading(true)
        setReceivedAnswers(new Map<string, BroadcastAnswer>())
        fetchRoom().finally(() => setLoading(false))

        const channel = supabase
            .channel(`room:${code}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Room',
                    filter: `code=eq.${code}`,
                },
                () => {
                    //any changes to this room refresh
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

        return () => {
            supabase.removeChannel(channel)
        }
    }, [code, fetchRoom])

    //reset received answers when question changes
    const resetAnswers = useCallback(() => {
        setReceivedAnswers(new Map<string, BroadcastAnswer>())
    }, [])

    const advance = async () => {
        if (!code) return
        try {
            const { room } = await roomsApi.advance(code)
            setRoom(room)
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Failed to advance')
        }
    }

    const finish = async () => {
        if (!code) return
        try {
            const { room } = await roomsApi.finish(code)
            setRoom(room)
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Failed to finish room')
        }
    }

    return { room, loading, error, fetchRoom, advance, finish, receivedAnswers, broadcastAnswer, resetAnswers }
}