import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../hooks/useLanguage'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DeepFocus - Pomodoro Timer',
  description: 'Focus better with DeepFocus, a modern Pomodoro timer app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-background text-onBackground`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}