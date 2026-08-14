import { Spinner } from '@heroui/react'
import { Brand } from './Brand'

export function LoadingScreen({ label = 'Loading your progress' }: { label?: string }) {
  return (
    <div className="loading-screen">
      <Brand />
      <Spinner aria-label={label} />
      <p>{label}</p>
    </div>
  )
}
