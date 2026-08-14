import { Progress } from './ui'

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
    <Progress value={value} aria-label={label ?? 'Progress'} className={`meter meter-${tone}`} />
  )
}
