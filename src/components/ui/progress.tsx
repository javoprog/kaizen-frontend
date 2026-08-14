import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../../lib/cn'

export function Progress({ value = 0, className, indicatorClassName, ...props }: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  const bounded = Math.max(0, Math.min(100, Number(value)))
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn('progress relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)} value={bounded} {...props}>
      <ProgressPrimitive.Indicator data-slot="indicator" className={cn('h-full w-full bg-primary transition-transform duration-500 ease-out', indicatorClassName)} style={{ transform: `translateX(-${100 - bounded}%)` }} />
    </ProgressPrimitive.Root>
  )
}
