/* oxlint-disable react/only-export-components -- compound primitive parts intentionally share one module */
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TabsRootProps extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, 'value' | 'onValueChange'> {
  selectedKey: string
  onSelectionChange: (key: string) => void
  variant?: 'primary' | 'secondary'
}

const TabsRoot = forwardRef<ElementRef<typeof TabsPrimitive.Root>, TabsRootProps>(
  ({ className, selectedKey, onSelectionChange, variant = 'primary', ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} value={selectedKey} onValueChange={onSelectionChange} data-variant={variant} className={cn('tabs', className)} {...props} />
  ),
)
TabsRoot.displayName = 'Tabs'

const TabsListContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('tabs-list-container', className)} {...props} />
))
TabsListContainer.displayName = 'TabsListContainer'

const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('tabs-list inline-flex items-center', className)} {...props} />
))
TabsList.displayName = 'TabsList'

interface TabsTabProps extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, 'value'> { id: string }
const TabsTab = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, TabsTabProps>(({ id, className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} value={id} className={cn('tabs-trigger', className)} {...props} />
))
TabsTab.displayName = 'TabsTab'

interface TabsPanelProps extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Content>, 'value'> { id: string }
const TabsPanel = forwardRef<ElementRef<typeof TabsPrimitive.Content>, TabsPanelProps>(({ id, className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} value={id} className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring/60', className)} {...props} />
))
TabsPanel.displayName = 'TabsPanel'

export const Tabs = Object.assign(TabsRoot, {
  ListContainer: TabsListContainer,
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
})
