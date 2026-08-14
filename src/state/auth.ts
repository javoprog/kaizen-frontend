import { createContext, useContext } from 'react'
import type { User } from '../lib/types'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (input: { email: string; password: string }) => Promise<User>
  register: (input: {
    email: string
    username: string
    password: string
    displayName: string
    timezone: string
  }) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
