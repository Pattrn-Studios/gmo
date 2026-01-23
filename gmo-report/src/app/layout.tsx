import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'GMO Report',
  description: 'Interactive financial report viewer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
