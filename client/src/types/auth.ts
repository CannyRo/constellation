export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  role: 'VISITOR' | 'USER' | 'ADMIN'
  points: number
  level: number
  createdAt: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}