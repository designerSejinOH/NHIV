// types/database.ts

export interface AdminUser {
  id: number
  username: string
  password: string
  created_at: string
}

export interface Specimen {
  no: number
  specimen_id: string
  sex_growth: string | null
  size: string | null
  model_url: string | null
  collection_id: number | null
  death_location_text: string | null
  death_latitude: number | null
  death_longitude: number | null
  death_date: string | null
  made_date: string | null
  made_by: string | null
  species_id: number | null
  lifespan: string | null
  diets: string | null
  predators: string | null
  habitats: string | null
  distribution_regions: string | null
  iucn_status_id: number | null
  protection_type_ids: number[] | null
  created_at: string
  updated_at: string
}

export interface SpecimenWithCollection extends Specimen {
  collections?: {
    latitude: number | null
    longitude: number | null
    institution_name: string
  }
  latlng?: [number, number] // 동적으로 추가되는 필드
}
