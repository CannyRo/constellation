import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { projectService } from '../services/project.service'
import type { Project } from '../types/project'
import styles from './AdminDashboard.module.css'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  URGENT:    'Urgent',
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects]           = useState<Project[]>([])
  const [total, setTotal]                 = useState(0)
  const [offset, setOffset]               = useState(0)
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<Project | null>(null)
  const [isDeleting, setIsDeleting]       = useState(false)
  const [deleteError, setDeleteError]     = useState<string | null>(null)

  const LIMIT = 20

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await projectService.getProjects({ limit: LIMIT, offset })
      setProjects(res.data)
      setTotal(res.pagination.total)
    } catch {
      setError('Unable to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [offset])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await projectService.deleteProject(deleteTarget.id)
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      setDeleteError('Unable to delete this project. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages  = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Admin Dashboard</h1>
        <p className={styles.subheading} aria-live="polite">
          {isLoading ? 'Loading…' : `${total} project${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => navigate('/admin/projects/new')}
          aria-label="Create a new project"
        >
          + New project
        </button>
      </div>

      {error && (
        <div role="alert" className={styles.error}>{error}</div>
      )}

      {/* Table */}
      {!error && (
        <section aria-label="Projects table" aria-busy={isLoading}>
          {isLoading ? (
            <div className={styles.loading} aria-label="Loading projects">
              <span aria-hidden="true">✦</span> Loading…
            </div>
          ) : projects.length === 0 ? (
            <p className={styles.empty}>No projects yet.</p>
          ) : (
            <table className={styles.table} aria-label="Projects">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id}>
                    <td className={styles.titleCell}>
                      {project.title}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[`status${project.status}`]}`}
                        aria-label={`Status: ${STATUS_LABELS[project.status] ?? project.status}`}
                      >
                        {STATUS_LABELS[project.status] ?? project.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                        aria-label={`Edit project: ${project.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => setDeleteTarget(project)}
                        aria-label={`Delete project: ${project.title}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-desc"
        >
          <div className={styles.modal}>
            <h2 id="delete-modal-title" className={styles.modalTitle}>
              Delete project
            </h2>
            <p id="delete-modal-desc" className={styles.modalDesc}>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.title}</strong>?
              This will also delete all associated pledges. This action cannot be undone.
            </p>

            {deleteError && (
              <div role="alert" className={styles.error}>{deleteError}</div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                disabled={isDeleting}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteButton}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                aria-label={`Confirm deletion of ${deleteTarget.title}`}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}