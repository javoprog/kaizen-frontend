import { Description, Input, Label, TextArea, TextField } from '@heroui/react'

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
    <TextField isRequired={required} fullWidth>
      <Label>{label}</Label>
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        variant={variant}
        fullWidth
      />
      {description && <Description>{description}</Description>}
    </TextField>
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
}: Omit<FieldProps, 'type' | 'required' | 'autoComplete'>) {
  return (
    <TextField fullWidth>
      <Label>{label}</Label>
      <TextArea
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        variant={variant}
        fullWidth
      />
      {description && <Description>{description}</Description>}
    </TextField>
  )
}
