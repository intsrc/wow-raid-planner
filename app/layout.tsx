import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Northrend RaidPlanner - WoW WOTLK Raid Management',
  description: 'Guild raid planning tool for World of Warcraft: Wrath of the Lich King',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="dark">{children}</body>
    </html>
  )
}
