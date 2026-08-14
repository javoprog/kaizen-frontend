import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../lib/api'
import type { User } from '../lib/types'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const current = await api<User>('/auth/me')
      setUser(current)
      return current
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(input) {
        const result = await api<{ user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        setUser(result.user)
        return result.user
      },
      async register(input) {
        const result = await api<{ user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        setUser(result.user)
        return result.user
      },
      async logout() {
        await api<void>('/auth/logout', { method: 'POST' })
        setUser(null)
      },
      refreshUser,
    }),
    [loading, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
