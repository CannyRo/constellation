import { useState, useEffect, useCallback } from 'react'
import { projectService } from '../services/project.service'
import type { Project, Theme, Continent } from '../types/project'
import ProjectCard from '../components/ProjectCard'
import styles from './Projects.module.css'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'HUMAN_RIGHTS',     label: 'Human Rights' },
  { value: 'ENVIRONMENT',      label: 'Environment' },
  { value: 'HEALTH',           label: 'Health' },
  { value: 'EDUCATION',        label: 'Education' },
  { value: 'HUMANITARIAN_AID', label: 'Humanitarian Aid' },
  { value: 'FREEDOM_OF_PRESS', label: 'Freedom of Press' },
]

const CONTINENTS: { value: Continent; label: string }[] = [
  { value: 'AFRICA',   label: 'Africa' },
  { value: 'AMERICAS', label: 'Americas' },
  { value: 'ASIA',     label: 'Asia' },
  { value: 'EUROPE',   label: 'Europe' },
  { value: 'OCEANIA',  label: 'Oceania' },
]

const LIMIT = 12

export default function Projects() {
  const [projects, setProjects]     = useState<Project[]>([])
  const [total, setTotal]           = useState(0)
  const [offset, setOffset]         = useState(0)
  const [theme, setTheme]           = useState<Theme | ''>('')
  const [continent, setContinent]   = useState<Continent | ''>('')
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await projectService.getProjects({
        ...(theme     && { theme }),
        ...(continent && { continent }),
        limit: LIMIT,
        offset,
      })
      setProjects(res.data)
      setTotal(res.pagination.total)
    } catch {
      setError('Unable to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [theme, continent, offset])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Reset offset when filters change
  const handleThemeChange = (value: Theme | '') => {
    setTheme(value)
    setOffset(0)
  }

  const handleContinentChange = (value: Continent | '') => {
    setContinent(value)
    setOffset(0)
  }

  const totalPages  = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Projects</h1>
        <p className={styles.subheading}>
          Support humanitarian initiatives around the world.
        </p>
      </div>

      {/* Filters */}
      <section className={styles.filters} aria-label="Filter projects">
        <div className={styles.filterGroup}>
          <label htmlFor="filter-theme" className={styles.filterLabel}>
            Theme
          </label>
          <select
            id="filter-theme"
            value={theme}
            onChange={e => handleThemeChange(e.target.value as Theme | '')}
            className={styles.select}
          >
            <option value="">All themes</option>
            {THEMES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-continent" className={styles.filterLabel}>
            Continent
          </label>
          <select
            id="filter-continent"
            value={continent}
            onChange={e => handleContinentChange(e.target.value as Continent | '')}
            className={styles.select}
          >
            <option value="">All continents</option>
            {CONTINENTS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {(theme || continent) && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => { handleThemeChange(''); handleContinentChange('') }}
          >
            Reset filters
          </button>
        )}
      </section>

      {/* Results count */}
      <p className={styles.resultsCount} aria-live="polite" aria-atomic="true">
        {isLoading ? 'Loading…' : `${total} project${total !== 1 ? 's' : ''} found`}
      </p>

      {/* Error */}
      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      {/* Grid */}
      {!error && (
        <section aria-label="Projects list" aria-busy={isLoading}>
          {isLoading ? (
            <div className={styles.loading} aria-label="Loading projects">
              <span aria-hidden="true">✦</span> Loading…
            </div>
          ) : projects.length === 0 ? (
            <p className={styles.empty}>No projects match your filters.</p>
          ) : (
            <ul className={styles.grid} role="list">
              {projects.map(project => (
                <li key={project.id}>
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    theme={project.theme}
                    continent={project.continent}
                    imageUrl={project.imageUrl}
                    pledgesCount={project._count.pledges}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <nav aria-label="Pagination" className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setOffset(o => o - LIMIT)}
            disabled={offset === 0}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <span className={styles.pageInfo} aria-current="page">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setOffset(o => o + LIMIT)}
            disabled={offset + LIMIT >= total}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </main>
  )
}