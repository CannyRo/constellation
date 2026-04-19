import { Link } from 'react-router'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  theme: string
  continent: string
  imageUrl?: string | null
  pledgesCount: number
}

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

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max).trimEnd() + '…' : text

export default function ProjectCard({
  id,
  title,
  description,
  theme,
  continent,
  imageUrl,
  pledgesCount,
}: ProjectCardProps) {
  const themeLabel     = THEME_LABELS[theme]     ?? theme
  const continentLabel = CONTINENT_LABELS[continent] ?? continent

  return (
    <article className={styles.card} aria-label={`Project: ${title}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Illustration for ${title}`}
          className={styles.image}
        />
      ) : (
        <div className={styles.imagePlaceholder} aria-hidden="true" />
      )}

      <div className={styles.body}>
        <p
          className={styles.meta}
          aria-label={`Theme: ${themeLabel}, Continent: ${continentLabel}`}
        >
          <span className={styles.dot} aria-hidden="true" />
          {themeLabel} · {continentLabel}
        </p>

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>
          {truncate(description, 120)}
        </p>

        <div className={styles.footer}>
          <span className={styles.badge} aria-label={`${pledgesCount} pledges`}>
            <span className={styles.star} aria-hidden="true" />
            {pledgesCount} {pledgesCount === 1 ? 'pledge' : 'pledges'}
          </span>

          <Link
            to={`/projects/${id}`}
            className={styles.cta}
            aria-label={`View project: ${title}`}
          >
            View project
          </Link>
        </div>
      </div>
    </article>
  )
}