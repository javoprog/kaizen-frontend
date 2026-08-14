import { Button, Card, Modal } from '@heroui/react'
import { motion } from 'motion/react'
import {
  Archive,
  CalendarDays,
  Check,
  Flame,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat2,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { FormField, FormTextarea } from '../components/FormField'
import { KaizenSelect } from '../components/GoalFields'
import { RewardModal } from '../components/RewardModal'
import { DifficultyPill, StatusPill, XpPill } from '../components/StatusPill'
import { api } from '../lib/api'
import type { Difficulty, Goal, Habit, Reward } from '../lib/types'
import { useAuth } from '../state/auth'

const weekdays = [
  { value: 1, short: 'M', label: 'Monday' },
  { value: 2, short: 'T', label: 'Tuesday' },
  { value: 3, short: 'W', label: 'Wednesday' },
  { value: 4, short: 'T', label: 'Thursday' },
  { value: 5, short: 'F', label: 'Friday' },
  { value: 6, short: 'S', label: 'Saturday' },
  { value: 7, short: 'S', label: 'Sunday' },
]

interface HabitDraft {
  title: string
  description: string
  goalId: string
  difficulty: Difficulty
  scheduleType: 'DAILY' | 'SELECTED_DAYS'
  daysOfWeek: number[]
}

const emptyDraft: HabitDraft = {
  title: '',
  description: '',
  goalId: 'none',
  difficulty: 'EASY',
  scheduleType: 'DAILY',
  daysOfWeek: [1, 2, 3, 4, 5],
}

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [editing, setEditing] = useState<Habit | 'new' | null>(null)
  const [draft, setDraft] = useState<HabitDraft>(emptyDraft)
  const [deleting, setDeleting] = useState<Habit | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [busyId, setBusyId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requested = useRef(false)
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()

  const load = useCallback(async () => {
    try {
      const [habitData, goalData] = await Promise.all([
        api<Habit[]>('/habits'),
        api<Goal[]>('/goals'),
      ])
      setHabits(habitData)
      setGoals(goalData)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load habits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void load()
  }, [load])

  const dueToday = habits.filter((habit) => habit.dueToday || habit.completedToday)
  const active = habits.filter((habit) => habit.status === 'ACTIVE')
  const paused = habits.filter((habit) => habit.status === 'PAUSED')
  const completedToday = dueToday.filter((habit) => habit.completedToday).length
  const bestStreak = Math.max(0, ...habits.map((habit) => habit.streak))
  const calendarDays = useMemo(() => buildCalendarDays(habits[0]?.today), [habits])

  function openEditor(habit?: Habit) {
    if (habit) {
      setDraft({
        title: habit.title,
        description: habit.description || '',
        goalId: habit.goal?.id || 'none',
        difficulty: habit.difficulty,
        scheduleType: habit.scheduleType,
        daysOfWeek: habit.daysOfWeek,
      })
      setEditing(habit)
    } else {
      setDraft(emptyDraft)
      setEditing('new')
    }
    setError('')
  }

  async function saveHabit() {
    if (!draft.title.trim()) {
      setError('Give this habit a clear title.')
      return
    }
    if (draft.scheduleType === 'SELECTED_DAYS' && draft.daysOfWeek.length === 0) {
      setError('Choose at least one day for this habit.')
      return
    }
    setSaving(true)
    try {
      const body = JSON.stringify({
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        goalId: draft.goalId === 'none' ? null : draft.goalId,
        difficulty: draft.difficulty,
        scheduleType: draft.scheduleType,
        ...(draft.scheduleType === 'SELECTED_DAYS' ? { daysOfWeek: draft.daysOfWeek } : {}),
      })
      if (editing === 'new') {
        await api<Habit>('/habits', { method: 'POST', body })
      } else if (editing) {
        await api<Habit>(`/habits/${editing.id}`, { method: 'PATCH', body })
      }
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save habit')
    } finally {
      setSaving(false)
    }
  }

  async function complete(habit: Habit) {
    setBusyId(habit.id)
    try {
      const result = await api<Reward>(`/habits/${habit.id}/complete`, { method: 'POST' })
      setReward(result)
      await Promise.all([load(), refreshUser()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to complete habit')
    } finally {
      setBusyId('')
    }
  }

  async function setStatus(habit: Habit, status: 'ACTIVE' | 'PAUSED') {
    setBusyId(habit.id)
    try {
      await api<Habit>(`/habits/${habit.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update habit')
    } finally {
      setBusyId('')
    }
  }

  async function removeHabit() {
    if (!deleting) return
    setBusyId(deleting.id)
    try {
      await api(`/habits/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null)
      await load()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to remove habit')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="page habits-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Consistency compounds</span>
          <h1>Habits</h1>
          <p>Build repeatable actions that move with your real calendar.</p>
        </div>
        <Button variant="primary" onPress={() => openEditor()}><Plus size={17} /> New habit</Button>
      </header>

      {error && <ErrorAlert message={error} />}

      {loading ? <div className="skeleton-card" /> : habits.length === 0 ? (
        <Card className="goals-empty habit-empty">
          <Card.Content>
            <span className="empty-icon"><Repeat2 size={24} /></span>
            <h2>Create your first rhythm</h2>
            <p>Start with an action small enough to repeat. Kaizen will track its streak and reward each completed day.</p>
            <Button variant="primary" onPress={() => openEditor()}>Create a habit <Plus size={17} /></Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <section className="habit-summary-grid" aria-label="Habit progress summary">
            <Card className="habit-summary-card habit-today-summary">
              <Card.Content>
                <span className="habit-summary-icon"><CalendarDays size={19} /></span>
                <div><span>Today</span><strong>{completedToday} / {dueToday.length}</strong><small>scheduled habits complete</small></div>
              </Card.Content>
            </Card>
            <Card className="habit-summary-card">
              <Card.Content>
                <span className="habit-summary-icon flame"><Flame size={19} /></span>
                <div><span>Best active rhythm</span><strong>{bestStreak} day{bestStreak === 1 ? '' : 's'}</strong><small>scheduled completions</small></div>
              </Card.Content>
            </Card>
            <Card className="habit-summary-card">
              <Card.Content>
                <span className="habit-summary-icon gold"><Sparkles size={19} /></span>
                <div><span>Total repetitions</span><strong>{habits.reduce((sum, habit) => sum + habit.totalCompletions, 0)}</strong><small>all recorded completions</small></div>
              </Card.Content>
            </Card>
          </section>

          <section className="habit-section">
            <div className="section-heading">
              <div><span>Today’s rhythm</span><h2>{dueToday.length ? 'Keep the chain moving' : 'Nothing scheduled today'}</h2></div>
              <StatusPill label={`${completedToday}/${dueToday.length} complete`} tone={completedToday === dueToday.length && dueToday.length ? 'success' : 'violet'} />
            </div>
            {dueToday.length ? (
              <div className="habit-today-list">
                {dueToday.map((habit) => (
                  <motion.div key={habit.id} layout initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`habit-today-card ${habit.completedToday ? 'completed' : ''} ${searchParams.get('habit') === habit.id ? 'spotlight' : ''}`}>
                      <Card.Content>
                        <button
                          className="habit-check"
                          aria-label={habit.completedToday ? `${habit.title} completed` : `Complete ${habit.title}`}
                          disabled={habit.completedToday || busyId === habit.id}
                          onClick={() => void complete(habit)}
                        >
                          {habit.completedToday ? <Check size={18} /> : <span />}
                        </button>
                        <div className="habit-today-copy">
                          <div><strong>{habit.title}</strong>{habit.goal && <span><Target size={12} /> {habit.goal.title}</span>}</div>
                          <div className="habit-meta"><DifficultyPill difficulty={habit.difficulty} /><XpPill xp={habit.xpReward} />{habit.streak > 0 && <span className="meta-pill streak-pill"><Flame size={13} /> {habit.streak}</span>}</div>
                        </div>
                        {!habit.completedToday && <Button variant="primary" size="sm" isPending={busyId === habit.id} onPress={() => void complete(habit)}>Complete</Button>}
                      </Card.Content>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : <p className="quiet-empty">Your scheduled habits will appear here on their local days.</p>}
          </section>

          <section className="habit-section">
            <div className="section-heading"><div><span>Habit library</span><h2>Your active rhythms</h2></div></div>
            <div className="habit-library">
              {active.map((habit) => (
                <HabitCard key={habit.id} habit={habit} calendarDays={calendarDays} busy={busyId === habit.id} onEdit={() => openEditor(habit)} onPause={() => void setStatus(habit, 'PAUSED')} onDelete={() => setDeleting(habit)} />
              ))}
            </div>
          </section>

          {paused.length > 0 && (
            <section className="habit-section paused-section">
              <div className="section-heading"><div><span>Paused</span><h2>Rhythms on hold</h2></div></div>
              <div className="habit-library">
                {paused.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} calendarDays={calendarDays} busy={busyId === habit.id} onEdit={() => openEditor(habit)} onPause={() => void setStatus(habit, 'ACTIVE')} onDelete={() => setDeleting(habit)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <HabitEditor
        editing={editing}
        draft={draft}
        goals={goals}
        saving={saving}
        onDraft={setDraft}
        onClose={() => setEditing(null)}
        onSave={() => void saveHabit()}
      />
      <DeleteHabitModal habit={deleting} busy={Boolean(deleting && busyId === deleting.id)} onClose={() => setDeleting(null)} onDelete={() => void removeHabit()} />
      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  )
}

function HabitCard({ habit, calendarDays, busy, onEdit, onPause, onDelete }: {
  habit: Habit
  calendarDays: string[]
  busy: boolean
  onEdit: () => void
  onPause: () => void
  onDelete: () => void
}) {
  const completed = new Set(habit.completions.map((item) => item.localDate))
  return (
    <Card className={`habit-library-card ${habit.status === 'PAUSED' ? 'paused' : ''}`}>
      <Card.Content>
        <div className="habit-card-top">
          <span className="habit-library-icon"><Repeat2 size={18} /></span>
          <div className="habit-card-actions">
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Edit ${habit.title}`} onPress={onEdit}><Pencil size={15} /></Button>
            <Button isIconOnly size="sm" variant="ghost" aria-label={habit.status === 'ACTIVE' ? `Pause ${habit.title}` : `Resume ${habit.title}`} isPending={busy} onPress={onPause}>{habit.status === 'ACTIVE' ? <Pause size={15} /> : <Play size={15} />}</Button>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Remove ${habit.title}`} onPress={onDelete}><Trash2 size={15} /></Button>
          </div>
        </div>
        <h3>{habit.title}</h3>
        <p>{habit.description || scheduleLabel(habit)}</p>
        <div className="habit-meta"><StatusPill label={habit.status.toLowerCase()} tone={habit.status === 'ACTIVE' ? 'success' : 'neutral'} /><DifficultyPill difficulty={habit.difficulty} /><XpPill xp={habit.xpReward} /></div>
        <div className="contribution-wrap">
          <div className="contribution-heading"><span>Recent consistency</span><strong><Flame size={13} /> {habit.streak} day{habit.streak === 1 ? '' : 's'}</strong></div>
          <div className="contribution-grid" role="img" aria-label={`${habit.totalCompletions} completions for ${habit.title}`}>
            {calendarDays.map((day) => <i key={day} aria-hidden="true" className={completed.has(day) ? 'complete' : ''} title={`${day}: ${completed.has(day) ? 'completed' : 'not completed'}`} />)}
          </div>
        </div>
        <div className="habit-card-footer"><span>{scheduleLabel(habit)}</span>{habit.goal && <strong><Target size={12} /> {habit.goal.title}</strong>}</div>
      </Card.Content>
    </Card>
  )
}

function HabitEditor({ editing, draft, goals, saving, onDraft, onClose, onSave }: {
  editing: Habit | 'new' | null
  draft: HabitDraft
  goals: Goal[]
  saving: boolean
  onDraft: (draft: HabitDraft) => void
  onClose: () => void
  onSave: () => void
}) {
  if (!editing) return null
  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container placement="center" size="lg">
        <Modal.Dialog className="habit-editor-dialog">
          <Modal.CloseTrigger />
          <Modal.Header><div><span className="eyebrow">Repeatable action</span><Modal.Heading>{editing === 'new' ? 'Create a habit' : 'Edit habit'}</Modal.Heading></div></Modal.Header>
          <Modal.Body>
            <FormField label="Habit title" name="habit-title" value={draft.title} onChange={(title) => onDraft({ ...draft, title })} placeholder="Read for 20 minutes" required />
            <FormTextarea label="Description" name="habit-description" value={draft.description} onChange={(description) => onDraft({ ...draft, description })} placeholder="Why this rhythm matters and what counts." />
            <div className="habit-form-row">
              <KaizenSelect label="Difficulty" value={draft.difficulty} onChange={(difficulty) => onDraft({ ...draft, difficulty: difficulty as Difficulty })} options={[
                { value: 'TINY', label: 'Tiny · 5 XP' },
                { value: 'EASY', label: 'Easy · 10 XP' },
                { value: 'MEDIUM', label: 'Medium · 25 XP' },
                { value: 'HARD', label: 'Hard · 50 XP' },
                { value: 'EPIC', label: 'Epic · 100 XP' },
              ]} />
              <KaizenSelect label="Associated goal" value={draft.goalId} onChange={(goalId) => onDraft({ ...draft, goalId })} options={[{ value: 'none', label: 'Standalone habit' }, ...goals.map((goal) => ({ value: goal.id, label: goal.title }))]} />
            </div>
            <KaizenSelect label="Schedule" value={draft.scheduleType} onChange={(scheduleType) => onDraft({ ...draft, scheduleType: scheduleType as HabitDraft['scheduleType'] })} options={[{ value: 'DAILY', label: 'Every day' }, { value: 'SELECTED_DAYS', label: 'Selected weekdays' }]} description="Completions follow your Kaizen profile timezone." />
            {draft.scheduleType === 'SELECTED_DAYS' && (
              <div className="weekday-field">
                <span>Repeat on</span>
                <div className="weekday-picker">
                  {weekdays.map((day) => {
                    const selected = draft.daysOfWeek.includes(day.value)
                    return <button key={day.value} type="button" aria-pressed={selected} aria-label={day.label} className={selected ? 'selected' : ''} onClick={() => onDraft({ ...draft, daysOfWeek: selected ? draft.daysOfWeek.filter((value) => value !== day.value) : [...draft.daysOfWeek, day.value].sort() })}>{day.short}</button>
                  })}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer><Button variant="ghost" onPress={onClose}>Cancel</Button><Button variant="primary" isPending={saving} onPress={onSave}>{editing === 'new' ? 'Create habit' : 'Save changes'}</Button></Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function DeleteHabitModal({ habit, busy, onClose, onDelete }: { habit: Habit | null; busy: boolean; onClose: () => void; onDelete: () => void }) {
  if (!habit) return null
  const hasHistory = habit.totalCompletions > 0
  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container placement="center" size="sm">
        <Modal.Dialog className="habit-delete-dialog">
          <Modal.CloseTrigger />
          <Modal.Header><span className="delete-icon">{hasHistory ? <Archive size={20} /> : <Trash2 size={20} />}</span><Modal.Heading>{hasHistory ? 'Archive this habit?' : 'Delete this habit?'}</Modal.Heading></Modal.Header>
          <Modal.Body><p>{hasHistory ? 'Its completion history and earned XP will remain intact, but the habit will leave your active library.' : 'This habit has no completion history and will be permanently removed.'}</p></Modal.Body>
          <Modal.Footer><Button variant="ghost" onPress={onClose}>Keep habit</Button><Button variant="primary" isPending={busy} onPress={onDelete}>{hasHistory ? 'Archive habit' : 'Delete habit'}</Button></Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function scheduleLabel(habit: Pick<Habit, 'scheduleType' | 'daysOfWeek'>) {
  if (habit.scheduleType === 'DAILY') return 'Every day'
  if (habit.daysOfWeek.length === 5 && habit.daysOfWeek.every((day) => day <= 5)) return 'Weekdays'
  return habit.daysOfWeek.map((day) => weekdays.find((item) => item.value === day)?.label.slice(0, 3)).join(', ')
}

function buildCalendarDays(today = new Date().toISOString().slice(0, 10)) {
  const [year, month, day] = today.split('-').map(Number)
  const end = Date.UTC(year, month - 1, day)
  return Array.from({ length: 84 }, (_, index) => new Date(end - (83 - index) * 86_400_000).toISOString().slice(0, 10))
}
