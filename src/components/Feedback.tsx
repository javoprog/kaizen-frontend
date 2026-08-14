import { Alert } from './ui'
import { CircleAlert } from 'lucide-react'

export function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert status="danger">
      <Alert.Indicator>
        <CircleAlert size={18} />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Title>Something needs attention</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  )
}
