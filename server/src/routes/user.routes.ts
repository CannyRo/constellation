import { Router } from 'express'
import { getMeHandler, updateMeHandler, deleteMeHandler } from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validate'
import { updateMeSchema } from '../validators/user.validators'

const router = Router()

router.use(authMiddleware) // All routes /users/me are protected

router.get('/me', getMeHandler)
router.put('/me', validate(updateMeSchema), updateMeHandler)
router.delete('/me', deleteMeHandler)

export default router