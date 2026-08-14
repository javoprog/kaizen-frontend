import { Button, Card } from '@heroui/react'
import { ArrowLeft, Construction } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ComingSoonPage({ title }: { title: string }) {
  const navigate = useNavigate()
  return (
    <div className="page narrow-page coming-page">
      <Card>
        <Card.Content>
          <span className="empty-icon"><Construction size={23} /></span>
          <h1>{title}</h1>
          <p>This area is intentionally unavailable in the primary-flow prototype. No placeholder data is being shown.</p>
          <Button variant="secondary" onPress={() => navigate('/')}><ArrowLeft size={17} /> Return to Today</Button>
        </Card.Content>
      </Card>
    </div>
  )
}
