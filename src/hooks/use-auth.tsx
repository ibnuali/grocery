import React, { createContext, useContext, useState, useEffect } from 'react'
import { Effect } from 'effect'
import { AuthService } from '../services/auth-service'
import { setOnUnauthorized } from '../services/api-client'
import type { User } from '../domain/auth.schema'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = AuthService.getCurrentUser()
  const [user, setUser] = useState<User | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)

  useEffect(() => {
    setOnUnauthorized(() => {
      AuthService.logout()
      setUser(null)
      setToken(null)
    })
    return () => setOnUnauthorized(null)
  }, [])

  const login = async (email: string, password: string) => {
    const program = AuthService.login(email, password).pipe(
      Effect.map((payload) => {
        setUser(payload.user)
        setToken('session')
        return { success: true }
      }),
      Effect.catchAll((err) => Effect.succeed({ success: false, error: 'message' in err ? err.message : 'Login failed' }))
    )
    return await Effect.runPromise(program)
  }

  const register = async (email: string, password: string, name: string) => {
    const program = AuthService.register(email, password, name).pipe(
      Effect.map((payload) => {
        setUser(payload.user)
        setToken('session')
        return { success: true }
      }),
      Effect.catchAll((err) => Effect.succeed({ success: false, error: 'message' in err ? err.message : 'Registration failed' }))
    )
    return await Effect.runPromise(program)
  }

  const updateUser = (nextUser: User) => {
    setUser(nextUser)
    localStorage.setItem('grocery_user', JSON.stringify(nextUser))
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
