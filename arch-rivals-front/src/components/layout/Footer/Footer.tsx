import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>Tous droits réservés à Footnament</span>
      <span className={styles.tag}>♥ FOOT</span>
    </footer>
  )
}
