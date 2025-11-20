'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, OrbitControls } from '@react-three/drei'
import { Map } from '@/components'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiSearch } from 'react-icons/fi'
import { GrFormUp, GrFormDown, GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import classNames from 'classnames'

export default function Home() {
  const [isPageInfo, setIsPageInfo] = useState(false)

  const [currentFilter, setCurrentFilter] = useState<string[] | null>([
    '멸종위기 야생동물',
    '천연기념물',
    '해양보호생물',
  ])

  return (
    <div className='w-full h-dvh flex flex-col gap-0 break-keep overflow-hidden'>
      <AnimatePresence>
        {isPageInfo && (
          <motion.div
            className='fixed inset-0 w-full h-dvh bg-[#3EBA72] p-5 gap-5 text-white flex flex-col items-start justify-start z-50'
            initial={{
              x: '-100%',
            }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className='w-full h-8 flex flex-row items-center justify-between'>
              <button
                onClick={() => setIsPageInfo(false)}
                className='w-fit h-fit flex flex-row gap-3 items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer'
              >
                {/* arrowLeft */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2.5}
                  stroke='currentColor'
                  className='w-8 h-8'
                >
                  <path d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                </svg>
                <span className='text-2xl font-semibold leading-none'>뒤로가기</span>
              </button>
              <button
                onClick={() => setIsPageInfo(false)}
                className='w-fit h-fit flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer'
              >
                {/* close */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-10 h-10'
                >
                  <path d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='w-full h-[calc(100vh-60px-32px)] overflow-y-scroll gap-5 flex flex-row items-start justify-between z-50'>
              <div className='w-full bg-white text-[#028261] h-[calc(100dvh-60px-32px)] sticky top-0 flex flex-col justify-center items-center'>
                이미지 삽입 예정
              </div>

              <div className='w-full h-fit pb-12 flex flex-col justify-start items-start'>
                <span className='text-2xl font-semibold w-fit h-fit leading-none'>프로젝트 소개</span>
                <span className='text-5xl font-bold w-fit h-fit mt-6'>자연유산 DB 지도기반시각화</span>
                <span className='text-xl font-medium w-fit h-fit mt-4'>
                  디지털 박물관 서비스를 위한 AI 기반 네이처 복원 기술 개발
                </span>
                <h3 className='text-xl font-semibold mt-16'>지도기반 시각화 배경</h3>
                <h4 className='text-lg font-bold mt-8'>기존 환경</h4>
                <p className='text-lg mt-2'>
                  기관마다 별개인 표본 소장 현황으로 인해 기관별 소장 표본에 대한 정보 확인의 어려움
                </p>
                <h4 className='text-lg font-bold mt-8'>e-뮤지엄</h4>
                <p className='text-lg mt-2'>
                  분류 현황 : 기타자료 ‒ 표본, 재질의 경우 기타 ‒ 기타로 표기
                  <br />
                  액침표본, 건조표본, 박제 표본 등 다양한 표본의 종류 파악 불가, 정보 파악 난해
                </p>
                <h4 className='text-lg font-bold mt-8'>국립생물자원관 생물표본대여시스템</h4>
                <p className='text-lg mt-2'>
                  표본대여를 위한 정보 중심 타 기관 통합의 문제 검색의 어려움 표본에 대한 직관적 파악 어려움
                  <br />→ 시각화 자료 필요
                </p>
                <div className='w-full h-auto bg-white text-[#3EBA72] flex justify-center items-center aspect-landscape mt-5'>
                  이미지 삽입 예정
                </div>
                <h3 className='text-xl font-semibold mt-16'>데이터 표현의 개선 필요</h3>
                <p className='text-lg mt-2'>
                  표본의 상태를 직관적으로 파악할 수 있는 시스템 필요 3D 모델을 활용시 같은 종의 다른 모습인 표본을
                  효과적으로 표현할 수 있음 <br />- 암수, 번식깃 유무, 유조와 성조, 성장 단계ê등 관리, 연구 뿐만 아니라
                  콘텐츠 제작, 생물학 학습을 위한 자료로 사용 가능
                </p>
                <div className='w-full h-auto bg-white text-[#3EBA72] flex justify-center items-center aspect-landscape mt-5'>
                  이미지 삽입 예정
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex-1 w-full grid grid-cols-[1fr_3fr] grid-rows-[auto_1fr] p-2 gap-2 min-h-0'>
        {/* 페이지 타이틀 영역 - 좌상단 */}
        <section className='col-start-1 row-start-1 flex flex-col items-start bg-[#028261] text-white justify-start p-3 gap-4'>
          {/* 타이틀/설명 등 */}
          <h1 className='text-3xl font-bold'>자연유산 DB 지도기반시각화</h1>

          <h3 className='text-lg font-normal leading-tight'>
            디지털 박물관 서비스를 위한 AI 기반 <br />
            네이처 복원 기술 개발
          </h3>

          <button
            onClick={() => setIsPageInfo(true)}
            className='px-3 py-2 bg-white text-[#028261] font-semibold hover:opacity-80 active:scale-95 transition-all cursor-pointer'
          >
            프로젝트에 대해 알아보기
          </button>
        </section>
        {/* 필터/3D 영역 - 좌하단 */}
        <section className='col-start-1 row-start-2 bg-[#E0F2E6] text-[#028261] flex flex-col gap-2 pb-2 justify-start items-center min-h-0'>
          <div className='w-full h-fit flex flex-col gap-2 bg-[#3EBA72] text-white p-3'>
            <span className='text-xl font-semibold flex flex-row items-center gap-2'>
              <FiSearch />
              필터 선택
            </span>
            <span className='text-base'>데이터 탐색 흐름 통제</span>
          </div>
          <div className='w-full h-fit flex flex-col gap-2 px-2'>
            <span className='text-lg font-semibold flex flex-row items-center gap-2'>현재 선택된 필터</span>
            <div className='w-full min-h-13 bg-white h-fit flex flex-row gap-2 p-2 justify-start items-start flex-wrap'>
              {currentFilter && currentFilter.length > 0 ? (
                currentFilter.map((filter) => (
                  <div
                    onClick={() => {
                      setCurrentFilter((filters) => filters?.filter((f) => f !== filter) || null)
                    }}
                    key={filter}
                    className='pl-3 pr-2 py-1.5 h-fit flex justify-center items-center bg-[#E0F2E6] text-[#028261] font-medium hover:opacity-70 active:scale-95 transition-all cursor-pointer'
                  >
                    {filter}
                    <button className='ml-2.5 font-black'>×</button>
                  </div>
                ))
              ) : (
                <span className='text-base font-medium w-full h-fit px-2 py-1.5'>선택된 필터가 없습니다.</span>
              )}
            </div>
            <button
              onClick={() => setCurrentFilter(null)}
              className='w-full h-12 bg-[#3EBA72] text-white font-semibold px-3 py-2 hover:opacity-80 active:scale-95 transition-all cursor-pointer'
            >
              모든 필터 초기화
            </button>
          </div>
          {/* scrollable area */}
          <div className='w-full flex-1 flex flex-col px-2 gap-2 overflow-y-auto no-scroll-bar'>
            <FilterBox
              title='주요 탐색'
              filters={[
                { label: '국가보호종', options: ['멸종위기 야생동물', '천연기념물', '해양보호생물'] },
                {
                  label: '생물학적 분류 (계, 문, 강, 목, 과, 속 중 강 항목으로 분류)',
                  options: ['포유류', '조류', '곤충류'],
                },
                { label: '표본 수집 위치 (30종 모델의 지역으로 필터)', options: ['서울특별시', '경기도', '강원도'] },
                { label: '표본 제작자', options: ['1', '2', '3'] },
              ]}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
            />
            <FilterBox
              title='보조 탐색'
              filters={[
                { label: '표본 제작 기간 (표본 제작 일자)', options: ['1', '2', '3'] },
                { label: '표본 수집 기간 (폐사 일자)', options: ['1', '2', '3'] },
              ]}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
            />
            <FilterBox
              title='주요 탐색'
              filters={[
                { label: '생물학적 분류', options: ['포유류', '조류', '곤충류'] },
                { label: '표본 수집 위치', options: ['서울특별시', '경기도', '강원도'] },
              ]}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
            />
          </div>
        </section>
        {/* 맵 - 오른쪽 전체 */}
        <section className='col-start-2 row-span-2 flex'>
          <Map defaultCenter={null} defaultZoom={15}>
            <LiveLocationLayer />
          </Map>
        </section>
      </div>
      {/* copyright */}
      <div className='h-7 w-full text-black px-2.5 pb-2 flex flex-row items-center justify-between gap-2'>
        <span className='w-fit h-fit text-sm font-medium'>
          © {new Date().getFullYear()} NHIV. All rights reserved.
        </span>
        <span className='w-fit h-fit text-sm font-medium'>한국전통대학교 디지털헤리티지학과 HiLAB</span>
      </div>
    </div>
  )
}

const FilterBox = ({
  title,
  filters,
  currentFilter,
  setCurrentFilter,
}: {
  title: string
  filters: {
    label: string
    options: string[]
  }[]
  currentFilter: string[] | null
  setCurrentFilter: React.Dispatch<React.SetStateAction<string[] | null>>
}) => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <motion.div className='w-full h-fit flex flex-col gap-5 p-2 bg-white'>
      <div
        onClick={() => setIsOpen((open) => !open)}
        className='text-lg font-semibold flex flex-row items-center gap-1 cursor-pointer hover:opacity-80 transition-all'
      >
        {isOpen ? <GrFormUp /> : <GrFormDown />}
        {title}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div className='w-full h-fit flex flex-col gap-6'>
            {filters.map((filter) => (
              <motion.div key={filter.label} className='w-full h-fit flex flex-col gap-1'>
                <span className='px-2 text-base font-medium'>{filter.label}</span>
                <div className='w-full h-fit flex flex-col bg-white'>
                  {filter.options.map((option, idx) => (
                    <div
                      key={option}
                      onClick={() => {
                        if (currentFilter?.includes(option)) {
                          setCurrentFilter((filters) => filters?.filter((f) => f !== option) || null)
                        } else {
                          setCurrentFilter((filters) => (filters ? [...filters, option] : [option]))
                        }
                      }}
                      className={classNames(
                        'w-full h-fit flex flex-row gap-2 justify-start items-center px-2 py-2 border-[#E0F2E6] cursor-pointer hover:bg-[#F5FDF8] transition-all',
                        idx < filter.options.length - 1 ? 'border-b' : '',
                      )}
                    >
                      {/* select checkbox */}
                      {currentFilter?.includes(option) ? (
                        <GrCheckboxSelected className='' />
                      ) : (
                        <GrCheckbox className='' />
                      )}
                      <span className='text-base font-normal'>{option}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
