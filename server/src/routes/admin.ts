import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getUsers,
    updateUserRole,
    deleteUser,
} from "../controllers/adminController";

const router = Router()

router.use(authMiddleware)
router.use(requireRole('ADMIN'))

//Questions
router.get('/questions', getQuestions)
router.post('/questions', createQuestion)
router.put('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)

//Users
router.get('/users', getUsers)
router.patch('/users/:id/role', updateUserRole)
router.delete('/users/:id',deleteUser)

export default router