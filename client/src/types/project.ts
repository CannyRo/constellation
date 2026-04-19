export interface Project {
  id: string
  title: string
  description: string
  theme: string
  country: string
  continent: string
  associationName: string
  associationUrl: string
  imageUrl?: string | null
  latitude: number
  longitude: number
  status: 'ACTIVE' | 'COMPLETED' | 'URGENT'
  createdAt: string
  _count: {
    pledges: number
  }
}

export interface ProjectsResponse {
  data: Project[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export type Theme =
  | 'HUMAN_RIGHTS'
  | 'ENVIRONMENT'
  | 'HEALTH'
  | 'EDUCATION'
  | 'HUMANITARIAN_AID'
  | 'FREEDOM_OF_PRESS'

export type Continent =
  | 'AFRICA'
  | 'AMERICAS'
  | 'ASIA'
  | 'EUROPE'
  | 'OCEANIA'