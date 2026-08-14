import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  description?: string
  required?: boolean
  autoComplete?: string
  variant?: 'primary' | 'secondary'
  rows?: number
}

export function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  description,
  required,
  autoComplete,
  variant = 'primary',
}: FieldProps) {
  return (
    <div className="textfield">
      <label className="label" htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        variant={variant}
        required={required}
      />
      {description && <p className="description">{description}</p>}
    </div>
  )
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  description,
  variant = 'primary',
  rows,
}: Omit<FieldProps, 'type' | 'required' | 'autoComplete'>) {
  return (
    <div className="textfield">
      <label className="label" htmlFor={name}>{label}</label>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        variant={variant}
        rows={rows}
      />
      {description && <p className="description">{description}</p>}
    </div>
  )
}
