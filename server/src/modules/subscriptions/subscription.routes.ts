import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import {
    createReservation,
    confirmReservation,
    getReservations,
    cancelReservation,
} from './subscription.controller.js'

const router = Router()

router.use(authMiddleware)
router.post('/reservations', createReservation)
router.post('/reservations/:reservationId/confirm', confirmReservation)
router.get('/reservations', getReservations)
router.post('/reservations/:reservationId/cancel', cancelReservation)

export default router