import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware.js'

import {
    getBalance,
    getTransactions,
    topUpBalance,
} from './balance.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getBalance)
router.get('/transactions', getTransactions)
router.post('/top-up', topUpBalance)

export default router