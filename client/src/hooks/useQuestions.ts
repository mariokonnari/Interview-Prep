import { useState, useEffect } from "react";
import { questionsApi, type Question } from "../services/api";

export function useQuestions() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        questionsApi
            .getAll()
            .then(({ questions }) => setQuestions(questions))
            .catch((err) => {
                console.error("Failed to fetch questions:", err)
                setError("Failed to load questions. Please refresh")
            })
            .finally(() => setLoading(false))
    }, [])

    return { questions, loading, error }
}