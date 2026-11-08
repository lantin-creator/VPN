const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export type ApiError = Error & {
    status?: number
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    token?: string | null
}

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`
    }

    let response: Response

    try {
        response = await fetch(`${API_URL}${path}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
        })
    } catch {
        throw new Error('Не удалось подключиться к серверу. Проверь, запущен ли backend.')
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        const error = new Error(
            data?.message || `Ошибка сервера: ${response.status}`,
        ) as ApiError

        error.status = response.status
        throw error
    }

    return data as T
}
