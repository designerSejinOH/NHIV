'use client'

import { createContext, useContext, PropsWithChildren } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

type Ctx = { isLoaded: boolean }
const GoogleMapsCtx = createContext<Ctx>({ isLoaded: false })

export function useGoogleMaps() {
  return useContext(GoogleMapsCtx)
}

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places']

export default function GoogleMapsProvider({ children }: PropsWithChildren) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script', // 고정된 id 필수
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // 필요 라이브러리 있으면 여기에:
    libraries: libraries,
    language: 'ko', // 🔥 전역 한국어 설정
  })

  return <GoogleMapsCtx.Provider value={{ isLoaded }}>{children}</GoogleMapsCtx.Provider>
}
