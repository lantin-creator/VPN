import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import prisma from './config/prisma.js'
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import balanceRoutes from './modules/balance/balance.routes.js'
import subscriptionRoutes from './modules/subscriptions/subscription.routes.js'

const app = express()

const PORT = Number(process.env.PORT) || 3000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}))

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'RVPN backend is running',
    })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/balance', balanceRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

const startServer = async () => {
    try {
        await prisma.$connect()

        app.listen(PORT, () => {
            console.log(`RVPN backend is running at http://localhost:${PORT}`)
            console.log(`Health check: http://localhost:${PORT}/api/health`)
        })
    } catch (error) {
        console.error('Failed to start the server:', error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

const shutdown = async () => {
    console.log('Shutting down server...')
    await prisma.$disconnect()
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

startServer()