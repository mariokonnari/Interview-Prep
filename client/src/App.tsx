import { useState, useCallback } from "react";
import { useQuestions } from "./hooks/useQuestions";
import type { SessionResult, Feedback } from "./types";
import { useGroq } from "./hooks/useGroq";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsScreen from "./components/ResultsScreen";

type View = 'practice' | 'results'

export default function App() {
  const [view, setView] = useState<View>('practice')
  const [currentIdx, setCurrrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Map<number, string>>(new Map())
  const [feedbacks, setFeedbacks] = useState<Map<number, Feedback>>(new Map())
  const { evaluate, loading, error } = useGroq()
  const { questions, loading: questionsLoading, error: questionsError } = useQuestions()

  const currentQuestion = questions[currentIdx]
  const answeredCount = feedbacks.size

  const handleSubmit = useCallback(
    async (answer: string) => {
      const feedback = await evaluate(currentQuestion.text, answer)
      if (feedback) {
        setAnswers((prev) => new Map(prev).set(currentQuestion.id, answer))
        setFeedbacks((prev) => new Map(prev).set(currentQuestion.id, feedback))
      }
    },
    [currentQuestion, evaluate]
  )

  const handleNext = () => {
    if (currentIdx <  questions.length - 1) setCurrrentIdx((i) => i+ 1)
      else setView('results')
  }

  const handlePrev = () => {
    if (currentIdx > 0) setCurrrentIdx((i) => i - 1)
  }

  const handleSkip = () => {
    if (currentIdx < questions.length - 1) setCurrrentIdx((i) => i + 1)
      else setView('results')
  }

  const handleFinish = () => setView('results')

  const handleRestart = () => {
    setCurrrentIdx(0)
    setAnswers(new Map())
    setFeedbacks(new Map())
    setView('practice')
  }

  const results = new Map<number, SessionResult>(
    Array.from(feedbacks.entries()).map(([id, fb]) => [
      id,
      {
        questionId: id,
        answer: answers.get(id) ?? '',
        score: fb.score,
        feedback: fb.feedback
      },
    ])
  )

  const layout: React.CSSProperties = {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '2rem 1.25rem',
  }

  if (questionsLoading) {
    return (
      <div style={layout}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
            Frontend interview prep
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Loading questions...
          </p>
        </header>
      </div>
    )
  }

  if (questionsError) {
    return (
      <div style={layout}>
        <p style={{ color: 'var(--color-danger-text)', fontSize: '14px' }}>
          {questionsError}
        </p>
      </div>
    )
  }

  return (
    <div style={layout}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
          Frontend interview prerp
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Answer each question and get AI feedback on your response.
        </p>
      </header>

      {view === 'practice' ? (
        <>
          <ProgressBar current={answeredCount} total={questions.length} />
          <QuestionCard 
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIdx}
            total={questions.length}
            savedAnswer={answers.get(currentQuestion.id)}
            savedFeedback={feedbacks.get(currentQuestion.id)}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            loading={loading}
            error={error}
            isLast={currentIdx === questions.length - 1}
            onFinish={handleFinish}
          />
        </>
      ) : (
        <ResultsScreen 
          questions={questions}
          results={results}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}