import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function KaizenDatePicker({
  value,
  onChange,
}: {
  value: DateValue | null
  onChange: (value: DateValue | null) => void
}) {
  return (
    <div className="date-picker">
      <label className="label" htmlFor="target-date">Target date <span className="optional">Optional</span></label>
      <Input
        id="target-date"
        type="date"
        min={today(getLocalTimeZone()).toString()}
        value={value?.toString() ?? ''}
        onChange={(event) => onChange(event.target.value ? parseDate(event.target.value) : null)}
      />
      <p className="description">A deadline helps Kaizen calculate your pace.</p>
    </div>
  )
}

export function KaizenSelect({
  label,
  value,
  onChange,
  options,
  description,
  variant = 'primary',
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  description?: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}) {
  return (
    <div className="select" data-variant={variant}>
      <span className="label">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label={label}><SelectValue placeholder="Select one" /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {description && <p className="description">{description}</p>}
    </div>
  )
}
