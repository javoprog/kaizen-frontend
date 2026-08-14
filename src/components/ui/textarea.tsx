import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'primary' | 'secondary'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant = 'primary', ...props }, ref) => (
  <textarea ref={ref} data-slot="textarea" data-variant={variant} className={cn('textarea flex w-full', className)} {...props} />
))
Textarea.displayName = 'Textarea'

export { Textarea as TextArea }
