import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { projectService } from '../services/project.service'
import type { Project } from '../types/project'
import { useAuth } from '../context/AuthContext'
import styles from './ProjectDetail.module.css'

const THEME_LABELS: Record<string, string> = {
  HUMAN_RIGHTS:     'Human Rights',
  ENVIRONMENT:      'Environment',
  HEALTH:           'Health',
  EDUCATION:        'Education',
  HUMANITARIAN_AID: 'Humanitarian Aid',
  FREEDOM_OF_PRESS: 'Freedom of Press',
}

const CONTINENT_LABELS: Record<string, string> = {
  AFRICA:   'Africa',
  AMERICAS: 'Americas',
  ASIA:     'Asia',
  EUROPE:   'Europe',
  OCEANIA:  'Oceania',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  URGENT:    'Urgent',
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [project, setProject]   = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    projectService
      .getProjectById(id)
      .then(setProject)
      .catch((err: { response?: { status: number } }) => {
        if (err?.response?.status === 404) {
          setError('This project does not exist.')
        } else {
          setError('Unable to load this project. Please try again.')
        }
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading} aria-label="Loading project">
          <span aria-hidden="true">✦</span> Loading…
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className={styles.page}>
        <div role="alert" className={styles.error}>
          {error ?? 'Project not found.'}
        </div>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/projects')}
        >
          ← Back to projects
        </button>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/projects">Projects</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{project.title}</span>
      </nav>

      <article aria-label={`Project: ${project.title}`}>
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={`Illustration for ${project.title}`}
            className={styles.image}
          />
        )}

        <div className={styles.content}>
          {/* Meta */}
          <div className={styles.meta}>
            <span
              className={styles.metaTag}
              aria-label={`Theme: ${THEME_LABELS[project.theme] ?? project.theme}`}
            >
              {THEME_LABELS[project.theme] ?? project.theme}
            </span>
            <span
              className={styles.metaTag}
              aria-label={`Continent: ${CONTINENT_LABELS[project.continent] ?? project.continent}`}
            >
              {CONTINENT_LABELS[project.continent] ?? project.continent}
            </span>
            <span
              className={`${styles.metaTag} ${styles[`status${project.status}`]}`}
              aria-label={`Status: ${STATUS_LABELS[project.status] ?? project.status}`}
            >
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>

          <h1 className={styles.title}>{project.title}</h1>

          {/* Stats */}
          <div className={styles.stats}>
            <span className={styles.pledgeCount} aria-label={`${project._count.pledges} pledges`}>
              <span className={styles.star} aria-hidden="true" />
              {project._count.pledges} {project._count.pledges === 1 ? 'pledge' : 'pledges'}
            </span>
            <span className={styles.country} aria-label={`Country: ${project.country}`}>
              📍 {project.country}
            </span>
          </div>

          <p className={styles.description}>{project.description}</p>

          {/* Association */}
          <div className={styles.association}>
            <span className={styles.associationLabel}>Association</span>
            <a
              href={project.associationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.associationLink}
              aria-label={`Visit ${project.associationName} website (opens in new tab)`}
            >
              {project.associationName} ↗
            </a>
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            {isAuthenticated ? (
              <button
                type="button"
                className={styles.pledgeButton}
                aria-label={`Make a pledge for ${project.title}`}
              >
                Make a pledge
              </button>
            ) : (
              <Link
                to="/login"
                className={styles.loginLink}
                aria-label="Sign in to make a pledge"
              >
                Sign in to make a pledge
              </Link>
            )}
          </div>
        </div>
      </article>
    </main>
  )
}