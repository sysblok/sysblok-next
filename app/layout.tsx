import './globals.css'

import { Inter as FontSans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'

import { Analytics } from '@vercel/analytics/react'

import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

import { SiteNav } from '@/components/nav/site-nav'

import type { Metadata } from 'next'
import Footer from '@/components/footer'

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
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

;<Footer />
