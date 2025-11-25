export type Specimen = {
  no: number //No.
  specimen_id: string //Specimen ID
  sex_growth: string | null //표본정보 (성별/성장단계)
  size: string | null //크기(단위)
  model_url: string //3D 모델 URL

  //filter 1
  specimen_location: string | null //폐사장소 or 소장처
  latlng: [number, number] //위도/경도

  //filter 2
  death_date: string | null //폐사일자
  specimen_made_date: string | null // 표본제작일자

  //filter 1
  specimen_made_by: string | null //제작자 *nullable

  name_kr: string | null //국문명칭 (Korean)
  name_en: string | null //영문명칭 (English)
  name_sci: string | null //학명

  //filter 1
  class_name: string | null //분류

  lifespan: string | null //수명
  diets: string | null //식성
  predators: string | null //천적
  habitats: string | null //서식지
  distribution_regions: string | null //분포지
  iucn_status_code: string | null //IUCN 적색목록

  //filter 1
  national_protection_status: string[] | null //국가 보호종
}
