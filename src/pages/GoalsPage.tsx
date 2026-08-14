import { Button, Card } from '@heroui/react'
import { ArrowRight, CalendarDays, Plus, Target } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { ProgressMeter } from '../components/ProgressMeter'
import { StatusPill } from '../components/StatusPill'
import { api } from '../lib/api'
import type { Goal } from '../lib/types'

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requested = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    api<Goal[]>('/goals')
      .then(setGoals)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load goals'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page goals-page">
      <header className="dashboard-header">
        <div><span className="eyebrow">Your direction</span><h1>Goals</h1><p>Every milestone, action, and reward starts with something meaningful.</p></div>
        <Button variant="primary" onPress={() => navigate('/goals/new')}><Plus size={17} /> New goal</Button>
      </header>
      {error && <ErrorAlert message={error} />}
      {loading ? <div className="skeleton-card" /> : goals.length ? (
        <div className="goal-library">
          {goals.map((goal) => (
            <Card key={goal.id} className="goal-library-card" onClick={() => navigate(goal.planningStatus === 'DRAFT' ? `/goals/${goal.id}/plan` : `/goals/${goal.id}`)}>
              <Card.Content>
                <div className="goal-library-top">
                  <span className="goal-library-icon"><Target size={20} /></span>
                  <StatusPill label={goal.planningStatus === 'DRAFT' ? 'Draft plan' : goal.health.label} tone={goal.planningStatus === 'DRAFT' ? 'neutral' : goal.health.tone} />
                </div>
                <h2>{goal.title}</h2>
                <p>{goal.description || 'A clear direction ready to become consistent action.'}</p>
                <ProgressMeter value={goal.progress} />
                <div className="goal-library-footer">
                  <span><CalendarDays size={15} /> {goal.targetDate ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(goal.targetDate)) : 'No deadline'}</span>
                  <strong>{goal.progress}% <ArrowRight size={15} /></strong>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="goals-empty">
          <Card.Content><span className="empty-icon"><Target size={24} /></span><h2>Choose your next direction</h2><p>Describe what you want to achieve. Kaizen will help you shape the path.</p><Button variant="primary" onPress={() => navigate('/goals/new')}>Create your first goal <ArrowRight size={17} /></Button></Card.Content>
        </Card>
      )}
    </div>
  )
}
