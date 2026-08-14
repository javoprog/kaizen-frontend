import { Alert, Button, Card, Input, Spinner, TextArea } from '@heroui/react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  GripVertical,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { KaizenSelect } from '../components/GoalFields'
import { api } from '../lib/api'
import type { Difficulty, Goal, PlanSuggestion, SuggestedMilestone } from '../lib/types'

interface EditableTask {
  clientId: string
  title: string
  difficulty: Difficulty
  durationMinutes: number
}

interface EditableMilestone extends Omit<SuggestedMilestone, 'tasks'> {
  clientId: string
  tasks: EditableTask[]
}

function editable(milestones: SuggestedMilestone[]): EditableMilestone[] {
  return milestones.map((milestone) => ({
    ...milestone,
    clientId: crypto.randomUUID(),
    tasks: milestone.tasks.map((task) => ({ ...task, clientId: crypto.randomUUID() })),
  }))
}

export function PlanReviewPage() {
  const { id = '' } = useParams()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [plan, setPlan] = useState<EditableMilestone[]>([])
  const [notice, setNotice] = useState('')
  const [source, setSource] = useState<PlanSuggestion['source']>('LOCAL_PLANNER')
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState('')
  const requested = useRef(false)
  const navigate = useNavigate()

  const generate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [goalData, suggestion] = await Promise.all([
        api<Goal>(`/goals/${id}`),
        api<PlanSuggestion>(`/goals/${id}/breakdown`, { method: 'POST' }),
      ])
      setGoal(goalData)
      setPlan(editable(suggestion.milestones))
      setNotice(suggestion.notice)
      setSource(suggestion.source)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to build a plan')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void generate()
  }, [generate])

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

  async function approve() {
    setApproving(true)
    setError('')
    try {
      await api(`/goals/${id}/approve-plan`, {
        method: 'POST',
        body: JSON.stringify({
          milestones: plan.map(({ title, description, tasks }) => ({
            title,
            description,
            tasks: tasks.map(({ title: taskTitle, difficulty, durationMinutes }) => ({
              title: taskTitle,
              difficulty,
              durationMinutes,
            })),
          })),
        }),
      })
      navigate(`/goals/${id}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to approve plan')
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="plan-loading">
        <span className="ai-orbit"><Sparkles size={24} /></span>
        <Spinner aria-label="Building your plan" />
        <h2>Shaping a practical path</h2>
        <p>Kaizen is turning your ambition into milestones and actions.</p>
      </div>
    )
  }

  return (
    <div className="page plan-page">
      <div className="plan-topbar">
        <Button variant="ghost" onPress={() => navigate(-1)}><ArrowLeft size={17} /> Back</Button>
        <span className="plan-status"><span /> Draft · nothing changes until you approve</span>
      </div>
      <div className="page-heading plan-heading">
        <span className="eyebrow"><Sparkles size={14} /> Proposed path</span>
        <h1>{goal?.title}</h1>
        <p>Edit, remove, or reorder anything. This is your plan.</p>
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
        {plan.map((milestone, milestoneIndex) => (
          <Card key={milestone.clientId} className="plan-milestone">
            <Card.Header>
              <div className="milestone-number">{String(milestoneIndex + 1).padStart(2, '0')}</div>
              <div className="plan-milestone-fields">
                <Input
                  aria-label={`Milestone ${milestoneIndex + 1} title`}
                  value={milestone.title}
                  onChange={(event) => updateMilestone(milestoneIndex, { title: event.target.value })}
                />
                <TextArea
                  aria-label={`Milestone ${milestoneIndex + 1} description`}
                  value={milestone.description}
                  onChange={(event) => updateMilestone(milestoneIndex, { description: event.target.value })}
                />
              </div>
              <div className="reorder-actions">
                <Button isIconOnly variant="ghost" aria-label="Move milestone up" isDisabled={milestoneIndex === 0} onPress={() => moveMilestone(milestoneIndex, -1)}><ArrowUp size={15} /></Button>
                <Button isIconOnly variant="ghost" aria-label="Move milestone down" isDisabled={milestoneIndex === plan.length - 1} onPress={() => moveMilestone(milestoneIndex, 1)}><ArrowDown size={15} /></Button>
                <Button isIconOnly variant="danger-soft" aria-label="Delete milestone" isDisabled={plan.length === 1} onPress={() => setPlan((current) => current.filter((_, index) => index !== milestoneIndex))}><Trash2 size={15} /></Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="plan-tasks">
                {milestone.tasks.map((task, taskIndex) => (
                  <div key={task.clientId} className="plan-task-row">
                    <GripVertical size={16} className="drag-hint" />
                    <Input
                      aria-label={`Task ${taskIndex + 1} title`}
                      value={task.title}
                      onChange={(event) => updateTask(milestoneIndex, taskIndex, { title: event.target.value })}
                    />
                    <div className="task-plan-meta">
                      <KaizenSelect
                        label="Difficulty"
                        value={task.difficulty}
                        onChange={(difficulty) => updateTask(milestoneIndex, taskIndex, { difficulty: difficulty as Difficulty })}
                        options={['TINY', 'EASY', 'MEDIUM', 'HARD', 'EPIC'].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))}
                      />
                      <Input
                        type="number"
                        aria-label="Estimated minutes"
                        min={5}
                        max={480}
                        value={String(task.durationMinutes)}
                        onChange={(event) => updateTask(milestoneIndex, taskIndex, { durationMinutes: Number(event.target.value) })}
                      />
                    </div>
                    <div className="task-reorder-actions">
                      <Button isIconOnly variant="ghost" aria-label="Move task up" isDisabled={taskIndex === 0} onPress={() => moveTask(milestoneIndex, taskIndex, -1)}><ArrowUp size={14} /></Button>
                      <Button isIconOnly variant="ghost" aria-label="Move task down" isDisabled={taskIndex === milestone.tasks.length - 1} onPress={() => moveTask(milestoneIndex, taskIndex, 1)}><ArrowDown size={14} /></Button>
                      <Button isIconOnly variant="ghost" aria-label="Delete task" isDisabled={milestone.tasks.length === 1} onPress={() => updateMilestone(milestoneIndex, { tasks: milestone.tasks.filter((_, index) => index !== taskIndex) })}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  onPress={() => updateMilestone(milestoneIndex, {
                    tasks: [...milestone.tasks, { clientId: crypto.randomUUID(), title: 'New action', difficulty: 'EASY', durationMinutes: 20 }],
                  })}
                >
                  <Plus size={16} /> Add action
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="plan-footer">
        <Button variant="secondary" onPress={() => void generate()}><RefreshCw size={16} /> Regenerate</Button>
        <div>
          <span>{plan.length} milestones · {plan.reduce((sum, item) => sum + item.tasks.length, 0)} actions</span>
          <Button variant="primary" size="lg" isPending={approving} onPress={() => void approve()}>
            Approve this plan {!approving && <ArrowRight size={18} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
