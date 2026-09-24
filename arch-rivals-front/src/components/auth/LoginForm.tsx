import { useState, type FormEvent } from 'react'
import type { LoginPayload } from '../../types/auth'
import { required } from '../../utils/validation'
import styles from './AuthForm.module.css'
import Field from './Field'

type Errors = Partial<Record<keyof LoginPayload, string | null>>

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => Promise<void>
  onSwitchToRegister: () => void
}

function validate(values: LoginPayload): Errors {
  return {
    username: required(values.username, "Le nom d'utilisateur"),
    password: required(values.password, 'Le mot de passe'),
  }
}

export default function LoginForm({ onSubmit, onSwitchToRegister }: LoginFormProps) {
  const [values, setValues] = useState<LoginPayload>({ username: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof LoginPayload) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: null }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstInvalid = (Object.keys(nextErrors) as (keyof LoginPayload)[]).find((k) => nextErrors[k])
    if (firstInvalid) {
      document.getElementById(`login-${firstInvalid}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ username: values.username.trim(), password: values.password })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Connexion impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field
        id="login-username"
        label="Nom d'utilisateur"
        value={values.username}
        onChange={update('username')}
        error={errors.username}
        autoComplete="username"
      />
      <Field
        id="login-password"
        label="Mot de passe"
        type="password"
        value={values.password}
        onChange={update('password')}
        error={errors.password}
        autoComplete="current-password"
        revealable
      />

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className={styles.switch}>
        Pas encore de compte ?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitchToRegister}>
          Créer un compte
        </button>
      </p>
    </form>
  )
}
