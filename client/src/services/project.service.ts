import api from './api'
import type { Project, ProjectsResponse, Theme, Continent } from '../types/project'

export interface GetProjectsParams {
  theme?: string
  continent?: string
  limit?: number
  offset?: number
}

export interface ProjectFormData {
  title: string
  description: string
  theme: Theme
  country: string
  continent: Continent
  associationName: string
  associationUrl: string
  imageUrl?: string
  latitude: number
  longitude: number
  status: 'ACTIVE' | 'COMPLETED' | 'URGENT'
}

export const projectService = {
  async getProjects(params: GetProjectsParams = {}): Promise<ProjectsResponse> {
    const { data } = await api.get('/api/projects', { params })
    return data
  },

  async getProjectById(id: string): Promise<Project> {
    const { data } = await api.get(`/api/projects/${id}`)
    return data.data
  },

  async createProject(formData: ProjectFormData): Promise<Project> {
    const { data } = await api.post('/api/projects', formData)
    return data.data
  },

  async updateProject(id: string, formData: Partial<ProjectFormData>): Promise<Project> {
    const { data } = await api.put(`/api/projects/${id}`, formData)
    return data.data
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/api/projects/${id}`)
  },
}