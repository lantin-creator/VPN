import { apiRequest } from './client'

export type VpnKeyStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export interface VpnKey {
    id: string
    key: string
    status: VpnKeyStatus
    expiresAt: string
    createdAt: string
    revokedAt?: string | null
    subscription?: {
        plan: 'MONTH' | 'QUARTER' | 'YEAR'
        status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    }
}

interface VpnKeysResponse {
    success: boolean
    data: { keys: VpnKey[] }
}

interface RegenerateVpnKeyResponse {
    success: boolean
    data: { key: VpnKey }
}

export const getVpnKeys = (token: string) =>
    apiRequest<VpnKeysResponse>('/subscriptions/vpn-keys', { token })

export const regenerateVpnKey = (keyId: string, token: string) =>
    apiRequest<RegenerateVpnKeyResponse>(
        `/subscriptions/vpn-keys/${keyId}/regenerate`,
        { method: 'POST', token },
    )
