import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import {
    createReservation,
    confirmReservation,
    getReservations,
    cancelReservation,
    getVpnKeys,
    regenerateVpnKey,
} from './subscription.controller.js'
import { refundSubscription } from './subscription.controller.js';

const router = Router()

router.use(authMiddleware)
router.post('/reservations', createReservation)
router.post('/reservations/:reservationId/confirm', confirmReservation)
router.get('/reservations', getReservations)
router.get('/vpn-keys', getVpnKeys)
router.post('/vpn-keys/:keyId/regenerate', regenerateVpnKey)
router.post('/reservations/:reservationId/cancel', cancelReservation)
router.post('/:subscriptionId/refund', authMiddleware, refundSubscription);


export default router