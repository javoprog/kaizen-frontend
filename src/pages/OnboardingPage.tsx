import { Button, Card, Progress } from '../components/ui'
import type { DateValue } from '@internationalized/date'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Dumbbell,
  Lightbulb,
  Palette,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { ErrorAlert } from '../components/Feedback'
import { FormField } from '../components/FormField'
import { KaizenDatePicker } from '../components/GoalFields'
import { api } from '../lib/api'
import type { Goal } from '../lib/types'
import { useAuth } from '../state/auth'

const categories = [
  { label: 'Learn a skill', icon: Lightbulb },
  { label: 'Improve health', icon: Dumbbell },
  { label: 'Career growth', icon: BriefcaseBusiness },
  { label: 'Build something', icon: Code2 },
  { label: 'Financial goal', icon: TrendingUp },
  { label: 'Creative goal', icon: Palette },
]

const struggleOptions = [
  'Knowing what to do next',
  'Staying consistent',
  'Breaking down big goals',
  'Finding motivation',
  'Tracking real progress',
  'Planning my time',
]

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [intent, setIntent] = useState('')
  const [category, setCategory] = useState('')
  const [struggles, setStruggles] = useState<string[]>([])
  const [date, setDate] = useState<DateValue | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  function toggleStruggle(item: string) {
    setStruggles((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    )
  }

  async function createGoal() {
    setSubmitting(true)
    setError('')
    try {
      const goal = await api<Goal>('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: intent,
          category: category || undefined,
          targetDate: date?.toString(),
        }),
      })
      await api('/users/me/onboarding', {
        method: 'PATCH',
        body: JSON.stringify({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          struggles,
        }),
      })
      navigate(`/goals/${goal.id}/plan`)
      void refreshUser()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your goal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Brand />
        <span>Step {step} of 3</span>
      </header>
      <Progress value={(step / 3) * 100} aria-label={`Onboarding step ${step} of 3`} className="onboarding-progress" />

      <div className="onboarding-stage">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="step-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="onboarding-panel"
            >
              <span className="step-kicker"><Sparkles size={15} /> Start with ambition</span>
              <h1>What do you want to achieve?</h1>
              <p>Write it naturally. Kaizen will help turn it into a plan you can act on.</p>
              <FormField
                label="Your goal"
                name="goal"
                value={intent}
                onChange={setIntent}
                placeholder="Launch my SaaS and reach my first 100 customers"
                description="Specific is helpful, but it does not need to be perfectly worded."
                required
              />
              <div className="suggestion-grid" aria-label="Suggested goal categories">
                {categories.map((item) => (
                  <Button
                    key={item.label}
                    variant={category === item.label ? 'primary' : 'secondary'}
                    size="lg"
                    className="justify-start"
                    onClick={() => setCategory(item.label)}
                  >
                    <item.icon size={17} /> {item.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={!intent.trim()}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight size={18} />
              </Button>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="onboarding-panel"
            >
              <span className="step-kicker">Make the plan fit you</span>
              <h1>What usually gets in your way?</h1>
              <p>Choose any that apply. This will shape future coaching and recommendations.</p>
              <div className="struggle-grid">
                {struggleOptions.map((item) => (
                  <Button
                    key={item}
                    variant={struggles.includes(item) ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => toggleStruggle(item)}
                    className="struggle-option justify-start"
                  >
                    <span className="selection-dot" /> {item}
                  </Button>
                ))}
              </div>
              <div className="step-actions">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={17} /> Back</Button>
                <Button variant="primary" size="lg" onClick={() => setStep(3)}>
                  Shape my goal <ArrowRight size={18} />
                </Button>
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section
              key="step-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="onboarding-panel final-step"
            >
              <span className="step-kicker"><Sparkles size={15} /> Create your first real goal</span>
              <h1>Give your ambition a horizon.</h1>
              <p>You stay in control. Kaizen will propose the milestones and tasks next.</p>
              <Card className="goal-preview-card">
                <Card.Content>
                  <FormField
                    label="Goal"
                    name="goal"
                    value={intent}
                    onChange={setIntent}
                    required
                  />
                  <KaizenDatePicker value={date} onChange={setDate} />
                </Card.Content>
              </Card>
              {error && <ErrorAlert message={error} />}
              <div className="step-actions">
                <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft size={17} /> Back</Button>
                <Button variant="primary" size="lg" loading={submitting} onClick={() => void createGoal()}>
                  {!submitting && <Sparkles size={18} />} Break down my goal
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
