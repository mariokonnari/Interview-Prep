import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { createRoom, joinRoom, getRoom, advanceQuestion, finishRoom } from '../controllers/roomController'

const router = Router()

router.use(authMiddleware)

router.post('/', createRoom)
router.post('/join', joinRoom)
router.get('/:code', getRoom)
router.post('/:code/advance', advanceQuestion)
router.post('/:code/finish', finishRoom)

export default router