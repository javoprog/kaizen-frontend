import { Button, Card } from '@heroui/react'
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, YAxis } from 'recharts'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  Gauge,
  Plus,
  Repeat2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { ProgressMeter } from '../components/ProgressMeter'
import { RewardModal } from '../components/RewardModal'
import { DifficultyPill, StatusPill, TimePill, XpPill } from '../components/StatusPill'
import { api } from '../lib/api'
import type { DashboardData, Habit, Reward, Task } from '../lib/types'
import { useAuth } from '../state/auth'

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completingHabit, setCompletingHabit] = useState('')
  const [error, setError] = useState('')
  const requested = useRef(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const load = useCallback(async () => {
    try {
      setData(await api<DashboardData>('/dashboard'))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load today')
    }
  }, [])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  async function completeFocus(task: Task) {
    setCompleting(true)
    try {
      const result = await api<Reward>(`/tasks/${task.id}/complete`, { method: 'POST' })
      setReward(result)
      await Promise.all([load(), refreshUser()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to complete action')
    } finally {
      setCompleting(false)
    }
  }

  async function completeHabit(habit: Habit) {
    setCompletingHabit(habit.id)
    try {
      const result = await api<Reward>(`/habits/${habit.id}/complete`, { method: 'POST' })
      setReward(result)
      await Promise.all([load(), refreshUser()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to complete habit')
    } finally {
      setCompletingHabit('')
    }
  }

  if (!data && !error) return <DashboardSkeleton />
  if (!data) return <div className="page"><ErrorAlert message={error} /></div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const scoreChange = data.scoreHistory.length > 1
    ? data.scoreHistory.at(-1)!.score - data.scoreHistory.at(-2)!.score
    : 0

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">{formatToday()}</span>
          <h1>{greeting}, {firstName(data.user.displayName || data.user.username)}.</h1>
          <p>{data.today.totalCompleted > 0 ? `You have completed ${data.today.totalCompleted} action${data.today.totalCompleted === 1 ? '' : 's'} today.` : 'One meaningful action is enough to create momentum.'}</p>
        </div>
        <Button variant="primary" onPress={() => navigate('/goals/new')}><Plus size={17} /> New goal</Button>
      </header>

      {error && <ErrorAlert message={error} />}

      <section className="dashboard-metrics" aria-label="Your progress summary">
        <Card className="metric-card level-card">
          <Card.Content>
            <div className="metric-icon gold"><Sparkles size={18} /></div>
            <div className="metric-copy"><span>Level {data.level.level}</span><strong>{data.user.xp.toLocaleString()} XP</strong></div>
            <span className="metric-delta">{data.level.xpRemaining} to next</span>
            <ProgressMeter value={data.level.percent} tone="gold" />
          </Card.Content>
        </Card>
        <Card className="metric-card">
          <Card.Content>
            <div className="metric-icon flame"><Flame size={18} /></div>
            <div className="metric-copy"><span>Kaizen streak</span><strong>{data.user.streak} day{data.user.streak === 1 ? '' : 's'}</strong></div>
            <span className="metric-delta">Meaningful days</span>
          </Card.Content>
        </Card>
        <Card className="metric-card score-card">
          <Card.Content>
            <div className="metric-icon violet"><Gauge size={18} /></div>
            <div className="metric-copy"><span>Kaizen Score</span><strong>{data.user.kaizenScore}</strong></div>
            <span className={`metric-delta ${scoreChange >= 0 ? 'positive' : 'negative'}`}>
              {scoreChange > 0 ? '+' : ''}{scoreChange} recent
            </span>
            {data.scoreHistory.length > 1 && (
              <div className="score-sparkline" aria-label="Kaizen Score trend">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.scoreHistory}>
                    <defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b6dff" stopOpacity={0.38} /><stop offset="100%" stopColor="#8b6dff" stopOpacity={0} /></linearGradient></defs>
                    <YAxis domain={[0, 100]} hide />
                    <ChartTooltip contentStyle={{ background: '#17151d', border: '1px solid #2b2735', borderRadius: 12 }} labelFormatter={(value) => String(value)} />
                    <Area type="monotone" dataKey="score" stroke="#9b87ff" strokeWidth={2} fill="url(#scoreFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Content>
        </Card>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-primary">
          <div className="section-heading">
            <div><span>Your focus</span><h2>The clearest next step</h2></div>
            <span className="focus-rationale"><TrendingUp size={14} /> Chosen from your active plan</span>
          </div>
          {data.focus ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="dashboard-focus-card">
                <Card.Content>
                  <div className="focus-goal"><Target size={15} /> {data.focus.goal?.title || 'Independent action'}</div>
                  <h3>{data.focus.title}</h3>
                  <div className="focus-meta">
                    <TimePill minutes={data.focus.durationMinutes} />
                    <DifficultyPill difficulty={data.focus.difficulty} />
                    <XpPill xp={data.focus.xpReward} />
                  </div>
                  <Button variant="primary" size="lg" isPending={completing} onPress={() => void completeFocus(data.focus!)}>
                    <CheckCircle2 size={18} /> Complete this action
                  </Button>
                </Card.Content>
                <div className="focus-card-glow" />
              </Card>
            </motion.div>
          ) : (
            <Card className="empty-focus-card">
              <Card.Content>
                <span className="empty-icon"><Target size={22} /></span>
                <h3>Give Kaizen a direction</h3>
                <p>Create a goal and approve its plan. Your most useful next action will appear here.</p>
                <Button variant="primary" onPress={() => navigate('/goals/new')}>Create a goal <ArrowRight size={17} /></Button>
              </Card.Content>
            </Card>
          )}

          <div className="section-heading habits-heading">
            <div><span>Today’s habits</span><h2>Keep your rhythm visible</h2></div>
            <Button variant="ghost" onPress={() => navigate('/habits')}>View habits <ArrowRight size={16} /></Button>
          </div>
          {data.todayHabits.length ? (
            <div className="dashboard-habits">
              {data.todayHabits.map((habit) => (
                <Card key={habit.id} className={`dashboard-habit-row ${habit.completedToday ? 'completed' : ''}`}>
                  <Card.Content>
                    <span className="dashboard-habit-icon">{habit.completedToday ? <CheckCircle2 size={18} /> : <Repeat2 size={18} />}</span>
                    <div><strong>{habit.title}</strong><span>{habit.goal?.title || (habit.scheduleType === 'DAILY' ? 'Every day' : 'Scheduled habit')}</span></div>
                    <div className="dashboard-habit-meta"><XpPill xp={habit.xpReward} />{habit.streak > 0 && <span className="meta-pill streak-pill"><Flame size={13} /> {habit.streak}</span>}</div>
                    <Button size="sm" variant={habit.completedToday ? 'ghost' : 'primary'} isDisabled={habit.completedToday} isPending={completingHabit === habit.id} onPress={() => void completeHabit(habit)}>{habit.completedToday ? 'Done' : 'Complete'}</Button>
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="dashboard-habits-empty"><Card.Content><Repeat2 size={18} /><span>No habits scheduled today.</span><Button variant="ghost" size="sm" onPress={() => navigate('/habits')}>Manage habits</Button></Card.Content></Card>
          )}

          <div className="section-heading goals-heading">
            <div><span>Active goals</span><h2>Where your effort is going</h2></div>
            <Button variant="ghost" onPress={() => navigate('/goals')}>View all <ArrowRight size={16} /></Button>
          </div>
          {data.activeGoals.length ? (
            <div className="dashboard-goals">
              {data.activeGoals.map((goal) => (
                <Card key={goal.id} className="dashboard-goal-card" onClick={() => navigate(`/goals/${goal.id}`)}>
                  <Card.Content>
                    <div className="goal-card-top"><span className="goal-mini-icon"><Target size={16} /></span><StatusPill label={`${goal.progress}%`} tone="violet" /></div>
                    <h3>{goal.title}</h3>
                    <ProgressMeter value={goal.progress} />
                    <div className="goal-card-footer"><span>{goal.category || 'Personal'}</span><strong>{goal.earnedXp} XP</strong></div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <p className="quiet-empty">No active goals yet.</p>
          )}
        </div>

        <aside className="dashboard-aside">
          <Card className="today-card">
            <Card.Header><Card.Title>Today</Card.Title><StatusPill label={`${data.today.xpEarned} XP`} tone="gold" /></Card.Header>
            <Card.Content>
              <div className="today-ring" style={{ '--today-progress': data.today.totalPlanned ? Math.round((data.today.totalCompleted / data.today.totalPlanned) * 100) : 0 } as React.CSSProperties}>
                <div><strong>{data.today.totalCompleted}/{data.today.totalPlanned}</strong><span>done</span></div>
              </div>
              <div className="today-breakdown">
                <div><span>Remaining tasks</span><strong>{data.today.pendingTasks}</strong></div>
                <div><span>Remaining habits</span><strong>{data.today.pendingHabits}</strong></div>
                <div><span>Weekly XP</span><strong>{data.weeklyXp}</strong></div>
              </div>
            </Card.Content>
          </Card>

          {data.recentAchievement && (
            <Card className="achievement-card">
              <Card.Header><span className="achievement-badge"><Award size={19} /></span><div><span>Latest achievement</span><Card.Title>{data.recentAchievement.achievement.name}</Card.Title></div></Card.Header>
              <Card.Content><p>{data.recentAchievement.achievement.description}</p></Card.Content>
            </Card>
          )}
        </aside>
      </section>

      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  )
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0]
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
}

function DashboardSkeleton() {
  return (
    <div className="page dashboard-skeleton">
      <div className="skeleton-line medium" />
      <div className="skeleton-line title" />
      <div className="skeleton-metrics"><div /><div /><div /></div>
      <div className="skeleton-card" />
    </div>
  )
}
