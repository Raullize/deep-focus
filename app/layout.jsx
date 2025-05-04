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
    <html lang="en">
      <head>
        {/* Metadados importantes para garantir renderização correta */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Script para corrigir o atributo lang baseado no localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedLanguage = localStorage.getItem('language');
                if (savedLanguage === 'pt') {
                  document.documentElement.lang = 'pt';
                } else if (savedLanguage === 'en') {
                  document.documentElement.lang = 'en';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-onBackground`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
} 