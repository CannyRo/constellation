import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, AuthContextType } from '../types/auth'
import { authService } from '../services/auth.service'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // During setup: Check if a valid cookie already exists
  useEffect(() => {
    authService.getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password)
    setUser(user)
  }

  const register = async (email: string, password: string, username: string) => {
    const user = await authService.register(email, password, username)
    setUser(user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    const user = await authService.getMe()
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom Hook — useContext(AuthContext)
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}