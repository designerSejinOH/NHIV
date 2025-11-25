'use client'

import { useRef, useState } from 'react'
import { Map } from '@/components'
import { OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'
import { HeritageModal } from './components/HeritageModal'
import classNames from 'classnames'
import { Specimen } from '@/types'
import { useOffsetMarkers } from '@/hooks/useOffsetMarkers'
import { useClusteredSpecimens } from '@/hooks/useClusteredSpecimens'

const PIN_EXPAND_ZOOM = 16 // 🔥 여기서 조절하면 됨

interface MapSectionProps {
  specimens?: Specimen[]
  className?: string
  setSelectedHeritage: React.Dispatch<React.SetStateAction<{ isSelected: boolean; data: any } | null>>
  selectedHeritage: { isSelected: boolean; data: any } | null
}

export const MapSection = ({ specimens, setSelectedHeritage, selectedHeritage, className }: MapSectionProps) => {
  const [zoom, setZoom] = useState(15)
  const [bounds, setBounds] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)

  const clustersOrMarkers = useClusteredSpecimens(specimens, bounds, zoom)

  const showOffsetMarkers = zoom >= PIN_EXPAND_ZOOM
  const offsetMarkers = useOffsetMarkers(showOffsetMarkers ? specimens : undefined)

  // 줌 단계 텍스트
  const zoomLabel = zoom < 10 ? '국가 / 광역' : zoom < 14 ? '도시 / 구 단위' : zoom < 17 ? '동네 / 거리' : '세부 / 건물'

  return (
    <section className={classNames('flex relative', className)}>
      {/* 🔥 줌 레벨 HUD */}
      <div className='absolute left-3 top-3 z-10 flex flex-col gap-1 pointer-events-none'>
        <div className='inline-flex items-center gap-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5'>
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
                zoom >= level ? 'bg-emerald-400' : 'bg-white/30',
              )}
            />
          ))}
        </div>
      </div>
      <Map
        defaultCenter={null}
        defaultZoom={15}
        onIdle={(map) => {
          mapRef.current = map // 🔥 map 인스턴스 저장

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
                const targetZoom = Math.max(currentZoom + 2, PIN_EXPAND_ZOOM) // 🔥 한 번에 쭉 or 조금씩

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

            // 단일 마커 (줌 낮을 때, 아직 offset 안 씀)
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
                  <span className='w-fit h-fit text-sm font-medium text-black'>{item.specimen.name_kr}</span>
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
              {/* tooltip */}
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
                  <span className='text-base text-black font-semibold leading-tight'>{item.name_kr}</span>
                  <span className='text-xs text-black/40 leading-none'>{item.name_en}</span>
                </div>

                {/* ▼ 마커 꼬리 (옵션) */}
                <div
                  className='absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-0 h-0
      border-l-[8px] border-l-transparent
      border-r-[8px] border-r-transparent
      border-t-[10px] border-t-white
      drop-shadow-md
    '
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
