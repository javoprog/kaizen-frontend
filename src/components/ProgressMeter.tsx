import { ProgressBar } from '@heroui/react'

export function ProgressMeter({
  value,
  label,
  tone = 'violet',
}: {
  value: number
  label?: string
  tone?: 'violet' | 'gold' | 'green'
}) {
  return (
    <ProgressBar value={value} aria-label={label ?? 'Progress'} className={`meter meter-${tone}`}>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  )
}
