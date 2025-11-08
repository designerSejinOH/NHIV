'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleF, MarkerF, useGoogleMap } from '@react-google-maps/api'
import { useGeolocation } from '@/hooks/useGeolocation'

type Tracking = false | 'observe' | 'follow'

export function LiveLocationLayer() {
  const map = useGoogleMap()
  const { permission, loc, error, startWatch, stopWatch } = useGeolocation()
  const [tracking, setTracking] = useState<Tracking>('follow') // 기본값: follow
  const panLock = useRef(false) // 과도한 panTo 방지(간단 스로틀)

  // 지도 드래그하면 follow 해제
  useEffect(() => {
    if (!map) return
    const onDragStart = () => setTracking('observe')
    map.addListener('dragstart', onDragStart)
    return () => google.maps.event.clearListeners(map, 'dragstart')
  }, [map])

  // 권한/워치 시작 (버튼 없이 자동 시작 원치 않으면, 버튼으로 옮기면 됨)
  useEffect(() => {
    // iOS Safari는 사용자 제스처 뒤 요청이 더 안정적이지만, 기본값으로 바로 시도
    startWatch()
    return () => stopWatch()
  }, [startWatch, stopWatch])

  // follow일 때 카메라가 사용자 따라감 (간단 스로틀)
  useEffect(() => {
    if (!map || !loc || tracking !== 'follow') return
    if (panLock.current) return
    panLock.current = true
    map.panTo({ lat: loc.lat, lng: loc.lng })
    const t = setTimeout(() => {
      panLock.current = false
    }, 300) // 300ms 스로틀
    return () => clearTimeout(t)
  }, [map, loc, tracking])

  // 정확도 원 옵션
  const accuracyOpts = useMemo<google.maps.CircleOptions>(() => {
    return {
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillOpacity: 0.2,
      clickable: false,
      draggable: false,
      editable: false,
    }
  }, [])

  return (
    <>
      {/* 권한/에러 안내: 필요 시 UI로 치장 */}
      {((!loc && (permission === 'prompt' || permission === 'unknown')) || permission === 'denied' || error) && (
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] rounded-md bg-black/50 backdrop-blur-md px-3 py-2 w-[80vw] text-sm shadow'>
          {!loc && (permission === 'prompt' || permission === 'unknown') && (
            <div className=''>위치 권한을 허용해 주세요.</div>
          )}
          {permission === 'denied' && (
            <div className=''>위치 접근이 거부되었습니다. 브라우저 설정에서 허용해 주세요.</div>
          )}
          {error && <div className=''>{error}</div>}
        </div>
      )}

      {/* 현재 위치 & 정확도 */}
      {loc && (
        <>
          {typeof loc.accuracy === 'number' && loc.accuracy > 0 && (
            <CircleF
              center={{ lat: loc.lat, lng: loc.lng }}
              radius={Math.max(5, loc.accuracy)} // 최소 반경 5m
              options={accuracyOpts}
            />
          )}
          <MarkerF
            position={{ lat: loc.lat, lng: loc.lng }}
            // 기본 파랑 점 아이콘을 쓰고 싶으면 options에 icon 지정 가능
          />
        </>
      )}

      {/* 오른쪽 하단 컨트롤 버튼들 */}
      <div
        style={{
          bottom: 0,
        }}
        className='absolute right-3 z-10 grid gap-2'
      >
        <button
          onClick={() => {
            if (!loc || !map) return
            setTracking('follow')
            map.panTo({ lat: loc.lat, lng: loc.lng })
          }}
          className='rounded-md bg-black px-3 py-2 text-sm shadow'
        >
          현재 위치로
        </button>
        <button
          onClick={() => setTracking((t) => (t === 'follow' ? 'observe' : 'follow'))}
          className='rounded-md bg-black px-3 py-2 text-sm shadow'
        >
          {tracking === 'follow' ? '따라가기 끄기' : '따라가기 켜기'}
        </button>
      </div>
    </>
  )
}
