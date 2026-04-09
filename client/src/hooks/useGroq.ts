import { useState } from 'react'
import type { Feedback } from '../types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export function useGroq() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const evaluate = async (question: string, answer: string): Promise<Feedback | null> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY

    if (!apiKey || apiKey === 'gsk_your_key_here') {
      setError('No Groq API key found. Add VITE_GROQ_API_KEY to your .env file.')
      return null
    }

    setLoading(true)
    setError(null)

    const prompt = `You are a senior frontend engineer conducting a technical interview.

Question asked: "${question}"

Candidate's answer: "${answer}"

Evaluate this answer strictly and fairly. Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON:
{
  "score": <integer from 1 to 10>,
  "feedback": "<2-3 sentences covering what was correct, what was missing or unclear, and one concrete improvement>"
}`

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 512,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as { error?: { message?: string } })?.error?.message ?? `API error ${res.status}`)
      }

      const data = await res.json()
      const raw: string = data.choices?.[0]?.message?.content ?? ''
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