'use client'

import { useRef, useState, useMemo } from 'react'
import { Map } from '@/components'
import { OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'
import { HeritageModal } from './components/HeritageModal'
import classNames from 'classnames'
import { useOffsetMarkers } from '@/hooks/useOffsetMarkers'
import { useClusteredSpecimens } from '@/hooks/useClusteredSpecimens'
import type { SpecimenWithCollection } from '@/types/database'

export type MapMode = 'collection' | 'death'

const PIN_EXPAND_ZOOM = 16

interface MapSectionProps {
  specimens?: SpecimenWithCollection[]
  className?: string
  setSelectedHeritage: React.Dispatch<React.SetStateAction<{ isSelected: boolean; data: any } | null>>
  selectedHeritage: { isSelected: boolean; data: any } | null
}

// 🔥 좌표 추출 헬퍼 함수
const getCoordinates = (specimen: SpecimenWithCollection, mode: MapMode) => {
  if (mode === 'collection') {
    // 소장처 좌표
    return {
      lat: specimen.collections?.latitude,
      lng: specimen.collections?.longitude,
    }
  }
  // 사망 장소 좌표
  return {
    lat: specimen.death_latitude,
    lng: specimen.death_longitude,
  }
}

// 🔥 좌표가 유효한지 체크
const hasValidCoordinates = (specimen: SpecimenWithCollection, mode: MapMode) => {
  const coords = getCoordinates(specimen, mode)
  return coords.lat != null && coords.lng != null
}

export const MapSection = ({ specimens, setSelectedHeritage, selectedHeritage, className }: MapSectionProps) => {
  const [zoom, setZoom] = useState(15)
  const [bounds, setBounds] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)
  const [mapMode, setMapMode] = useState<MapMode>('collection') // 🔥 맵 모드 state

  const mapRef = useRef<google.maps.Map | null>(null)

  // 🔥 맵 모드에 따라 유효한 좌표가 있는 specimens만 필터링
  const filteredSpecimens = useMemo(() => {
    if (!specimens) return []
    return specimens.filter((s) => hasValidCoordinates(s, mapMode))
  }, [specimens, mapMode])

  // 🔥 specimens를 맵 모드에 맞게 변환 (latlng 필드 추가)
  const specimensWithLatLng = useMemo(() => {
    return filteredSpecimens.map((s) => {
      const coords = getCoordinates(s, mapMode)
      return {
        ...s,
        latlng: [coords.lat!, coords.lng!] as [number, number],
      }
    })
  }, [filteredSpecimens, mapMode])

  const clustersOrMarkers = useClusteredSpecimens(specimensWithLatLng, bounds, zoom)

  const showOffsetMarkers = zoom >= PIN_EXPAND_ZOOM
  const offsetMarkers = useOffsetMarkers(showOffsetMarkers ? specimensWithLatLng : undefined)

  // 줌 단계 텍스트
  const zoomLabel = zoom < 10 ? '국가 / 광역' : zoom < 14 ? '도시 / 구 단위' : zoom < 17 ? '동네 / 거리' : '세부 / 건물'

  return (
    <section className={classNames('flex relative', className)}>
      {/* 🔥 맵 모드 표시 */}
      <div className='absolute top-2 left-1/2 -translate-x-1/2 z-10 w-60 inline-flex items-center gap-2'>
        {['collection', 'death'].map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode as MapMode)}
            className={classNames(
              'flex-1 w-full pl-3 pr-6 py-2 rounded-md pointer-events-auto shadow-md transition-all cursor-pointer flex items-center justify-center gap-2',
              mapMode === mode
                ? 'bg-[#3EBA72] text-white hover:bg-[#36a162] font-semibold '
                : 'bg-white text-black hover:bg-gray-100 font-medium',
            )}
          >
            <span
              className={classNames(
                'mr-1 inline-block w-2 h-2 bg-white rounded-full',
                mode === 'collection' ? 'bg-[#3EBA72]' : 'bg-[#FF6B6B]',
              )}
            />
            {mode === 'collection' ? '소장처' : '발견지'}
          </button>
        ))}
      </div>
      <div className='absolute left-3 top-3 z-10 flex flex-col gap-2 pointer-events-none rounded-lg bg-white/50 backdrop-blur-sm text-black px-3 py-1.5'>
        <div className='inline-flex items-center gap-2  text-sm'>
          <span className='font-semibold'>Zoom {zoom.toFixed(1)}</span>
          <span className='text-[10px] opacity-80'>{zoomLabel}</span>
        </div>
        {/* 간단한 단계 표시 바 */}
        <div className='flex gap-1 items-center'>
          {[8, 12, 16, 19].map((level, idx) => (
            <div
              key={level}
              className={classNames(
                'h-1.5 rounded-xl transition-all duration-200',
                idx === 0 && 'w-4',
                idx === 1 && 'w-6',
                idx === 2 && 'w-8',
                idx === 3 && 'w-10',
                zoom >= level ? 'bg-[#3EBA72]' : 'bg-black/30',
              )}
            />
          ))}
        </div>
      </div>

      <Map
        defaultCenter={null}
        defaultZoom={15}
        onIdle={(map) => {
          mapRef.current = map

          const b = map.getBounds()
          const z = map.getZoom() ?? 15

          if (b) {
            const ne = b.getNorthEast()
            const sw = b.getSouthWest()
            setBounds({
              north: ne.lat(),
              south: sw.lat(),
              east: ne.lng(),
              west: sw.lng(),
            })
          }
          setZoom(z)
        }}
      >
        {/* ▽ 줌 낮을 때: 클러스터/단일 마커 */}
        {!showOffsetMarkers &&
          clustersOrMarkers.map((item) => {
            if (item.type === 'cluster') {
              const handleClusterClick = () => {
                if (!mapRef.current) return

                const currentZoom = mapRef.current.getZoom() ?? 15
                const targetZoom = Math.max(currentZoom + 2, PIN_EXPAND_ZOOM)

                mapRef.current.setZoom(targetZoom)
                mapRef.current.panTo({ lat: item.lat, lng: item.lng })
              }

              return (
                <OverlayViewF
                  key={`cluster-${item.id}`}
                  position={{ lat: item.lat, lng: item.lng }}
                  mapPaneName={OVERLAY_MOUSE_TARGET}
                >
                  <div
                    onClick={handleClusterClick}
                    style={{
                      position: 'absolute',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'auto',
                    }}
                    className='flex items-center justify-center rounded-full bg-[#3EBA72] text-white text-base font-semibold w-12 h-12 shadow-lg cursor-pointer hover:bg-[#36a162] active:scale-95 transition-all'
                  >
                    {item.pointCount}
                  </div>
                </OverlayViewF>
              )
            }

            // 단일 마커 (줌 낮을 때)
            return (
              <OverlayViewF
                key={`marker-${item.specimen.no}`}
                position={{ lat: item.lat, lng: item.lng }}
                mapPaneName={OVERLAY_MOUSE_TARGET}
              >
                <div
                  onClick={() => {
                    setSelectedHeritage({ isSelected: true, data: item.specimen })
                  }}
                  style={{
                    position: 'absolute',
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    borderRadius: '12px',
                  }}
                  className='w-fit h-fit flex flex-row gap-2 rounded-lg overflow-hidden bg-white p-2 shadow-lg items-center justify-center cursor-pointer hover:bg-[#F5FDF8] active:scale-95 transition-all'
                >
                  <div className='w-6 h-6 bg-[#3EBA72]' />
                  <span className='w-fit h-fit text-sm font-medium text-black'>{item.specimen.specimen_id}</span>
                </div>
              </OverlayViewF>
            )
          })}

        {/* ▽ 줌이 PIN_EXPAND_ZOOM 이상일 때: 겹치는 좌표를 offsetMarkers로 펼침 */}
        {showOffsetMarkers &&
          offsetMarkers.map((item) => (
            <OverlayViewF
              key={`${item.no}-${item.groupIndex}`}
              position={{ lat: item.offsetLatLng[0], lng: item.offsetLatLng[1] }}
              mapPaneName={OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => {
                  setSelectedHeritage({ isSelected: true, data: item })
                }}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -100%)',
                  pointerEvents: 'auto',
                }}
                className={classNames(
                  'relative',
                  'w-fit h-fit flex items-start gap-2',
                  'bg-white shadow-xl rounded-xl p-1',
                  'cursor-pointer hover:scale-105 active:scale-95 transition-all',
                  'border border-black/5',
                )}
              >
                {/* 이미지 박스 */}
                <div className='w-16 h-16 flex-shrink-0 rounded-md bg-[#3EBA72] flex items-center justify-center text-white text-xs'>
                  이미지
                </div>

                {/* 텍스트 정보 */}
                <div className='w-fit h-fit flex flex-col gap-1 pr-1 py-0.5'>
                  <span className='text-xs text-black/60 font-medium leading-none'>{item.specimen_id}</span>
                  <span className='text-base text-black font-semibold leading-tight'>표본 #{item.no}</span>
                  <span className='text-xs text-black/40 leading-none'>
                    {mapMode === 'collection' ? item.collections?.institution_name : item.death_location_text}
                  </span>
                </div>

                {/* ▼ 마커 꼬리 */}
                <div
                  className='absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-0 h-0
                    border-l-[8px] border-l-transparent
                    border-r-[8px] border-r-transparent
                    border-t-[10px] border-t-white
                    drop-shadow-md'
                />
              </div>
            </OverlayViewF>
          ))}

        <LiveLocationLayer />
      </Map>

      <HeritageModal
        specimens={specimens || []}
        selectedSpeciemen={selectedHeritage}
        setSelectedSpeciemen={setSelectedHeritage}
      />
    </section>
  )
}
