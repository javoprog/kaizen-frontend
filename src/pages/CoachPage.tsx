import { Button, Card } from '@heroui/react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Compass,
  Flame,
  Gauge,
  LoaderCircle,
  MessageSquareText,
  Repeat2,
  Send,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react'
import { FormTextarea } from '../components/FormField'
import { ErrorAlert } from '../components/Feedback'
import { DifficultyPill, StatusPill, XpPill } from '../components/StatusPill'
import { api } from '../lib/api'
import type { CoachRecommendation, CoachResponse } from '../lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const quickActions = [
  { label: 'Plan my day', prompt: 'Plan my day around the most useful work and habits.', icon: Compass },
  { label: 'I have 30 minutes', prompt: 'I have 30 minutes. What should I do?', icon: Clock3 },
  { label: 'What needs attention?', prompt: 'What is falling behind or needs my attention?', icon: TriangleAlert },
  { label: 'Regain momentum', prompt: 'Help me regain momentum with a manageable next step.', icon: Flame },
]

export function CoachPage() {
  const [response, setResponse] = useState<CoachResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [lastQuestion, setLastQuestion] = useState('What should I focus on next?')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requested = useRef(false)

  const loadInitial = useCallback(async () => {
    try {
      setResponse(await api<CoachResponse>('/coach/recommendation'))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to open your coach')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void loadInitial()
  }, [loadInitial])

  async function ask(prompt: string) {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setLastQuestion(prompt.trim())
    try {
      setResponse(await api<CoachResponse>('/coach', {
        method: 'POST',
        body: JSON.stringify({ message: prompt.trim() }),
      }))
      setQuestion('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Your coach could not respond')
    } finally {
      setLoading(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void ask(question)
  }

  return (
    <div className="page coach-page">
      <header className="coach-header">
        <div className="coach-orb"><BrainCircuit size={29} /></div>
        <div>
          <span className="eyebrow">Context-aware guidance</span>
          <h1>Kaizen Coach</h1>
          <p>Your goals, schedule, habits, and recent momentum—turned into a clear next move.</p>
        </div>
      </header>

      {error && <ErrorAlert message={error} />}

      <div className="coach-layout">
        <main className="coach-main">
          <Card className="coach-command-card">
            <Card.Content>
              <div className="coach-command-heading"><MessageSquareText size={18} /><div><strong>What do you need right now?</strong><span>Ask for a decision, a small action, or a recovery plan.</span></div></div>
              <div className="coach-quick-actions">
                {quickActions.map((action) => <Button key={action.label} variant="ghost" onPress={() => void ask(action.prompt)} isDisabled={loading}><action.icon size={15} /> {action.label}</Button>)}
              </div>
              <form className="coach-form" onSubmit={submit}>
                <FormTextarea label="Ask your coach" name="coach-question" value={question} onChange={setQuestion} placeholder="Example: What can I finish before lunch?" />
                <Button type="submit" variant="primary" isPending={loading} isDisabled={!question.trim()}><Send size={16} /> Ask Coach</Button>
              </form>
            </Card.Content>
          </Card>

          <section className="coach-answer" aria-live="polite">
            <div className="section-heading">
              <div><span>Coach response</span><h2>{lastQuestion}</h2></div>
              {response && <StatusPill label={response.source === 'OPENAI' ? 'OpenAI' : 'Local coach'} tone={response.source === 'OPENAI' ? 'violet' : 'neutral'} />}
            </div>
            {loading ? (
              <Card className="coach-loading-card"><Card.Content><LoaderCircle className="spin" size={24} /><strong>Reading your current Kaizen context…</strong><span>Goals, habits, deadlines, and momentum</span></Card.Content></Card>
            ) : response ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="coach-response-card">
                  <Card.Content>
                    <span className="coach-response-icon"><Sparkles size={19} /></span>
                    <p>{response.message}</p>
                  </Card.Content>
                </Card>
                {response.recommendations.length > 0 && (
                  <div className="coach-recommendations">
                    {response.recommendations.map((recommendation, index) => <RecommendationCard key={`${recommendation.type}-${recommendation.id}`} recommendation={recommendation} index={index} />)}
                  </div>
                )}
                <p className="coach-source-note">{response.source === 'OPENAI' ? 'Generated with OpenAI from current, server-verified Kaizen data.' : 'Generated by Kaizen’s deterministic local coach. Add an OpenAI API key later to enable provider-generated guidance.'}</p>
              </motion.div>
            ) : null}
          </section>
        </main>

        {response && <aside className="coach-context-rail">
          <Card>
            <Card.Header><Card.Title>Live context</Card.Title><span className="live-dot" /></Card.Header>
            <Card.Content>
              <div className="context-stat"><Target size={16} /><span>Active goals</span><strong>{response.contextSummary.activeGoals}</strong></div>
              <div className="context-stat"><Repeat2 size={16} /><span>Habits due</span><strong>{response.contextSummary.dueHabits}</strong></div>
              <div className="context-stat"><TriangleAlert size={16} /><span>Overdue tasks</span><strong>{response.contextSummary.overdueTasks}</strong></div>
              <div className="context-stat"><Flame size={16} /><span>Current streak</span><strong>{response.contextSummary.streak}</strong></div>
              <div className="context-stat"><Gauge size={16} /><span>Kaizen Score</span><strong>{response.contextSummary.kaizenScore}</strong></div>
            </Card.Content>
          </Card>
          <p>Coach recommendations are built only from your authenticated Kaizen data. Provider output cannot create or select unseen actions.</p>
        </aside>}
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation, index }: { recommendation: CoachRecommendation; index: number }) {
  const navigate = useNavigate()
  const Icon = recommendation.type === 'HABIT' ? Repeat2 : recommendation.type === 'GOAL' ? Target : CheckCircle2
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
      <Card className="coach-recommendation-card" onClick={() => navigate(recommendation.href)}>
        <Card.Content>
          <span className={`recommendation-index type-${recommendation.type.toLowerCase()}`}><Icon size={17} /></span>
          <div className="recommendation-copy">
            <span>{recommendation.type}{recommendation.goalTitle ? ` · ${recommendation.goalTitle}` : ''}</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.reason}</p>
            <div className="recommendation-meta">
              {recommendation.difficulty && <DifficultyPill difficulty={recommendation.difficulty} />}
              {recommendation.xpReward !== undefined && <XpPill xp={recommendation.xpReward} />}
              {recommendation.durationMinutes && <span className="meta-pill"><Clock3 size={13} /> {recommendation.durationMinutes} min</span>}
              {recommendation.health && <StatusPill label={recommendation.health} tone={recommendation.health === 'Behind' ? 'danger' : recommendation.health === 'At Risk' ? 'warning' : 'success'} />}
            </div>
          </div>
          <Button variant="ghost" size="sm" onPress={() => navigate(recommendation.href)}>{recommendation.actionLabel} <ArrowRight size={15} /></Button>
        </Card.Content>
      </Card>
    </motion.div>
  )
}
