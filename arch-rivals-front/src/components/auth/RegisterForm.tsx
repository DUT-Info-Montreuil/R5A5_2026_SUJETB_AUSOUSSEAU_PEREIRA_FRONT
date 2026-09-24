import { useState, type FormEvent } from 'react'
import type { RegisterPayload } from '../../types/auth'
import {
  PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validation'
import styles from './AuthForm.module.css'
import Field from './Field'

type Errors = Partial<Record<keyof RegisterPayload, string | null>>

type RegisterFormProps = {
  onSubmit: (payload: RegisterPayload) => Promise<void>
  onSwitchToLogin: () => void
}

const FIELD_ORDER: (keyof RegisterPayload)[] = ['email', 'username', 'password']

function validate(values: RegisterPayload): Errors {
  return {
    email: validateEmail(values.email),
    username: validateUsername(values.username),
    password: validatePassword(values.password),
  }
}

export default function RegisterForm({ onSubmit, onSwitchToLogin }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterPayload>({ email: '', username: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof RegisterPayload) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: null }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstInvalid = FIELD_ORDER.find((k) => nextErrors[k])
    if (firstInvalid) {
      document.getElementById(`register-${firstInvalid}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Inscription impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field
        id="register-email"
        label="E-mail"
        type="email"
        inputMode="email"
        value={values.email}
        onChange={update('email')}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        id="register-username"
        label="Nom d'utilisateur"
        value={values.username}
        onChange={update('username')}
        error={errors.username}
        hint={`${USERNAME_MIN} à ${USERNAME_MAX} caractères : lettres, chiffres, _ - .`}
        autoComplete="username"
      />
      <Field
        id="register-password"
        label="Mot de passe"
        type="password"
        value={values.password}
        onChange={update('password')}
        error={errors.password}
        hint={`Au moins ${PASSWORD_MIN} caractères.`}
        autoComplete="new-password"
        revealable
      />

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Création…' : 'Créer mon compte'}
      </button>

      <p className={styles.switch}>
        Déjà un compte ?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitchToLogin}>
          Se connecter
        </button>
      </p>
    </form>
  )
}
