import axios, { type AxiosError, type AxiosInstance } from 'axios'

import { STORAGE_KEYS } from '@/constants/storage'
import { env } from '@/config/env'
import type { ApiError } from '@/types'
import { storage } from '@/utils/storage'

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the bearer token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize every failure into an ApiError, and bounce 401s to the login page.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 0

    if (status === 401) {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const apiError: ApiError = {
      status,
      message:
        error.response?.data?.message ??
        (status === 0 ? 'Network error. Please check your connection.' : error.message),
      errors: error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  },
)
