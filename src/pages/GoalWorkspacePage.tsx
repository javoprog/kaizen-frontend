import { Button, Card, Tabs } from '@heroui/react'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Compass,
  Flag,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { GoalMap } from '../components/GoalMap'
import { ProgressMeter } from '../components/ProgressMeter'
import { RewardModal } from '../components/RewardModal'
import { StatusPill, TimePill, XpPill } from '../components/StatusPill'
import { TaskAction } from '../components/TaskAction'
import { api } from '../lib/api'
import type { Goal, Reward, Task } from '../lib/types'
import { useAuth } from '../state/auth'

type WorkspaceTab = 'overview' | 'roadmap' | 'tasks' | 'insights'

export function GoalWorkspacePage() {
  const { id = '' } = useParams()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [tab, setTab] = useState<WorkspaceTab>('overview')
  const [reward, setReward] = useState<Reward | null>(null)
  const [completing, setCompleting] = useState('')
  const [coach, setCoach] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requested = useRef(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const load = useCallback(async () => {
    try {
      const data = await api<Goal>(`/goals/${id}`)
      setGoal(data)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this goal')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  useEffect(() => {
    if (tab !== 'insights' || coach) return
    api<{ message: string }>('/coach/recommendation')
      .then((response) => setCoach(response.message))
      .catch(() => setCoach('Coaching is temporarily unavailable. Your goal and task data remain fully usable.'))
  }, [coach, tab])

  async function completeTask(task: Task) {
    setCompleting(task.id)
    setError('')
    try {
      const result = await api<Reward>(`/tasks/${task.id}/complete`, { method: 'POST' })
      setReward(result)
      await Promise.all([load(), refreshUser()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to complete task')
    } finally {
      setCompleting('')
    }
  }

  if (loading) return <WorkspaceSkeleton />
  if (!goal) {
    return <div className="page"><ErrorAlert message={error || 'Goal not found'} /></div>
  }

  const currentMilestone = goal.milestones.find((item) => item.status === 'CURRENT')
  const remaining = goal.tasks.filter((task) => !task.completed).length

  return (
    <div className="page workspace-page">
      <div className="workspace-topbar">
        <Button variant="ghost" onPress={() => navigate('/goals')}><ArrowLeft size={17} /> All goals</Button>
        <div className="workspace-status">
          <StatusPill label={goal.health.label} tone={goal.health.tone} />
          <span>{goal.status.toLowerCase()}</span>
        </div>
      </div>

      <header className="goal-hero">
        <div className="goal-hero-main">
          <span className="eyebrow"><Target size={14} /> {goal.category || 'Personal goal'}</span>
          <h1>{goal.title}</h1>
          <div className="goal-hero-meta">
            {goal.targetDate ? (
              <span><CalendarDays size={15} /> {formatDistanceToNow(new Date(goal.targetDate), { addSuffix: true })}</span>
            ) : (
              <span><CalendarDays size={15} /> No deadline</span>
            )}
            <span><Flag size={15} /> {currentMilestone?.title || 'Plan complete'}</span>
            <XpPill xp={goal.earnedXp} />
          </div>
        </div>
        <div className="goal-progress-ring" style={{ '--progress': goal.progress } as React.CSSProperties}>
          <div><strong>{goal.progress}%</strong><span>complete</span></div>
        </div>
      </header>

      {error && <ErrorAlert message={error} />}

      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(key as WorkspaceTab)} className="workspace-tabs">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Goal workspace sections">
            <Tabs.Tab id="overview">Overview</Tabs.Tab>
            <Tabs.Tab id="roadmap">Roadmap</Tabs.Tab>
            <Tabs.Tab id="tasks">Tasks <span className="tab-count">{remaining}</span></Tabs.Tab>
            <Tabs.Tab id="insights">Insights</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="overview">
          <AnimatePresence mode="wait">
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="workspace-grid">
              <section className="workspace-primary">
                <Card className="next-action-card">
                  <Card.Header>
                    <div>
                      <span className="card-kicker"><Sparkles size={14} /> Recommended next action</span>
                      <Card.Title>{goal.recommendedTask?.title || 'You cleared this plan'}</Card.Title>
                      <Card.Description>
                        {goal.recommendedTask
                          ? `The most useful available step in ${currentMilestone?.title || 'your goal'}.`
                          : 'Every planned task is complete. Take a moment to reflect and celebrate.'}
                      </Card.Description>
                    </div>
                  </Card.Header>
                  {goal.recommendedTask && (
                    <Card.Content>
                      <div className="focus-meta">
                        <TimePill minutes={goal.recommendedTask.durationMinutes} />
                        <StatusPill label={goal.recommendedTask.difficulty.toLowerCase()} tone="violet" />
                        <XpPill xp={{ TINY: 5, EASY: 10, MEDIUM: 25, HARD: 50, EPIC: 100 }[goal.recommendedTask.difficulty]} />
                      </div>
                      <Button
                        variant="primary"
                        size="lg"
                        isPending={completing === goal.recommendedTask.id}
                        onPress={() => void completeTask(goal.recommendedTask!)}
                      >
                        <CheckCircle2 size={18} /> Complete action
                      </Button>
                    </Card.Content>
                  )}
                </Card>

                <div className="section-heading">
                  <div><span>Current phase</span><h2>{currentMilestone?.title || 'All milestones complete'}</h2></div>
                  <Button variant="ghost" onPress={() => setTab('roadmap')}>Open map</Button>
                </div>
                {currentMilestone && (
                  <Card className="milestone-card">
                    <Card.Header>
                      <div className="milestone-icon"><Flag size={18} /></div>
                      <div className="milestone-head-copy">
                        <Card.Title>{currentMilestone.title}</Card.Title>
                        <Card.Description>{currentMilestone.description}</Card.Description>
                      </div>
                      <strong>{currentMilestone.progress}%</strong>
                    </Card.Header>
                    <Card.Content>
                      <ProgressMeter value={currentMilestone.progress} />
                      <div className="compact-task-list">
                        {currentMilestone.tasks.slice(0, 4).map((task) => (
                          <TaskAction key={task.id} task={task} completing={completing === task.id} onComplete={completeTask} />
                        ))}
                      </div>
                    </Card.Content>
                  </Card>
                )}
              </section>

              <aside className="workspace-aside">
                <Card>
                  <Card.Header><Card.Title>Goal pulse</Card.Title></Card.Header>
                  <Card.Content className="pulse-list">
                    <div><span>Progress</span><strong>{goal.progress}%</strong></div>
                    <ProgressMeter value={goal.progress} tone="violet" />
                    <div><span>Actions left</span><strong>{remaining}</strong></div>
                    <div><span>Milestones</span><strong>{goal.milestones.filter((item) => item.status === 'COMPLETED').length}/{goal.milestones.length}</strong></div>
                    <div><span>XP earned here</span><strong className="gold-text">{goal.earnedXp}</strong></div>
                  </Card.Content>
                </Card>
                <Card className="health-card">
                  <Card.Header><Card.Title>Why {goal.health.label.toLowerCase()}?</Card.Title></Card.Header>
                  <Card.Content><p>{goal.health.explanation}</p></Card.Content>
                </Card>
              </aside>
            </motion.div>
          </AnimatePresence>
        </Tabs.Panel>

        <Tabs.Panel id="roadmap">
          <div className="tab-section-heading">
            <div><h2>Interactive goal map</h2><p>Zoom, pan, and select nodes to understand the path.</p></div>
            <StatusPill label={`${goal.milestones.length} milestones`} tone="neutral" />
          </div>
          <GoalMap goal={goal} />
        </Tabs.Panel>

        <Tabs.Panel id="tasks">
          <div className="tab-section-heading">
            <div><h2>Actions that move this goal</h2><p>Tasks stay grouped by the meaningful phase they support.</p></div>
          </div>
          <div className="all-task-groups">
            {goal.milestones.map((milestone) => (
              <Card key={milestone.id}>
                <Card.Header>
                  <div><Card.Title>{milestone.title}</Card.Title><Card.Description>{milestone.progress}% complete</Card.Description></div>
                  <StatusPill label={milestone.status.toLowerCase()} tone={milestone.status === 'COMPLETED' ? 'success' : milestone.status === 'CURRENT' ? 'violet' : 'neutral'} />
                </Card.Header>
                <Card.Content>
                  {milestone.tasks.map((task) => (
                    <TaskAction key={task.id} task={task} completing={completing === task.id} onComplete={completeTask} />
                  ))}
                </Card.Content>
              </Card>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="insights">
          <div className="insights-grid">
            <Card className="coach-card">
              <Card.Header>
                <span className="coach-icon"><BrainCircuit size={20} /></span>
                <div><Card.Title>Kaizen Coach</Card.Title><Card.Description>Grounded in your real task and goal data</Card.Description></div>
              </Card.Header>
              <Card.Content>
                <p>{coach || 'Reading your current plan…'}</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header><span className="coach-icon neutral"><Lightbulb size={19} /></span><Card.Title>Pace insight</Card.Title></Card.Header>
              <Card.Content><p>{goal.health.explanation}</p></Card.Content>
            </Card>
            <Card>
              <Card.Header><span className="coach-icon neutral"><Compass size={19} /></span><Card.Title>Plan shape</Card.Title></Card.Header>
              <Card.Content><p>{goal.milestones.length} milestones organize {goal.tasks.length} concrete actions. {remaining} remain.</p></Card.Content>
            </Card>
          </div>
        </Tabs.Panel>
      </Tabs>

      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  )
}

function WorkspaceSkeleton() {
  return (
    <div className="page workspace-skeleton">
      <div className="skeleton-line short" />
      <div className="skeleton-line title" />
      <div className="skeleton-line medium" />
      <div className="skeleton-card" />
    </div>
  )
}
