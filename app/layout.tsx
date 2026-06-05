import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flower — Quiz privé entre amis',
  description: 'Crée des quiz privés avec tes amis et découvre des résultats révélateurs en temps réel.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var themes = {
      tropical: { from: '#FF006E', mid: '#FB5607', to: '#FFBE0B' },
      citrus: { from: '#FFD60A', mid: '#FF9F1C', to: '#FF4365' }
    };
    var id = localStorage.getItem('flower_theme') || 'tropical';
    var t = themes[id] || themes.tropical;
    document.documentElement.style.setProperty('--c-from', t.from);
    document.documentElement.style.setProperty('--c-mid', t.mid);
    document.documentElement.style.setProperty('--c-to', t.to);
  })();
` }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF006E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Flower" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-[#0f0f13] text-white">
        <div className="mx-auto max-w-md min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
