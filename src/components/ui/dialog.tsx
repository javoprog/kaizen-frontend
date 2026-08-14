/* oxlint-disable react/only-export-components -- compound primitive parts intentionally share one module */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ModalRootProps { isOpen: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }
function ModalRoot({ isOpen, onOpenChange, children }: ModalRootProps) {
  return <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>{children}</DialogPrimitive.Root>
}

function ModalContainer({ className, size = 'md', children }: HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg'; placement?: 'center' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="modal-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <div className={cn('modal-positioner pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4', `modal-container-${size}`, className)}>
        {children}
      </div>
    </DialogPrimitive.Portal>
  )
}

const ModalDialog = forwardRef<ElementRef<typeof DialogPrimitive.Content>, ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content ref={ref} data-slot="dialog" aria-describedby={undefined} className={cn('modal-content pointer-events-auto relative w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', className)} {...props} />
))
ModalDialog.displayName = 'ModalDialog'

function ModalCloseTrigger() {
  return (
    <DialogPrimitive.Close className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60" aria-label="Close dialog">
      <X size={16} />
    </DialogPrimitive.Close>
  )
}

const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} data-slot="header" className={cn('p-6 pb-2', className)} {...props} />)
ModalHeader.displayName = 'ModalHeader'
const ModalHeading = forwardRef<ElementRef<typeof DialogPrimitive.Title>, ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn('text-xl font-semibold tracking-tight', className)} {...props} />)
ModalHeading.displayName = 'ModalHeading'
const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} data-slot="body" className={cn('px-6 py-4', className)} {...props} />)
ModalBody.displayName = 'ModalBody'
const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} data-slot="footer" className={cn('flex justify-end gap-2 p-6 pt-2', className)} {...props} />)
ModalFooter.displayName = 'ModalFooter'

export const Modal = {
  Backdrop: ModalRoot,
  Container: ModalContainer,
  Dialog: ModalDialog,
  CloseTrigger: ModalCloseTrigger,
  Header: ModalHeader,
  Heading: ModalHeading,
  Body: ModalBody,
  Footer: ModalFooter,
}
