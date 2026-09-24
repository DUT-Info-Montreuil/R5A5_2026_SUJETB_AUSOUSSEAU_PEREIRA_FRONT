import { useState, type InputHTMLAttributes } from 'react'
import styles from './AuthForm.module.css'

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  hint?: string
  /** Ajoute un bouton « Afficher / Masquer » (champs mot de passe). */
  revealable?: boolean
} & Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'autoComplete' | 'inputMode'>

export default function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  revealable = false,
  type = 'text',
  ...inputProps
}: FieldProps) {
  const [revealed, setRevealed] = useState(false)
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          id={id}
          name={id}
          className={styles.input}
          type={revealable && revealed ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          spellCheck={false}
          autoCapitalize="none"
          {...inputProps}
        />
        {revealable && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
            aria-controls={id}
          >
            {revealed ? 'Masquer' : 'Afficher'}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
