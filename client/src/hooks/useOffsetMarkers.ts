// hooks/useOffsetMarkers.ts
import { useMemo } from 'react'
import { SpecimenWithRelations } from '@/types/database'

// 같은 위치에 있는 핀들을 원형으로 흩뿌리는 함수
const getOffsetLatLng = (baseLat: number, baseLng: number, index: number, total: number) => {
  if (total === 1) return { lat: baseLat, lng: baseLng }

  const angle = (2 * Math.PI * index) / total
  const radiusMeters = 30 + 10 * total // 기본 30미터 + 개수당 10미터 증가

  const metersPerDegreeLat = 111_320
  const metersPerDegreeLng = 111_320 * Math.cos((baseLat * Math.PI) / 180)

  const dLat = (radiusMeters * Math.sin(angle)) / metersPerDegreeLat
  const dLng = (radiusMeters * Math.cos(angle)) / metersPerDegreeLng

  return {
    lat: baseLat + dLat,
    lng: baseLng + dLng,
  }
}

export const useOffsetMarkers = (specimens: SpecimenWithRelations[] | undefined) => {
  return useMemo(() => {
    if (!specimens) return []

    // latlng가 있는 specimens만 필터링
    const validSpecimens = specimens.filter((s) => s.latlng && s.latlng.length === 2)

    // 1) 좌표 기준으로 그룹핑
    const grouped = validSpecimens.reduce(
      (acc, item) => {
        const key = `${item.latlng![0]}-${item.latlng![1]}`
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      },
      {} as Record<string, SpecimenWithRelations[]>,
    )

    // 2) offset lat/lng 계산해서 펼쳐진 배열 리턴
    const result = Object.values(grouped).flatMap((group) => {
      const total = group.length
      const [baseLat, baseLng] = group[0].latlng!

      return group.map((item, index) => {
        const offset = getOffsetLatLng(baseLat, baseLng, index, total)
        return {
          ...item,
          offsetLatLng: [offset.lat, offset.lng] as [number, number],
          groupSize: total,
          groupIndex: index,
        }
      })
    })

    return result
  }, [specimens])
}
