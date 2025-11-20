'use client'

import { GoogleMap } from '@react-google-maps/api'
import { useMemo, useCallback, useRef, memo } from 'react'
import { useGoogleMaps } from '@/app/providers/GoogleMapsProvider'
import { mapStyle } from './styles'

interface MapProps {
  defaultCenter?: { lat: number; lng: number } | null
  defaultZoom?: number
  children?: React.ReactNode
}

function MapBase({ defaultCenter, defaultZoom = 10, children }: MapProps) {
  const { isLoaded } = useGoogleMaps()
  const mapRef = useRef<google.maps.Map>()

  const center = useMemo(() => defaultCenter ?? ({ lat: 37.5665, lng: 126.978 } as const), [defaultCenter])

  const onMapLoad = useCallback((m: google.maps.Map) => {
    mapRef.current = m
  }, [])

  if (!isLoaded) {
    // 여기에 스피너/플레이스홀더 원하는대로
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
        }}
        className='bg-[#028261] text-white font-medium'
      >
        로딩중...
      </div>
    )
  }

  return (
    <GoogleMap
      onLoad={onMapLoad}
      mapContainerStyle={{
        width: '100%',
        height: '100%',
        outline: 'none', // ⭐ 포커스 아웃라인 제거
      }}
      center={center}
      zoom={defaultZoom}
      options={{
        gestureHandling: 'greedy',
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        clickableIcons: false,
        keyboardShortcuts: false,
        scaleControl: false,
        styles: mapStyle,
      }}
    >
      {children}
    </GoogleMap>
  )
}

export const Map = memo(MapBase)
