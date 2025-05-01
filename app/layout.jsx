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
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-onBackground`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
} 