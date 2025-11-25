// hooks/useClusteredSpecimens.ts
import { useMemo } from 'react'
import Supercluster from 'supercluster'
import { Specimen } from '@/types'

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
  specimen: Specimen
  lat: number
  lng: number
}

export type ClusterOrMarker = ClusterPoint | MarkerPoint

export const useClusteredSpecimens = (
  specimens: Specimen[] | undefined,
  bounds: Bounds | null,
  zoom: number,
): ClusterOrMarker[] => {
  return useMemo(() => {
    if (!specimens || !bounds) return []

    const points = specimens.map((s) => ({
      type: 'Feature' as const,
      properties: { specimen: s },
      geometry: {
        type: 'Point' as const,
        coordinates: [s.latlng[1], s.latlng[0]], // [lng, lat]
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
        specimen: c.properties.specimen as Specimen,
        lat,
        lng,
      }
    })
  }, [specimens, bounds, zoom])
}
