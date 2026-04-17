import api from './api'
import type { User } from '../types/auth'

export const authService = {
  async register(email: string, password: string, username: string): Promise<User> {
    const { data } = await api.post('/api/auth/register', { email, password, username })
    return data.user
  },

  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post('/api/auth/login', { email, password })
    return data.user
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/api/users/me')
    return data.user
  },
}