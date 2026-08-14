import { Button, Card, Disclosure } from '@heroui/react'
import type { DateValue } from '@internationalized/date'
import { ArrowLeft, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../components/Feedback'
import { FormField, FormTextarea } from '../components/FormField'
import { KaizenDatePicker, KaizenSelect } from '../components/GoalFields'
import { api } from '../lib/api'
import type { Goal } from '../lib/types'

export function GoalCreatePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [date, setDate] = useState<DateValue | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function create() {
    setSubmitting(true)
    setError('')
    try {
      const goal = await api<Goal>('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description || undefined,
          category: category || undefined,
          priority,
          targetDate: date ? `${date.toString()}T12:00:00.000Z` : undefined,
        }),
      })
      navigate(`/goals/${goal.id}/plan`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page narrow-page">
      <Button variant="ghost" onPress={() => navigate(-1)} className="back-button">
        <ArrowLeft size={17} /> Back
      </Button>
      <div className="page-heading create-heading">
        <span className="eyebrow"><Sparkles size={14} /> New direction</span>
        <h1>What will you improve next?</h1>
        <p>Start simple. Kaizen can shape the structure after you describe the outcome.</p>
      </div>
      <Card className="create-goal-card">
        <Card.Content>
          <FormField
            label="Goal"
            name="title"
            value={title}
            onChange={setTitle}
            placeholder="Become confident speaking Spanish in six months"
            required
          />
          <KaizenDatePicker value={date} onChange={setDate} />
          <Disclosure>
            <Disclosure.Heading>
              <Disclosure.Trigger>
                Advanced details <Disclosure.Indicator><ChevronDown size={16} /></Disclosure.Indicator>
              </Disclosure.Trigger>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="advanced-fields">
                <FormTextarea
                  label="Why this matters"
                  name="description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Add context Kaizen should consider..."
                />
                <div className="two-fields">
                  <KaizenSelect
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    options={[
                      { value: 'Learning', label: 'Learning' },
                      { value: 'Health', label: 'Health' },
                      { value: 'Career', label: 'Career' },
                      { value: 'Building', label: 'Building' },
                      { value: 'Finance', label: 'Finance' },
                      { value: 'Personal', label: 'Personal' },
                    ]}
                  />
                  <KaizenSelect
                    label="Priority"
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: 'LOW', label: 'Low' },
                      { value: 'MEDIUM', label: 'Medium' },
                      { value: 'HIGH', label: 'High' },
                    ]}
                  />
                </div>
              </Disclosure.Body>
            </Disclosure.Content>
          </Disclosure>
          {error && <ErrorAlert message={error} />}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isDisabled={!title.trim()}
            isPending={submitting}
            onPress={() => void create()}
          >
            {!submitting && <Sparkles size={18} />} Break down goal
          </Button>
        </Card.Content>
      </Card>
    </div>
  )
}
