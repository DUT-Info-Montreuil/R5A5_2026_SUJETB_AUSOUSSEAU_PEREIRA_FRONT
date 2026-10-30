import { useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import { fromDateTimeInput, toDateTimeInput } from '../../../utils/dates'
import controls from '../../teams/controls.module.css'
import admin from '../admin.module.css'

type DateTimeFormProps = {
  /** Libellé du champ, ex. « HORAIRE PRÉVU ». */
  label: string
  /** Date enregistrée (ISO), ou null. */
  current: string | null
  /** Un champ vidé envoie null : la date est effacée. */
  onSave: (date: string | null) => Promise<void>
}

/** Date indicative (clôture prévue, horaire d'un match) modifiable sur place. */
export default function DateTimeForm({ label, current, onSave }: DateTimeFormProps) {
  const [value, setValue] = useState(() => toDateTimeInput(current))
  const { pending, error, run } = useAsyncAction()
  const changed = fromDateTimeInput(value) !== current

  function submit(event: FormEvent) {
    event.preventDefault()
    run(() => onSave(fromDateTimeInput(value)))
  }

  return (
    <form className={admin.row} onSubmit={submit}>
      <label className={`${admin.field} ${admin.fieldNarrow}`}>
        <span className={admin.label}>{label}</span>
        <input
          type="datetime-local"
          className={admin.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className={`${controls.btn} ${controls.gold}`}
        disabled={pending || !changed}
      >
        {value || !current ? 'Enregistrer' : 'Effacer'}
      </button>
      {error && (
        <p className={controls.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
