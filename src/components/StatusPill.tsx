import { Clock3, Flame, Sparkles } from 'lucide-react'
import type { Difficulty } from '../lib/types'

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'violet' | 'gold'
}) {
  return <span className={`status-pill status-${tone}`}>{label}</span>
}

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  const tone = difficulty === 'HARD' || difficulty === 'EPIC' ? 'gold' : 'violet'
  return <StatusPill label={titleCase(difficulty)} tone={tone} />
}

export function TimePill({ minutes }: { minutes: number | null }) {
  return (
    <span className="meta-pill">
      <Clock3 size={13} /> {minutes ? `${minutes} min` : 'Flexible'}
    </span>
  )
}

export function XpPill({ xp }: { xp: number }) {
  return (
    <span className="xp-pill">
      <Sparkles size={13} /> +{xp} XP
    </span>
  )
}

export function StreakPill({ streak }: { streak: number }) {
  return (
    <span className="meta-pill streak-pill">
      <Flame size={14} /> {streak} day{streak === 1 ? '' : 's'}
    </span>
  )
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}
