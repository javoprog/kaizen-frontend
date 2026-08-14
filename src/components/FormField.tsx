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
}: Omit<FieldProps, 'type' | 'required' | 'autoComplete'>) {
  return (
    <TextField fullWidth>
      <Label>{label}</Label>
      <TextArea
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        fullWidth
      />
      {description && <Description>{description}</Description>}
    </TextField>
  )
}
