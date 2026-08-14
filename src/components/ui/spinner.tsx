import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return <LoaderCircle className={cn('size-5 animate-spin text-primary', className)} {...props} />
}
