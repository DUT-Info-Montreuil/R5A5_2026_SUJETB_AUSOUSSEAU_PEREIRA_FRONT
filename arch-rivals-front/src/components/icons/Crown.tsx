import styles from './Crown.module.css'

type CrownProps = {
  animated?: boolean
  className?: string
}

export default function Crown({ animated = true, className }: CrownProps) {
  const classes = [styles.crown, animated && styles.animated, className].filter(Boolean).join(' ')

  return (
    <svg className={classes} width="64" height="44" viewBox="0 0 64 44" aria-hidden="true" focusable="false">
      <polygon
        points="4,40 4,14 18,26 32,4 46,26 60,14 60,40"
        fill="var(--color-gold)"
        stroke="var(--color-gold-hover)"
        strokeWidth="2"
      />
      <rect x="4" y="34" width="56" height="6" fill="var(--color-gold-dark)" />
    </svg>
  )
}
