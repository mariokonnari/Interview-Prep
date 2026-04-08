import { useState } from "react";
import type { Feedback } from "../types";

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

export function useGemini() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const evaluate = async (question: string, answer: string): Promise<Feedback | null> => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            setError('No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file.')
            return null
        }

        setLoading(true)
        setError(null)

        const prompt = `You are a senior frontend engineer conducting a technical interview. Question asked: "${question}". Candidate's answer: "${answer}". Evaluate this answer strictly and fairly. Respond ONLY with a valid JSON object - no markdown, no explanation outside the JSON: 
        {
            "score": <integer from 1 to 10>,
            "feedback": "<2-3 sentences covering what was correct, what was missing or unclear, and one concrete improvement>"
        }`

        try {
            const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
                }),
            })

            if(!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error((errData as { error?: { message?: string } })?.error?.message ?? `API error ${res.status}`)
            }

            const data = await res.json()
            const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            const cleaned = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(cleaned) as Feedback

            return {
                score: Math.min(10, Math.max(1, Math.round(parsed.score))),
                feedback: parsed.feedback,
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(`Evaluation failed: ${message}`)
            return null
        } finally {
            setLoading(false)
        }
    }

    return { evaluate, loading, error }
}