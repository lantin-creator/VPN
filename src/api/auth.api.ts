import { apiRequest } from './client'

export type User = {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    birthDate?: string | null
    city?: string | null
    phone?: string | null
    balance: number
    createdAt: string
}

export type AccountProfile = User & {
    birthDate: string | null
    city: string | null
    phone: string | null
}

export type AuthResponse = {
    success: boolean
    message: string
    token: string
    user: User
}

export type UserResponse<T = User> = {
    success: boolean
    user: T
}

export type ProfileUpdate = {
    firstName: string | null
    lastName: string | null
    birthDate: string | null
    city: string | null
    phone: string | null
}

export const registerRequest = (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { email, password },
    })

export const loginRequest = (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
    })

export const getCurrentUser = (token: string) =>
    apiRequest<UserResponse>('/auth/me', { token })

export const getProfile = (token: string) =>
    apiRequest<UserResponse<AccountProfile>>('/users/me', { token })

export const updateProfile = (token: string, profile: ProfileUpdate) =>
    apiRequest<UserResponse<AccountProfile>>('/users/me', {
        method: 'PATCH',
        token,
        body: profile,
})
