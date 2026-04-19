import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router'
import { projectService, type ProjectFormData } from '../services/project.service'
import type { Theme, Continent } from '../types/project'
import styles from './ProjectForm.module.css'

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

const STATUSES = [
  { value: 'ACTIVE',    label: 'Active' },
  { value: 'URGENT',    label: 'Urgent' },
  { value: 'COMPLETED', label: 'Completed' },
]

const EMPTY_FORM: ProjectFormData = {
  title:           '',
  description:     '',
  theme:           'HUMAN_RIGHTS',
  country:         '',
  continent:       'AFRICA',
  associationName: '',
  associationUrl:  '',
  imageUrl:        '',
  latitude:        0,
  longitude:       0,
  status:          'ACTIVE',
}

type FieldErrors = Partial<Record<keyof ProjectFormData, string>>

function validate(form: ProjectFormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.title.trim())           errors.title           = 'Title is required.'
  if (!form.description.trim())     errors.description     = 'Description is required.'
  if (!form.country.trim())         errors.country         = 'Country is required.'
  if (!form.associationName.trim()) errors.associationName = 'Association name is required.'
  if (!form.associationUrl.trim())  errors.associationUrl  = 'Association URL is required.'
  else if (!/^https?:\/\/.+/.test(form.associationUrl))
                                    errors.associationUrl  = 'Must be a valid URL (https://...).'
  if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl))
                                    errors.imageUrl        = 'Must be a valid URL (https://...).'
  if (form.latitude < -90 || form.latitude > 90)
                                    errors.latitude        = 'Must be between -90 and 90.'
  if (form.longitude < -180 || form.longitude > 180)
                                    errors.longitude       = 'Must be between -180 and 180.'
  return errors
}

export default function ProjectForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm]               = useState<ProjectFormData>(EMPTY_FORM)
  const [errors, setErrors]           = useState<FieldErrors>({})
  const [isLoading, setIsLoading]     = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load existing project when editing
  useEffect(() => {
    if (!id) return
    projectService
      .getProjectById(id)
      .then(project => {
        setForm({
          title:           project.title,
          description:     project.description,
          theme:           project.theme as Theme,
          country:         project.country,
          continent:       project.continent as Continent,
          associationName: project.associationName,
          associationUrl:  project.associationUrl,
          imageUrl:        project.imageUrl ?? '',
          latitude:        project.latitude,
          longitude:       project.longitude,
          status:          project.status,
        })
      })
      .catch(() => setSubmitError('Unable to load project data.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value,
    }))
    // Clear error on change
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      // Move focus to first error
      const firstErrorField = Object.keys(fieldErrors)[0]
      document.getElementById(firstErrorField)?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { ...form, imageUrl: form.imageUrl || undefined }
      if (isEditing && id) {
        await projectService.updateProject(id, payload)
      } else {
        await projectService.createProject(payload)
      }
      navigate('/admin')
    } catch {
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading} aria-label="Loading project">
          <span aria-hidden="true">✦</span> Loading…
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>
        {isEditing ? 'Edit project' : 'New project'}
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label={isEditing ? 'Edit project form' : 'Create project form'}
        className={styles.form}
      >
        {submitError && (
          <div role="alert" className={styles.submitError}>{submitError}</div>
        )}

        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Title <span aria-hidden="true" className={styles.required}>*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby={errors.title ? 'title-error' : undefined}
            aria-invalid={!!errors.title}
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          />
          {errors.title && (
            <span id="title-error" role="alert" className={styles.fieldError}>
              {errors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description <span aria-hidden="true" className={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby={errors.description ? 'description-error' : undefined}
            aria-invalid={!!errors.description}
            rows={4}
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          />
          {errors.description && (
            <span id="description-error" role="alert" className={styles.fieldError}>
              {errors.description}
            </span>
          )}
        </div>

        {/* Theme + Continent */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="theme" className={styles.label}>
              Theme <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <select
              id="theme"
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className={styles.select}
              aria-required="true"
            >
              {THEMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="continent" className={styles.label}>
              Continent <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <select
              id="continent"
              name="continent"
              value={form.continent}
              onChange={handleChange}
              className={styles.select}
              aria-required="true"
            >
              {CONTINENTS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Country */}
        <div className={styles.field}>
          <label htmlFor="country" className={styles.label}>
            Country <span aria-hidden="true" className={styles.required}>*</span>
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={form.country}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby={errors.country ? 'country-error' : undefined}
            aria-invalid={!!errors.country}
            className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
          />
          {errors.country && (
            <span id="country-error" role="alert" className={styles.fieldError}>
              {errors.country}
            </span>
          )}
        </div>

        {/* Association */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="associationName" className={styles.label}>
              Association name <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <input
              id="associationName"
              name="associationName"
              type="text"
              value={form.associationName}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={errors.associationName ? 'associationName-error' : undefined}
              aria-invalid={!!errors.associationName}
              className={`${styles.input} ${errors.associationName ? styles.inputError : ''}`}
            />
            {errors.associationName && (
              <span id="associationName-error" role="alert" className={styles.fieldError}>
                {errors.associationName}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="associationUrl" className={styles.label}>
              Association URL <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <input
              id="associationUrl"
              name="associationUrl"
              type="url"
              value={form.associationUrl}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={errors.associationUrl ? 'associationUrl-error' : undefined}
              aria-invalid={!!errors.associationUrl}
              placeholder="https://"
              className={`${styles.input} ${errors.associationUrl ? styles.inputError : ''}`}
            />
            {errors.associationUrl && (
              <span id="associationUrl-error" role="alert" className={styles.fieldError}>
                {errors.associationUrl}
              </span>
            )}
          </div>
        </div>

        {/* Image URL */}
        <div className={styles.field}>
          <label htmlFor="imageUrl" className={styles.label}>
            Image URL <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            aria-describedby={errors.imageUrl ? 'imageUrl-error' : undefined}
            aria-invalid={!!errors.imageUrl}
            placeholder="https://"
            className={`${styles.input} ${errors.imageUrl ? styles.inputError : ''}`}
          />
          {errors.imageUrl && (
            <span id="imageUrl-error" role="alert" className={styles.fieldError}>
              {errors.imageUrl}
            </span>
          )}
        </div>

        {/* Latitude + Longitude */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="latitude" className={styles.label}>
              Latitude <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              value={form.latitude}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={errors.latitude ? 'latitude-error' : 'latitude-hint'}
              aria-invalid={!!errors.latitude}
              step="any"
              min="-90"
              max="90"
              className={`${styles.input} ${errors.latitude ? styles.inputError : ''}`}
            />
            <span id="latitude-hint" className={styles.hint}>Between -90 and 90</span>
            {errors.latitude && (
              <span id="latitude-error" role="alert" className={styles.fieldError}>
                {errors.latitude}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="longitude" className={styles.label}>
              Longitude <span aria-hidden="true" className={styles.required}>*</span>
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              value={form.longitude}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={errors.longitude ? 'longitude-error' : 'longitude-hint'}
              aria-invalid={!!errors.longitude}
              step="any"
              min="-180"
              max="180"
              className={`${styles.input} ${errors.longitude ? styles.inputError : ''}`}
            />
            <span id="longitude-hint" className={styles.hint}>Between -180 and 180</span>
            {errors.longitude && (
              <span id="longitude-error" role="alert" className={styles.fieldError}>
                {errors.longitude}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>
            Status <span aria-hidden="true" className={styles.required}>*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={styles.select}
            aria-required="true"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate('/admin')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isEditing ? 'Saving…' : 'Creating…')
              : (isEditing ? 'Save changes' : 'Create project')}
          </button>
        </div>
      </form>
    </main>
  )
}