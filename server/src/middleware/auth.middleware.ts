import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET

    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must contain at least 32 characters')
    }

    return secret
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Требуется авторизация',
        })
        return
    }

    const token = authorization.slice(7)

    try {
        const payload: unknown = jwt.verify(token, getJwtSecret())

        if (
            typeof payload !== 'object' ||
            payload === null ||
            !('userId' in payload) ||
            typeof payload.userId !== 'string'
        ) {
            res.status(401).json({
                success: false,
                message: 'Недействительный токен',
            })
            return
        }

        req.userId = payload.userId
        next()
    } catch {
        res.status(401).json({
            success: false,
            message: 'Токен недействителен или истёк',
        })
    }
}