'use client'

import * as React from 'react'
import Link, { LinkProps } from 'next/link'
import { Menu, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { siteConfig } from '@/site.config'
import type { NavItem } from '@/lib/wordpress.d'

interface MobileNavProps {
  items: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const [openAccordion, setOpenAccordion] = React.useState<string | null>(null)

  const toggleAccordion = (label: string) => {
    setOpenAccordion(openAccordion === label ? null : label)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          aria-label="Открыть меню"
        >
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <MobileLink href="/" className="flex items-center text-base" onOpenChange={setOpen}>
              <span className="font-bold uppercase tracking-wider">{siteConfig.site_name}</span>
            </MobileLink>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-1">
            {items.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              if (hasChildren) {
                return (
                  <div key={item.label} className="pt-2">
                    <button
                      onClick={() => toggleAccordion(item.label)}
                      className="flex items-center justify-between w-full py-2 text-sm font-bold uppercase tracking-widest text-left"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          openAccordion === item.label && 'rotate-180',
                        )}
                      />
                    </button>
                    {openAccordion === item.label && (
                      <div className="pl-4 pb-2 flex flex-col space-y-1">
                        {item.children!.map((child) => (
                          <MobileLink
                            key={child.label}
                            href={child.href || '#'}
                            className="text-sm font-normal normal-case tracking-normal text-muted-foreground"
                            onOpenChange={setOpen}
                          >
                            {child.label}
                          </MobileLink>
                        ))}
                      </div>
                    )}
                    <Separator className="mt-2" />
                  </div>
                )
              }

              return (
                <div key={item.label} className="pt-2">
                  <MobileLink
                    href={item.href || '#'}
                    className="text-sm font-bold uppercase tracking-widest"
                    onOpenChange={setOpen}
                  >
                    {item.label}
                  </MobileLink>
                  <Separator className="mt-2" />
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => onOpenChange?.(false)}
      className={cn('block py-2', className)}
      {...props}
    >
      {children}
    </Link>
  )
}
