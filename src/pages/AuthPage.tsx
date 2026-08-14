import { Alert, Button, Card, Tabs } from '@heroui/react'
import { ArrowRight, BrainCircuit, CheckCircle2, Route, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { ErrorAlert } from '../components/Feedback'
import { FormField } from '../components/FormField'
import { useAuth } from '../state/auth'

type Mode = 'register' | 'login'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register({
          email,
          username,
          displayName,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        })
        navigate('/onboarding')
      } else {
        const user = await login({ email, password })
        navigate(user.onboardingCompleted ? '/' : '/onboarding')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to continue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story-inner">
          <Brand />
          <div className="auth-copy">
            <span className="eyebrow"><Sparkles size={14} /> Continuous improvement, made actionable</span>
            <h1>Turn ambition into momentum.</h1>
            <p>
              Kaizen builds a clear path from the goal in your head to the next action you can finish today.
            </p>
          </div>
          <div className="journey-line" aria-label="How Kaizen works">
            <div><BrainCircuit size={18} /><span>Define</span></div>
            <i />
            <div><Route size={18} /><span>Plan</span></div>
            <i />
            <div><CheckCircle2 size={18} /><span>Improve</span></div>
          </div>
          <blockquote>
            “Small actions become visible progress. Visible progress becomes confidence.”
          </blockquote>
        </div>
      </section>

      <section className="auth-form-wrap">
        <Card className="auth-card">
          <Card.Header>
            <Card.Title>{mode === 'register' ? 'Start your next chapter' : 'Welcome back'}</Card.Title>
            <Card.Description>
              {mode === 'register'
                ? 'Create your account, then build your first real goal.'
                : 'Pick up exactly where your momentum left off.'}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Tabs
              selectedKey={mode}
              onSelectionChange={(key) => setMode(key as Mode)}
              className="auth-tabs"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Authentication mode">
                  <Tabs.Tab id="register">Create account</Tabs.Tab>
                  <Tabs.Tab id="login">Log in</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>

            <form className="auth-form" onSubmit={submit}>
              {mode === 'register' && (
                <div className="two-fields">
                  <FormField
                    label="Your name"
                    name="displayName"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Maya Chen"
                    autoComplete="name"
                    required
                  />
                  <FormField
                    label="Username"
                    name="username"
                    value={username}
                    onChange={setUsername}
                    placeholder="mayabuilds"
                    autoComplete="username"
                    required
                  />
                </div>
              )}
              <FormField
                label="Email"
                name="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
              />
              <FormField
                label="Password"
                name="password"
                value={password}
                onChange={setPassword}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
              />
              {error && <ErrorAlert message={error} />}
              <Button type="submit" variant="primary" fullWidth isPending={submitting}>
                {mode === 'register' ? 'Build my first goal' : 'Continue to Kaizen'}
                {!submitting && <ArrowRight size={17} />}
              </Button>
            </form>
          </Card.Content>
          <Card.Footer>
            <Alert status="default" className="privacy-note">
              <Alert.Content>
                <Alert.Description>
                  Your password is securely hashed and your session stays in an HttpOnly cookie.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </Card.Footer>
        </Card>
      </section>
    </main>
  )
}
