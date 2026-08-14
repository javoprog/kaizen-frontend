import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  Label,
  ListBox,
  Select,
} from '@heroui/react'
import type { DateValue } from '@internationalized/date'
import { today, getLocalTimeZone } from '@internationalized/date'

export function KaizenDatePicker({
  value,
  onChange,
}: {
  value: DateValue | null
  onChange: (value: DateValue | null) => void
}) {
  return (
    <DatePicker value={value} onChange={onChange} minValue={today(getLocalTimeZone())}>
      <Label>Target date <span className="optional">Optional</span></Label>
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label="Open target date calendar">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <Description>A deadline helps Kaizen calculate your pace.</Description>
      <DatePicker.Popover>
        <Calendar aria-label="Choose target date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  )
}

export function KaizenSelect({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  description?: string
}) {
  return (
    <Select value={value} onChange={(key) => onChange(String(key))} placeholder="Select one" fullWidth>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {description && <Description>{description}</Description>}
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
