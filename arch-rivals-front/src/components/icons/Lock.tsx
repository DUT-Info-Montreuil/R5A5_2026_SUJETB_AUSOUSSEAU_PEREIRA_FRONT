type LockProps = {
  /** Cadenas ouvert (équipe ouverte aux demandes) ou fermé. */
  open: boolean
  size?: number
}

export default function Lock({ open, size = 20 }: LockProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="7.5" width="10" height="6.5" />
      <path d={open ? 'M5.5 7.5V5a2.7 2.7 0 0 1 5.2-1' : 'M5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5'} />
    </svg>
  )
}
