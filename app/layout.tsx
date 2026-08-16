import './globals.css'

import { Section, Container } from '@/components/craft'
import { Inter as FontSans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { AuthBar } from '@/components/nav/auth-bar'

import { Analytics } from '@vercel/analytics/react'

import { mainMenu, contentMenu } from '@/menu.config'
import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

import Balancer from 'react-wrap-balancer'
import { SiteNav } from '@/components/nav/site-nav'
import Link from 'next/link'

import type { Metadata } from 'next'

const font = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title:
    'Системный Блокъ - Онлайн-журнал о влиянии цифровых технологий на культуру, человека и общество',
  description: 'Онлайн-журнал о влиянии цифровых технологий на культуру, человека и общество',
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen font-sans antialiased', font.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <SiteNav />
          <AuthBar />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

const Footer = () => {
  return (
    <footer>
      <Section>
        <Container className="flex">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{siteConfig.site_name}</h3>
            </Link>
            <p>
              <Balancer>{siteConfig.site_description}</Balancer>
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm ml-6">
            <h5 className="font-medium text-base">Website</h5>
            {Object.entries(mainMenu).map(([key, href]) => (
              <Link className="hover:underline underline-offset-4" key={href} href={href}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
          {Object.entries(contentMenu).length > 0 && (
            <div className="flex flex-col gap-2 text-sm">
              <h5 className="font-medium text-base">Blog</h5>
              {Object.entries(contentMenu).map(([key, href]) => (
                <Link className="hover:underline underline-offset-4" key={href} href={href}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Link>
              ))}
            </div>
          )}
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          <ThemeToggle />
          <p className="text-muted-foreground">
            &copy; <a href="https://9d8.dev">9d8</a>. All rights reserved. 2025-present.
          </p>
        </Container>
      </Section>
    </footer>
  )
}
