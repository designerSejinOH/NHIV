// hooks/useClusteredSpecimens.ts
import { useMemo } from 'react'
import Supercluster from 'supercluster'
import type { SpecimenWithCollection } from '@/types/database'

type Bounds = {
  north: number
  south: number
  east: number
  west: number
}

type ClusterPoint = {
  type: 'cluster'
  id: number
  lat: number
  lng: number
  pointCount: number
}

type MarkerPoint = {
  type: 'marker'
  specimen: SpecimenWithCollection
  lat: number
  lng: number
}

export type ClusterOrMarker = ClusterPoint | MarkerPoint

export const useClusteredSpecimens = (
  specimens: SpecimenWithCollection[] | undefined,
  bounds: Bounds | null,
  zoom: number,
): ClusterOrMarker[] => {
  return useMemo(() => {
    if (!specimens || !bounds) return []

    // latlng가 있는 specimens만 필터링
    const validSpecimens = specimens.filter((s) => s.latlng && s.latlng.length === 2)

    const points = validSpecimens.map((s) => ({
      type: 'Feature' as const,
      properties: { specimen: s },
      geometry: {
        type: 'Point' as const,
        coordinates: [s.latlng![1], s.latlng![0]], // [lng, lat]
      },
    }))

    const index = new Supercluster({
      radius: 60,
      maxZoom: 20,
    }).load(points)

    const clusters = index.getClusters([bounds.west, bounds.south, bounds.east, bounds.north], Math.round(zoom))

    return clusters.map((c: any): ClusterOrMarker => {
      const [lng, lat] = c.geometry.coordinates

      if (c.properties.cluster) {
        return {
          type: 'cluster',
          id: c.properties.cluster_id,
          lat,
          lng,
          pointCount: c.properties.point_count,
        }
      }

      return {
        type: 'marker',
        specimen: c.properties.specimen as SpecimenWithCollection,
        lat,
        lng,
      }
    })
  }, [specimens, bounds, zoom])
}
