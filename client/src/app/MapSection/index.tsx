'use client'

import { useRef, useState, useMemo } from 'react'
import { Map as GoogleMap } from '@/components'
import { OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'
import { HeritageModal } from './components/HeritageModal'
import classNames from 'classnames'
import { useOffsetMarkers } from '@/hooks/useOffsetMarkers'
import { useClusteredSpecimens } from '@/hooks/useClusteredSpecimens'
import type { SpecimenWithRelations } from '@/types/database'
import { CollectionModal } from './components'
import { PiHouseLine } from 'react-icons/pi'
import { GrLocationPin } from 'react-icons/gr'
import { extractClassificationKey } from '@/hooks/extractClassificationKey'
import { CLASSIFICATION_COLORS } from '@/styles/colors'
import { GoChevronRight } from 'react-icons/go'

export type MapMode = 'collection' | 'death'

const PIN_EXPAND_ZOOM = 16
const DEFAULT_ZOOM = 8

interface MapSectionProps {
  specimens?: SpecimenWithRelations[]
  className?: string
  setSelectedHeritage: React.Dispatch<React.SetStateAction<{ isSelected: boolean; data: any } | null>>
  selectedHeritage: { isSelected: boolean; data: any } | null
}

// 소장처별로 표본 그룹핑
export interface CollectionGroup {
  collectionId: number
  institutionName: string
  address: string
  lat: number
  lng: number
  specimens: SpecimenWithRelations[]
  count: number
}

// 좌표 추출 헬퍼 함수
const getCoordinates = (specimen: SpecimenWithRelations, mode: MapMode) => {
  if (mode === 'collection') {
    return {
      lat: specimen.collections?.latitude,
      lng: specimen.collections?.longitude,
    }
  }
  return {
    lat: specimen.death_latitude,
    lng: specimen.death_longitude,
  }
}

// 좌표가 유효한지 체크
const hasValidCoordinates = (specimen: SpecimenWithRelations, mode: MapMode) => {
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
  const [mapMode, setMapMode] = useState<MapMode>('collection')
  const [selectedCollection, setSelectedCollection] = useState<CollectionGroup | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)

  // 맵 모드에 따라 유효한 좌표가 있는 specimens만 필터링
  const filteredSpecimens = useMemo(() => {
    if (!specimens) return []
    return specimens.filter((s) => hasValidCoordinates(s, mapMode))
  }, [specimens, mapMode])

  // 소장처별 그룹핑 (collection 모드 전용)
  const collectionGroups = useMemo(() => {
    if (mapMode !== 'collection') return []

    const groups = new Map<number, CollectionGroup>()

    filteredSpecimens.forEach((s) => {
      if (!s.collection_id || !s.collections) return

      if (!groups.has(s.collection_id)) {
        groups.set(s.collection_id, {
          collectionId: s.collection_id,
          institutionName: s.collections.institution_name,
          address: s.collections.address!,
          lat: s.collections.latitude!,
          lng: s.collections.longitude!,
          specimens: [],
          count: 0,
        })
      }

      const group = groups.get(s.collection_id)!
      group.specimens.push(s)
      group.count++
    })

    return Array.from(groups.values())
  }, [filteredSpecimens, mapMode])

  // specimens를 맵 모드에 맞게 변환 (death 모드만 사용)
  const specimensWithLatLng = useMemo(() => {
    if (mapMode === 'collection') return []

    return filteredSpecimens.map((s) => {
      const coords = getCoordinates(s, mapMode)
      return {
        ...s,
        latlng: [coords.lat!, coords.lng!] as [number, number],
      }
    })
  }, [filteredSpecimens, mapMode])

  // death 모드에서만 클러스터링/오프셋 적용
  const clustersOrMarkers = useClusteredSpecimens(mapMode === 'death' ? specimensWithLatLng : [], bounds, zoom)

  const showOffsetMarkers = zoom >= PIN_EXPAND_ZOOM && mapMode === 'death'
  const offsetMarkers = useOffsetMarkers(showOffsetMarkers ? specimensWithLatLng : undefined)

  // 줌 단계 텍스트
  const zoomLabel = zoom < 10 ? '국가 / 광역' : zoom < 14 ? '도시 / 구 단위' : zoom < 17 ? '동네 / 거리' : '세부 / 건물'

  return (
    <section className={classNames('flex relative', className)}>
      {/* 맵 모드 표시 */}
      <div className='absolute top-2 left-1/2 -translate-x-1/2 z-10 w-fit inline-flex items-center gap-0 pointer-events-auto'>
        <div className='relative inline-flex bg-white rounded-xl p-1 shadow-md'>
          {/* 슬라이딩 배경 */}
          <div
            className={classNames(
              'absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-[#3EBA72] rounded-lg transition-all duration-300 ease-in-out',
            )}
            style={{
              left: mapMode === 'collection' ? '0.25rem' : 'calc(50% - 0.05rem)',
            }}
          />

          {/* 버튼들 */}
          {['collection', 'death'].map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode as MapMode)}
              className={classNames(
                'relative z-10 pl-3 pr-4 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-semibold',
                mapMode === mode ? 'text-white' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {mode === 'collection' ? <PiHouseLine className='text-base' /> : <GrLocationPin className='text-base' />}
              {mode === 'collection' ? '소장처' : '발견지'}
            </button>
          ))}
        </div>
      </div>

      <div className='absolute left-2 top-2 z-10 flex flex-col gap-2 pointer-events-none rounded-lg bg-white text-black px-3 py-1.5'>
        <div className='inline-flex items-center gap-2  text-sm'>
          <span className='font-semibold'>Zoom {zoom.toFixed(1)}</span>
          <span className='text-[10px] opacity-80'>{zoomLabel}</span>
        </div>
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

      <GoogleMap
        defaultCenter={null}
        defaultZoom={DEFAULT_ZOOM}
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
        {/* 소장처 모드: 소장처별 그룹 핀 */}
        {mapMode === 'collection' &&
          collectionGroups.map((group) => (
            <OverlayViewF
              key={`collection-${group.collectionId}`}
              position={{ lat: group.lat, lng: group.lng }}
              mapPaneName={OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => {
                  setSelectedCollection(group)
                  if (mapRef.current) {
                    mapRef.current.panTo({ lat: group.lat, lng: group.lng })
                    if (zoom < 14) {
                      mapRef.current.setZoom(14)
                    }
                  }
                }}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
                className='flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all'
              >
                <div className='flex items-center justify-center rounded-full bg-[#3EBA72] text-white text-base font-semibold w-12 h-12 shadow-lg border-3 border-white'>
                  {group.count}
                </div>
                <div className='mt-2 bg-white px-3 py-1.5 rounded-full shadow-md'>
                  <span className='text-sm font-medium text-black'>{group.institutionName}</span>
                </div>
              </div>
            </OverlayViewF>
          ))}

        {/* 사망 장소 모드: 기존 클러스터링/오프셋 방식 */}
        {mapMode === 'death' &&
          !showOffsetMarkers &&
          clustersOrMarkers.map((item) => {
            if (item.type === 'cluster') {
              const handleClusterClick = () => {
                if (!mapRef.current) return

                const currentZoom = mapRef.current.getZoom() ?? 10
                // 🔥 클러스터 클릭 시 적당한 줌 레벨로 조정 (너무 많이 줌인하지 않음)
                const targetZoom = Math.min(currentZoom + 3, PIN_EXPAND_ZOOM - 1)

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

            // 🔥 단일 마커 클릭 시 줌인 추가
            const handleMarkerClick = () => {
              setSelectedHeritage({ isSelected: true, data: item.specimen })

              // 줌인 및 중앙 이동
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom() ?? 15
                if (currentZoom < 15) {
                  mapRef.current.setZoom(15)
                }
                mapRef.current.panTo({ lat: item.lat, lng: item.lng })
              }
            }

            return (
              <OverlayViewF
                key={`marker-${item.specimen.no}`}
                position={{ lat: item.lat, lng: item.lng }}
                mapPaneName={OVERLAY_MOUSE_TARGET}
              >
                <div
                  onClick={handleMarkerClick} // 🔥 핸들러 추가
                  style={{
                    position: 'absolute',
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    borderRadius: '12px',
                  }}
                  className='relative w-fit h-fit flex flex-row p-1 rounded-lg overflow-visible bg-white shadow-lg items-center justify-center cursor-pointer hover:bg-[#FFF5F5] active:scale-95 transition-all'
                >
                  <div
                    className='absolute left-1/2 -translate-x-1/2 pointer-events-none'
                    style={{
                      bottom: '-7px',
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid white',
                      filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))',
                    }}
                  />

                  <div className='flex justify-center items-center w-fit h-16 p-2'>
                    <div
                      className='w-10 h-10'
                      style={{
                        backgroundColor:
                          CLASSIFICATION_COLORS[
                            extractClassificationKey(item.specimen.species?.classifications?.name || '')
                          ],
                        mask: `url('/img/${extractClassificationKey(item.specimen.species?.classifications?.name || '')}.png') no-repeat center / contain`,
                        WebkitMask: `url('/img/${extractClassificationKey(item.specimen.species?.classifications?.name || '')}.png') no-repeat center / contain`,
                      }}
                    />
                  </div>
                  <div className='w-fit h-16 flex flex-col gap-0.5 text-nowrap px-2 py-2'>
                    <span className='w-fit h-fit text-xs font-medium text-gray-500'>{item.specimen.specimen_id}</span>
                    <span className='w-fit h-fit text-base font-semibold text-black leading-tight'>
                      {item.specimen.species?.name_kr || '알 수 없음'}
                    </span>
                    <span className='w-fit h-fit text-xxs font-normal text-black/40 leading-none'>
                      {item.specimen.species?.name_en || 'Unknown'}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor:
                        CLASSIFICATION_COLORS[
                          extractClassificationKey(item.specimen.species?.classifications?.name || '')
                        ],
                    }}
                    className='w-fit h-16 text-white font-bold flex px-1 rounded-r-lg flex-col text-lg items-center justify-center'
                  >
                    <GoChevronRight />
                  </div>
                </div>
              </OverlayViewF>
            )
          })}

        {/* 🔥 오프셋 마커 클릭 시 줌인 추가 */}
        {mapMode === 'death' &&
          showOffsetMarkers &&
          offsetMarkers.map((item) => {
            const handleOffsetMarkerClick = () => {
              setSelectedHeritage({ isSelected: true, data: item })

              // 줌인 및 중앙 이동
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom() ?? 16
                if (currentZoom < 17) {
                  mapRef.current.setZoom(17)
                }
                mapRef.current.panTo({ lat: item.offsetLatLng[0], lng: item.offsetLatLng[1] })
              }
            }

            return (
              <OverlayViewF
                key={`${item.no}-${item.groupIndex}`}
                position={{ lat: item.offsetLatLng[0], lng: item.offsetLatLng[1] }}
                mapPaneName={OVERLAY_MOUSE_TARGET}
              >
                <div
                  onClick={handleOffsetMarkerClick} // 🔥 핸들러 추가
                  style={{
                    position: 'absolute',
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'auto',
                    borderRadius: '12px',
                  }}
                  className='relative w-fit h-fit flex flex-row p-1 rounded-lg overflow-visible bg-white shadow-lg items-center justify-center cursor-pointer hover:bg-[#FFF5F5] active:scale-95 transition-all'
                >
                  <div
                    className='absolute left-1/2 -translate-x-1/2 pointer-events-none'
                    style={{
                      bottom: '-7px',
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid white',
                      filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))',
                    }}
                  />

                  <div className='flex justify-center items-center w-fit h-16 p-2'>
                    <div
                      className='w-10 h-10'
                      style={{
                        backgroundColor:
                          CLASSIFICATION_COLORS[extractClassificationKey(item.species?.classifications?.name || '')],
                        mask: `url('/img/${extractClassificationKey(item.species?.classifications?.name || '')}.png') no-repeat center / contain`,
                        WebkitMask: `url('/img/${extractClassificationKey(item.species?.classifications?.name || '')}.png') no-repeat center / contain`,
                      }}
                    />
                  </div>
                  <div className='w-fit h-16 flex flex-col gap-0.5 text-nowrap px-2 py-2'>
                    <span className='w-fit h-fit text-xs font-medium text-gray-500'>{item.specimen_id}</span>
                    <span className='w-fit h-fit text-base font-semibold text-black leading-tight'>
                      {item.species?.name_kr || '알 수 없음'}
                    </span>
                    <span className='w-fit h-fit text-xxs font-normal text-black/40 leading-none'>
                      {item.species?.name_en || 'Unknown'}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor:
                        CLASSIFICATION_COLORS[extractClassificationKey(item.species?.classifications?.name || '')],
                    }}
                    className='w-fit h-16 text-white font-bold flex px-1 rounded-r-lg flex-col text-lg items-center justify-center'
                  >
                    <GoChevronRight />
                  </div>
                </div>
              </OverlayViewF>
            )
          })}

        <LiveLocationLayer />
      </GoogleMap>

      <CollectionModal
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        setSelectedHeritage={setSelectedHeritage}
      />
      <HeritageModal
        specimens={specimens || []}
        selectedSpeciemen={selectedHeritage}
        setSelectedSpeciemen={setSelectedHeritage}
      />
    </section>
  )
}
