'use client'

import { Suspense, useState } from 'react'
import { Map, Copyright } from '@/components'
import classNames from 'classnames'
import { TitleSection } from './TitleSection'
import { FilterSection } from './FilterSection'
import { Intro } from './Intro'
import { MapSection } from './MapSection'
import { Specimen } from '@/types'

export default function Home() {
  const [isPageInfo, setIsPageInfo] = useState(true)
  const [selectedHeritage, setSelectedHeritage] = useState<{
    isSelected: boolean
    data: any
  } | null>(null)

  const [currentFilter, setCurrentFilter] = useState<string[] | null>(null)

  const examples: Specimen[] = [
    {
      no: 1, //No.
      specimen_id: 'SP0017', //Specimen ID
      sex_growth: '수 / 성체', //표본정보 (성별/성장단계)
      size: null, //크기(단위)
      model_url: '/data/SP0017.glb', //3D 모델 URL

      //filter 1
      specimen_location: '경기도 과천시 대공원광장로 102 서울대공원', //폐사장소 or 소장처
      latlng: [37.427715, 127.016968], //위도/경도

      //filter 2
      death_date: '2018-01-26', //폐사일자
      specimen_made_date: '2018-06', // 표본제작일자

      //filter 1
      specimen_made_by: null, //제작자 *nullable

      name_kr: '수달', //국문명칭 (Korean)
      name_en: 'Common Otter', //영문명칭 (English)
      name_sci: 'Lutra lutra', //학명

      //filter 1
      class_name: '포유류 (포유동물강, Mammalia)', //분류

      lifespan: null, //수명
      diets: '물고기, 양서류, 갑각류, 조류 등', //식성
      predators: null, //천적
      habitats:
        '전국 하천, 계곡, 호수, 저수지 일대, 가까운 연안의 섬 지방, 하천, 호숫가, 물가의 바위구멍이나 나무뿌리 밑', //서식지
      distribution_regions: '유라시아(시베리아 제외), 아프리카(북부 포함), 오스트레일리아·남극 제외 전 대륙', //분포지
      icus_status_code: 'NT(Near Threatened)', //IUCN 적색목록

      //filter 1
      national_protection_status: ['멸종위기 야생생물', '천연기념물'], //국가 보호종
    },
    {
      no: 2, //No.
      specimen_id: 'SP0018', //Specimen ID
      sex_growth: '수 / 성체', //표본정보 (성별/성장단계)
      size: null, //크기(단위)
      model_url: '/data/SP0018.glb', //3D 모델 URL

      //filter 1
      specimen_location: '경기도 과천시 대공원광장로 102 서울대공원', //폐사장소 or 소장처
      latlng: [37.427715, 127.016968], //위도/경도

      //filter 2
      death_date: '2018-01-26', //폐사일자
      specimen_made_date: '2018-06', // 표본제작일자

      //filter 1
      specimen_made_by: null, //제작자 *nullable

      name_kr: '수달', //국문명칭 (Korean)
      name_en: 'Common Otter', //영문명칭 (English)
      name_sci: 'Lutra lutra', //학명

      //filter 1
      class_name: '포유류 (포유동물강, Mammalia)', //분류

      lifespan: null, //수명
      diets: '물고기, 양서류, 갑각류, 조류 등', //식성
      predators: null, //천적
      habitats:
        '전국 하천, 계곡, 호수, 저수지 일대, 가까운 연안의 섬 지방, 하천, 호숫가, 물가의 바위구멍이나 나무뿌리 밑', //서식지
      distribution_regions: '유라시아(시베리아 제외), 아프리카(북부 포함), 오스트레일리아·남극 제외 전 대륙', //분포지
      icus_status_code: 'NT(Near Threatened)', //IUCN 적색목록

      //filter 1
      national_protection_status: ['멸종위기 야생생물', '천연기념물'], //국가 보호종
    },
    {
      no: 3, //No.
      specimen_id: 'SP0019', //Specimen ID
      sex_growth: '수 / 성체', //표본정보 (성별/성장단계)
      size: null, //크기(단위)
      model_url: '/data/SP0019.glb', //3D 모델 URL

      //filter 1
      specimen_location: '경기도 과천시 대공원광장로 102 서울대공원', //폐사장소 or 소장처
      latlng: [37.427715, 127.016968], //위도/경도

      //filter 2
      death_date: '2018-01-26', //폐사일자
      specimen_made_date: '2018-06', // 표본제작일자

      //filter 1
      specimen_made_by: null, //제작자 *nullable

      name_kr: '수달', //국문명칭 (Korean)
      name_en: 'Common Otter', //영문명칭 (English)
      name_sci: 'Lutra lutra', //학명

      //filter 1
      class_name: '포유류 (포유동물강, Mammalia)', //분류

      lifespan: null, //수명
      diets: '물고기, 양서류, 갑각류, 조류 등', //식성
      predators: null, //천적
      habitats:
        '전국 하천, 계곡, 호수, 저수지 일대, 가까운 연안의 섬 지방, 하천, 호숫가, 물가의 바위구멍이나 나무뿌리 밑', //서식지
      distribution_regions: '유라시아(시베리아 제외), 아프리카(북부 포함), 오스트레일리아·남극 제외 전 대륙', //분포지
      icus_status_code: 'NT(Near Threatened)', //IUCN 적색목록

      //filter 1
      national_protection_status: ['멸종위기 야생생물', '천연기념물'], //국가 보호종
    },
  ]

  const specimens = examples

  return (
    <>
      {isPageInfo && <Intro isPageInfo={isPageInfo} setIsPageInfo={setIsPageInfo} />}
      <div className='w-full h-dvh flex flex-col gap-0 break-keep overflow-hidden'>
        <div className='flex-1 w-full grid grid-cols-[minmax(20vw,1fr)_3fr] grid-rows-[auto_1fr] p-2 gap-2 min-h-0'>
          {/* 페이지 타이틀 영역 - 좌상단 */}
          <TitleSection className='col-start-1 row-start-1 shadow-md rounded-lg overflow-hidden' />
          {/* 필터/3D 영역 - 좌하단 */}
          <FilterSection
            className='col-start-1 row-start-2 rounded-lg shadow-md overflow-hidden'
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
          />
          {/* 맵 - 오른쪽 전체 */}
          <MapSection
            className='col-start-2 row-span-2 rounded-lg shadow-md overflow-hidden'
            selectedHeritage={selectedHeritage}
            setSelectedHeritage={setSelectedHeritage}
            specimens={specimens}
          />
        </div>
        {/* copyright */}
        <Copyright />
      </div>
    </>
  )
}
