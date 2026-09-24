// Chaque validateur renvoie un message d'erreur, ou null si la valeur est valide.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[A-Za-z0-9_.-]+$/

export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
export const PASSWORD_MIN = 8
/** bcrypt ignore tout ce qui dépasse 72 octets : on refuse plutôt que de tronquer en silence. */
export const PASSWORD_MAX_BYTES = 72

export function required(value: string, label: string) {
  return value.trim() ? null : `${label} est obligatoire.`
}

export function validateEmail(value: string) {
  if (!value.trim()) return "L'e-mail est obligatoire."
  return EMAIL_RE.test(value.trim()) ? null : 'Adresse e-mail invalide.'
}

export function validateUsername(value: string) {
  const v = value.trim()
  if (!v) return "Le nom d'utilisateur est obligatoire."
  if (v.length < USERNAME_MIN || v.length > USERNAME_MAX)
    return `Entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères.`
  return USERNAME_RE.test(v) ? null : 'Lettres, chiffres, « _ », « - » ou « . » uniquement.'
}

export function validatePassword(value: string) {
  if (!value) return 'Le mot de passe est obligatoire.'
  if (value.length < PASSWORD_MIN) return `Au moins ${PASSWORD_MIN} caractères.`
  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) return 'Mot de passe trop long.'
  return null
}
