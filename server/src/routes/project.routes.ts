import { Router } from 'express'
import { getProjectsHandler, getProjectByIdHandler, createProjectHandler, updateProjectHandler, deleteProjectHandler } from '../controllers/project.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { isAdmin } from '../middlewares/isAdmin'
import { validate } from '../middlewares/validate'
import { getProjectsSchema, getProjectByIdSchema, createProjectSchema, updateProjectSchema } from '../validators/project.validators'

const router = Router()

// Public routes
router.get('/', validate(getProjectsSchema, 'query'), getProjectsHandler)
router.get('/:id', validate(getProjectByIdSchema, 'params'), getProjectByIdHandler)

// Admin routes
router.post('/', authMiddleware, isAdmin, validate(createProjectSchema), createProjectHandler)
router.put('/:id',  authMiddleware, isAdmin, validate(getProjectByIdSchema, 'params'), validate(updateProjectSchema), updateProjectHandler)
router.delete('/:id', authMiddleware, isAdmin, validate(getProjectByIdSchema, 'params'), deleteProjectHandler)

export default router