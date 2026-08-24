import React, { createContext, useContext, useState, useEffect } from 'react'
import { Effect } from 'effect'
import { AuthService } from '../services/auth-service'
import { setOnUnauthorized } from '../services/api-client'
import type { User, Household } from '../domain/auth.schema'

interface AuthContextType {
  user: User | null
  household: Household | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string, fullName: string, householdName?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = AuthService.getCurrentUser()
  const [user, setUser] = useState<User | null>(initial?.user ?? null)
  const [household, setHousehold] = useState<Household | null>(initial?.household ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)

  // Register 401 handler to auto-logout on token expiry
  useEffect(() => {
    setOnUnauthorized(() => {
      AuthService.logout()
      setUser(null)
      setHousehold(null)
      setToken(null)
    })
    return () => setOnUnauthorized(null)
  }, [])

  const login = async (username: string, password: string) => {
    const program = AuthService.login(username, password).pipe(
      Effect.map((payload) => {
        setUser(payload.user)
        setHousehold(payload.household)
        setToken(payload.token)
        return { success: true }
      }),
      Effect.catchAll((err) =>
        Effect.succeed({
          success: false,
          error: 'message' in err ? err.message : 'Login failed'
        })
      )
    )
    return await Effect.runPromise(program)
  }

  const register = async (username: string, password: string, fullName: string, householdName?: string) => {
    const program = AuthService.register(username, password, fullName, householdName).pipe(
      Effect.map((payload) => {
        setUser(payload.user)
        setHousehold(payload.household)
        setToken(payload.token)
        return { success: true }
      }),
      Effect.catchAll((err) =>
        Effect.succeed({
          success: false,
          error: 'message' in err ? err.message : 'Registration failed'
        })
      )
    )
    return await Effect.runPromise(program)
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setHousehold(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
