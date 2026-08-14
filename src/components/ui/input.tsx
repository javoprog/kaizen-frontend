import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, variant = 'primary', ...props }, ref) => (
  <input ref={ref} data-slot="input" data-variant={variant} className={cn('input flex w-full', className)} {...props} />
))
Input.displayName = 'Input'
