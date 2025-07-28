import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cohen & Cohen P.C. - Law Firm Portal',
  description: 'Manage clients, leads, and documents securely.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}