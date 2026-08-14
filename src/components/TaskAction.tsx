import { Button } from '@heroui/react'
import { Check, Circle } from 'lucide-react'
import type { Task } from '../lib/types'
import { DifficultyPill, TimePill, XpPill } from './StatusPill'

const xpByDifficulty = { TINY: 5, EASY: 10, MEDIUM: 25, HARD: 50, EPIC: 100 }

export function TaskAction({
  task,
  completing,
  onComplete,
}: {
  task: Task
  completing: boolean
  onComplete: (task: Task) => void
}) {
  return (
    <div className={`task-action ${task.completed ? 'completed' : ''}`}>
      <span className="task-state">{task.completed ? <Check size={15} /> : <Circle size={15} />}</span>
      <div className="task-action-copy">
        <strong>{task.title}</strong>
        <div className="task-meta">
          <DifficultyPill difficulty={task.difficulty} />
          <TimePill minutes={task.durationMinutes} />
          <XpPill xp={xpByDifficulty[task.difficulty]} />
        </div>
      </div>
      <Button
        size="sm"
        variant={task.completed ? 'secondary' : 'primary'}
        isDisabled={task.completed}
        isPending={completing}
        onPress={() => onComplete(task)}
      >
        {task.completed ? 'Done' : 'Complete'}
      </Button>
    </div>
  )
}
