require('dotenv').config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import sessionRoutes from './routes/sessions'
import leaderboardRoutes from './routes/leaderboard'
import adminRoutes from './routes/admin'
import questionRoutes from './routes/questions'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/questions', questionRoutes)

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

//Listen locally
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT ?? 3001
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app