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

export interface SpecimenWithRelations extends Specimen {
  species?: {
    name_kr: string
    name_en: string | null
    name_sci: string | null
    classifications?: {
      name: string
    }
  }
  collections?: {
    institution_name: string
    latitude: number | null
    longitude: number | null
    address: string | null
  }
  iucn_statuses?: {
    code: string
    name_kr: string
    name_en: string
  }
  protection_type_ids: number[] | null
  protection_types?: string[]

  latlng?: [number, number] // 동적으로 추가되는 필드
}
