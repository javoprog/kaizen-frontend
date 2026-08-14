import { Brand } from './Brand'
import { Spinner } from './ui'

export function LoadingScreen({ label = 'Loading your progress' }: { label?: string }) {
  return (
    <div className="loading-screen">
      <Brand />
      <Spinner aria-label={label} />
      <p>{label}</p>
    </div>
  )
}
