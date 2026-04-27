import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { roomsApi, type Room } from "../services/api";

export function useRoom(code: string | null) {
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

    //subscribe to realtime changes on the Room table
    useEffect(() => {
        if (!code) return

        setLoading(true)
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
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [code, fetchRoom])

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

    return { room, loading, error, fetchRoom, advance, finish }
}