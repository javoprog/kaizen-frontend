import { Sparkles } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Kaizen">
      <span className="brand-mark">
        <Sparkles size={17} strokeWidth={2.2} />
      </span>
      {!compact && <span className="brand-name">kaizen</span>}
    </div>
  )
}
