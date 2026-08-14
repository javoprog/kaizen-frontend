/* oxlint-disable react/only-export-components -- compound primitive parts intentionally share one module */
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const Root = forwardRef<ElementRef<typeof CollapsiblePrimitive.Root>, ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>>(({ className, ...props }, ref) => <CollapsiblePrimitive.Root ref={ref} className={cn('disclosure', className)} {...props} />)
Root.displayName = 'Disclosure'
const Heading = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn('disclosure-heading', className)} {...props} />
const Trigger = forwardRef<ElementRef<typeof CollapsiblePrimitive.Trigger>, ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>>(({ className, ...props }, ref) => <CollapsiblePrimitive.Trigger ref={ref} className={cn('disclosure-trigger', className)} {...props} />)
Trigger.displayName = 'DisclosureTrigger'
const Indicator = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={cn('disclosure-indicator', className)} {...props} />
const Content = forwardRef<ElementRef<typeof CollapsiblePrimitive.Content>, ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>>(({ className, ...props }, ref) => <CollapsiblePrimitive.Content ref={ref} className={cn('disclosure-content', className)} {...props} />)
Content.displayName = 'DisclosureContent'
const Body = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn('disclosure-body', className)} {...props} />

export const Disclosure = Object.assign(Root, { Heading, Trigger, Indicator, Content, Body })
