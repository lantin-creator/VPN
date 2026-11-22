import { Router } from 'express'

import {
    getProfile,
    updateProfile,
} from './users.controller.js'

import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/me', getProfile)
router.patch('/me', updateProfile)

export default router