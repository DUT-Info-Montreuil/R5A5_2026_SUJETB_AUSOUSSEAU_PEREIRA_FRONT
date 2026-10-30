// Chaque validateur renvoie un message d'erreur, ou null si la valeur est valide.
// Les bornes sont celles des schémas du back : le front ne refuse rien que le back accepte.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const USERNAME_MIN = 3
export const USERNAME_MAX = 32
export const PASSWORD_MIN = 8
/** bcrypt ignore tout ce qui dépasse 72 octets : on refuse plutôt que de tronquer en silence. */
const PASSWORD_MAX_BYTES = 72

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
  return null
}

export function validatePassword(value: string) {
  if (!value) return 'Le mot de passe est obligatoire.'
  if (value.length < PASSWORD_MIN) return `Au moins ${PASSWORD_MIN} caractères.`
  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) return 'Mot de passe trop long.'
  return null
}

const TEAM_NAME_MIN = 2
export const TEAM_NAME_MAX = 50

export function validateTeamName(value: string) {
  const v = value.trim()
  if (!v) return "Le nom de l'équipe est obligatoire."
  if (v.length < TEAM_NAME_MIN || v.length > TEAM_NAME_MAX)
    return `Entre ${TEAM_NAME_MIN} et ${TEAM_NAME_MAX} caractères.`
  return null
}
