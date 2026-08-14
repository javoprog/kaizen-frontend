import { Alert, Button, Card, Input, Spinner, TextArea } from '@heroui/react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { KaizenSelect } from '../components/GoalFields'
import { api } from '../lib/api'
import type { Difficulty, Goal, PlanSuggestion, SuggestedMilestone } from '../lib/types'
import { useAuth } from '../state/auth'

type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

interface EditableTask {
  clientId: string
  id?: string
  title: string
  description: string
  priority: Priority
  difficulty: Difficulty
  deadline: string
  durationMinutes: number
  completed: boolean
}

interface EditableMilestone {
  clientId: string
  id?: string
  title: string
  description: string
  tasks: EditableTask[]
}

function IconActionHint({ label, children }: { label: string; children: ReactNode }) {
  return <span className="icon-action-hint" title={label}>{children}</span>
}

function editableSuggestion(milestones: SuggestedMilestone[]): EditableMilestone[] {
  return milestones.map((milestone) => ({
    ...milestone,
    clientId: crypto.randomUUID(),
    tasks: milestone.tasks.map((task) => ({
      ...task,
      clientId: crypto.randomUUID(),
      description: '',
      priority: 'MEDIUM',
      deadline: '',
      completed: false,
    })),
  }))
}

function dateInTimezone(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function editableGoal(goal: Goal, timezone: string): EditableMilestone[] {
  return goal.milestones.map((milestone) => ({
    id: milestone.id,
    clientId: milestone.id,
    title: milestone.title,
    description: milestone.description || '',
    tasks: milestone.tasks.map((task) => ({
      id: task.id,
      clientId: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      difficulty: task.difficulty,
      deadline: task.deadline ? dateInTimezone(task.deadline, timezone) : '',
      durationMinutes: task.durationMinutes || 20,
      completed: task.completed,
    })),
  }))
}

function newTask(): EditableTask {
  return {
    clientId: crypto.randomUUID(),
    title: 'New action',
    description: '',
    priority: 'MEDIUM',
    difficulty: 'EASY',
    deadline: '',
    durationMinutes: 20,
    completed: false,
  }
}

export function PlanReviewPage({ mode = 'draft' }: { mode?: 'draft' | 'edit' }) {
  const { id = '' } = useParams()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [plan, setPlan] = useState<EditableMilestone[]>([])
  const [notice, setNotice] = useState('')
  const [source, setSource] = useState<PlanSuggestion['source']>('LOCAL_PLANNER')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const requestedKey = useRef('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = mode === 'edit'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isEditing) {
        const goalData = await api<Goal>(`/goals/${id}`)
        setGoal(goalData)
        setPlan(editableGoal(goalData, user?.timezone || 'UTC'))
        setNotice('')
      } else {
        const [goalData, suggestion] = await Promise.all([
          api<Goal>(`/goals/${id}`),
          api<PlanSuggestion>(`/goals/${id}/breakdown`, { method: 'POST' }),
        ])
        setGoal(goalData)
        setPlan(editableSuggestion(suggestion.milestones))
        setNotice(suggestion.notice)
        setSource(suggestion.source)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this plan')
    } finally {
      setLoading(false)
    }
  }, [id, isEditing, user?.timezone])

  useEffect(() => {
    const key = `${id}:${mode}`
    if (requestedKey.current === key) return
    requestedKey.current = key
    void load()
  }, [id, load, mode])

  function updateMilestone(index: number, patch: Partial<EditableMilestone>) {
    setPlan((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  function updateTask(milestoneIndex: number, taskIndex: number, patch: Partial<EditableTask>) {
    setPlan((current) => current.map((milestone, index) =>
      index === milestoneIndex
        ? {
            ...milestone,
            tasks: milestone.tasks.map((task, currentTaskIndex) =>
              currentTaskIndex === taskIndex ? { ...task, ...patch } : task,
            ),
          }
        : milestone,
    ))
  }

  function moveMilestone(index: number, direction: -1 | 1) {
    setPlan((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function moveTask(milestoneIndex: number, taskIndex: number, direction: -1 | 1) {
    setPlan((current) => current.map((milestone, index) => {
      if (index !== milestoneIndex) return milestone
      const tasks = [...milestone.tasks]
      const target = taskIndex + direction
      if (target < 0 || target >= tasks.length) return milestone
      ;[tasks[taskIndex], tasks[target]] = [tasks[target], tasks[taskIndex]]
      return { ...milestone, tasks }
    }))
  }

  function addMilestone() {
    setPlan((current) => [
      ...current,
      {
        clientId: crypto.randomUUID(),
        title: 'New milestone',
        description: '',
        tasks: [newTask()],
      },
    ])
  }

  const invalidPlan =
    plan.length === 0 ||
    plan.some((milestone) =>
      !milestone.title.trim() ||
      milestone.tasks.some((task) =>
        !task.title.trim() || task.durationMinutes < 5 || task.durationMinutes > 480,
      ),
    )

  async function save() {
    setSaving(true)
    setError('')
    try {
      await api(`/goals/${id}/${isEditing ? 'plan' : 'approve-plan'}`, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          milestones: plan.map(({ id: milestoneId, title, description, tasks }) => ({
            id: milestoneId,
            title,
            description: description || null,
            tasks: tasks.map((task) => ({
              id: task.id,
              title: task.title,
              description: task.description || null,
              priority: task.priority,
              difficulty: task.difficulty,
              deadline: task.deadline || null,
              durationMinutes: task.durationMinutes,
            })),
          })),
        }),
      })
      navigate(`/goals/${id}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save plan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="plan-loading">
        <span className="ai-orbit"><Sparkles size={24} /></span>
        <Spinner aria-label={isEditing ? 'Loading your plan' : 'Building your plan'} />
        <h2>{isEditing ? 'Opening your plan' : 'Shaping a practical path'}</h2>
        <p>{isEditing ? 'Loading the latest milestones and actions.' : 'Kaizen is turning your ambition into milestones and actions.'}</p>
      </div>
    )
  }

  return (
    <div className="page plan-page">
      <div className="plan-topbar">
        <Button variant="ghost" onPress={() => navigate(-1)}><ArrowLeft size={17} /> Back</Button>
        <span className="plan-status"><span /> {isEditing ? 'Approved plan · changes apply when saved' : 'Draft · nothing changes until you approve'}</span>
      </div>
      <div className="page-heading plan-heading">
        <span className="eyebrow"><Sparkles size={14} /> {isEditing ? 'Your plan' : 'Proposed path'}</span>
        <h1>{goal?.title}</h1>
        <p>Edit, add, remove, or reorder the work. Completed actions stay protected so earned XP remains intact.</p>
      </div>

      {notice && (
        <Alert status={source === 'OPENAI' ? 'accent' : 'warning'} className="planner-notice">
          <Alert.Content>
            <Alert.Title>{source === 'OPENAI' ? 'AI draft ready' : 'Local planner active'}</Alert.Title>
            <Alert.Description>{notice}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {error && <ErrorAlert message={error} />}

      <div className="plan-list">
        {plan.map((milestone, milestoneIndex) => {
          const containsCompletedWork = milestone.tasks.some((task) => task.completed)
          return (
            <Card key={milestone.clientId} className="plan-milestone">
              <Card.Header>
                <div className="milestone-number">{String(milestoneIndex + 1).padStart(2, '0')}</div>
                <div className="plan-milestone-fields">
                  <div className="plan-edit-field">
                    <span className="plan-field-label">Milestone</span>
                    <Input
                      variant="secondary"
                      aria-label={`Milestone ${milestoneIndex + 1} title`}
                      value={milestone.title}
                      onChange={(event) => updateMilestone(milestoneIndex, { title: event.target.value })}
                    />
                  </div>
                  <div className="plan-edit-field">
                    <span className="plan-field-label">Outcome</span>
                    <TextArea
                      variant="secondary"
                      aria-label={`Milestone ${milestoneIndex + 1} description`}
                      value={milestone.description}
                      onChange={(event) => updateMilestone(milestoneIndex, { description: event.target.value })}
                    />
                  </div>
                </div>
                <div className="reorder-actions">
                  <IconActionHint label="Move milestone up"><Button isIconOnly size="sm" variant="ghost" aria-label="Move milestone up" isDisabled={milestoneIndex === 0} onPress={() => moveMilestone(milestoneIndex, -1)}><ArrowUp size={15} /></Button></IconActionHint>
                  <IconActionHint label="Move milestone down"><Button isIconOnly size="sm" variant="ghost" aria-label="Move milestone down" isDisabled={milestoneIndex === plan.length - 1} onPress={() => moveMilestone(milestoneIndex, 1)}><ArrowDown size={15} /></Button></IconActionHint>
                  <IconActionHint label={containsCompletedWork ? 'Completed work keeps this milestone in the plan' : 'Delete milestone'}><Button isIconOnly size="sm" variant="danger-soft" aria-label="Delete milestone" isDisabled={plan.length === 1 || containsCompletedWork} onPress={() => setPlan((current) => current.filter((_, index) => index !== milestoneIndex))}><Trash2 size={15} /></Button></IconActionHint>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="plan-tasks">
                  {milestone.tasks.map((task, taskIndex) => (
                    <div key={task.clientId} className={`plan-task-row${task.completed ? ' completed-plan-task' : ''}`}>
                      <div className="plan-task-title plan-edit-field">
                        <span className="plan-field-label">Action {task.completed ? '· completed' : ''}</span>
                        <Input
                          variant="secondary"
                          aria-label={`Task ${taskIndex + 1} title`}
                          value={task.title}
                          onChange={(event) => updateTask(milestoneIndex, taskIndex, { title: event.target.value })}
                        />
                      </div>
                      <div className="plan-task-description plan-edit-field">
                        <span className="plan-field-label">Notes</span>
                        <Input
                          variant="secondary"
                          aria-label={`Task ${taskIndex + 1} notes`}
                          value={task.description}
                          onChange={(event) => updateTask(milestoneIndex, taskIndex, { description: event.target.value })}
                        />
                      </div>
                      <div className="task-plan-meta">
                        <KaizenSelect
                          label="Priority"
                          value={task.priority}
                          onChange={(priority) => updateTask(milestoneIndex, taskIndex, { priority: priority as Priority })}
                          options={['LOW', 'MEDIUM', 'HIGH'].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))}
                          variant="secondary"
                        />
                        <KaizenSelect
                          label="Difficulty"
                          value={task.difficulty}
                          onChange={(difficulty) => updateTask(milestoneIndex, taskIndex, { difficulty: difficulty as Difficulty })}
                          options={['TINY', 'EASY', 'MEDIUM', 'HARD', 'EPIC'].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))}
                          variant="secondary"
                          isDisabled={task.completed}
                        />
                        <div className="plan-edit-field">
                          <span className="plan-field-label">Deadline</span>
                          <Input
                            variant="secondary"
                            type="date"
                            aria-label="Task deadline"
                            value={task.deadline}
                            onChange={(event) => updateTask(milestoneIndex, taskIndex, { deadline: event.target.value })}
                          />
                        </div>
                        <div className="task-plan-duration plan-edit-field">
                          <span className="plan-field-label">Minutes</span>
                          <Input
                            variant="secondary"
                            type="number"
                            aria-label="Estimated minutes"
                            min={5}
                            max={480}
                            value={String(task.durationMinutes)}
                            onChange={(event) => updateTask(milestoneIndex, taskIndex, { durationMinutes: Number(event.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="task-reorder-actions">
                        <IconActionHint label="Move task up"><Button isIconOnly size="sm" variant="ghost" aria-label="Move task up" isDisabled={taskIndex === 0} onPress={() => moveTask(milestoneIndex, taskIndex, -1)}><ArrowUp size={14} /></Button></IconActionHint>
                        <IconActionHint label="Move task down"><Button isIconOnly size="sm" variant="ghost" aria-label="Move task down" isDisabled={taskIndex === milestone.tasks.length - 1} onPress={() => moveTask(milestoneIndex, taskIndex, 1)}><ArrowDown size={14} /></Button></IconActionHint>
                        <IconActionHint label={task.completed ? 'Completed actions cannot be deleted' : 'Delete task'}><Button isIconOnly size="sm" variant="danger-soft" aria-label="Delete task" isDisabled={task.completed} onPress={() => updateMilestone(milestoneIndex, { tasks: milestone.tasks.filter((_, index) => index !== taskIndex) })}><Trash2 size={14} /></Button></IconActionHint>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onPress={() => updateMilestone(milestoneIndex, { tasks: [...milestone.tasks, newTask()] })}
                  >
                    <Plus size={16} /> Add action
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </div>

      <div className="plan-footer">
        <div className="plan-footer-actions">
          <Button variant="secondary" onPress={addMilestone}><Plus size={16} /> Add milestone</Button>
          {!isEditing && <Button variant="ghost" onPress={() => void load()}><RefreshCw size={16} /> Regenerate</Button>}
        </div>
        <div>
          <span>{plan.length} milestones · {plan.reduce((sum, item) => sum + item.tasks.length, 0)} actions</span>
          <Button variant="primary" size="lg" isDisabled={invalidPlan} isPending={saving} onPress={() => void save()}>
            {!saving && (isEditing ? <Save size={18} /> : <ArrowRight size={18} />)} {isEditing ? 'Save plan' : 'Approve this plan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
