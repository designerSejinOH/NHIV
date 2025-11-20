import type { Metadata, Viewport } from 'next'
import { appinfo } from '@/config'
import { Layout } from '@/components'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import localFont from 'next/font/local'
import '@/styles/globals.css'
import GoogleMapsProvider from '@/app/providers/GoogleMapsProvider'

const notoSansKR = localFont({
  src: [
    {
      path: '../../public/fonts/NotoSansKR-VariableFont_wght.ttf',
      weight: '100 900',
    },
  ],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${notoSansKR.className} antialiased`}>
        <GoogleMapsProvider>
          <Layout>{children}</Layout>
        </GoogleMapsProvider>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#ffffff',
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  alternates: {
    canonical: appinfo.url,
  },
  title: {
    default: appinfo.title,
    template: appinfo.titleTemplate,
  },
  description: appinfo.description,
  keywords: appinfo.keywords,
  authors: appinfo.authors,
  creator: appinfo.authors[0].name,
  publisher: appinfo.authors[0].name,
  manifest: '/manifest.json',
  generator: appinfo.authors[0].name,
  applicationName: appinfo.name,
  appleWebApp: {
    capable: true,
    title: appinfo.title,
    // startUpImage: [],
  },
  category: 'webapp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: appinfo.name,
    title: {
      default: appinfo.title,
      template: appinfo.titleTemplate,
    },
    description: appinfo.description,
    locale: 'ko_KR',
    url: appinfo.url,
    images: {
      url: '/icons/op-image.png',
    },
  },
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: {
      rel: 'mask-icon',
      url: '/icons/safari-pinned-tab.svg',
      color: '#000000',
    },
  },
}
