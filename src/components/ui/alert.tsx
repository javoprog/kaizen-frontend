/* oxlint-disable react/only-export-components -- compound primitive parts intentionally share one module */
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type AlertStatus = 'default' | 'danger' | 'warning' | 'accent'
const AlertRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { status?: AlertStatus }>(({ className, status = 'default', ...props }, ref) => (
  <div ref={ref} role={status === 'danger' ? 'alert' : 'status'} data-status={status} className={cn('alert grid grid-cols-[auto_1fr] gap-3 rounded-md border p-4 text-sm', status === 'danger' && 'border-destructive/30 bg-destructive/10 text-destructive-foreground', status === 'warning' && 'border-warning/25 bg-warning/10', status === 'accent' && 'border-primary/25 bg-primary/10', status === 'default' && 'border-border bg-muted/45', className)} {...props} />
))
AlertRoot.displayName = 'Alert'
const AlertIndicator = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn('mt-0.5', className)} {...props} />
const AlertContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn('grid gap-1', className)} {...props} />
const AlertTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h4 className={cn('font-semibold leading-none', className)} {...props} />
const AlertDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('m-0 text-xs leading-relaxed text-muted-foreground', className)} {...props} />
export const Alert = Object.assign(AlertRoot, { Indicator: AlertIndicator, Content: AlertContent, Title: AlertTitle, Description: AlertDescription })
