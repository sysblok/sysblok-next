import * as React from 'react'

import { cn } from '@/lib/utils'

const Card = ({ ...props }: React.ComponentPropsWithRef<'div'>) => <div {...props} />
Card.displayName = 'Card'

const CardTitle = ({ ...props }: React.ComponentPropsWithRef<'div'>) => (
  <h2 className="news-title" {...props} />
)
CardTitle.displayName = 'CardTitle'

const CardDescription = ({ ...props }: React.ComponentPropsWithRef<'p'>) => (
  <p className="news-excerpt" {...props} />
)
CardDescription.displayName = 'CardDescription'

const CardFooter = ({ className, ...props }: React.ComponentPropsWithRef<'div'>) => (
  <div className={cn('mt-auto p-6 pt-0', className)} {...props} />
)
CardFooter.displayName = 'CardFooter'

export { Card, CardFooter, CardTitle, CardDescription }
