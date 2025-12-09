'use client'

import { Suspense, useEffect, useState } from 'react'
import { Map, Copyright } from '@/components'
import classNames from 'classnames'
import { TitleSection } from './TitleSection'
import { FilterSection } from './FilterSection'
import { Intro } from './Intro'
import { MapSection } from './MapSection'
import { supabase } from '@/lib/supabase'
import type { SpecimenWithRelations } from '@/types/database'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const [specimens, setSpecimens] = useState<SpecimenWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [hideTab, setHideTab] = useState(false)
  const [isPageInfo, setIsPageInfo] = useState(true)
  const [selectedHeritage, setSelectedHeritage] = useState<{
    isSelected: boolean
    data: any
  } | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string[] | null>(null)

  useEffect(() => {
    fetchSpecimens()
  }, [])

  const fetchSpecimens = async () => {
    try {
      const { data: specimens, error } = await supabase
        .from('specimens')
        .select(
          `
        *,
        species (
          name_kr,
          name_en,
          name_sci,
          classifications (
            name,
            name_en
          )
        ),
        collections (
          institution_name,
          address,
          latitude,
          longitude
        ),
        iucn_statuses (
          code,
          name_kr,
          name_en
        )
      `,
        )
        .order('no', { ascending: false })

      if (error) throw error

      // 보호종 이름 추가
      const specimensWithProtection = await Promise.all(
        (specimens || []).map(async (specimen) => {
          // classifications를 최상위로 올림
          const flattenedSpecimen = {
            ...specimen,
            classifications: specimen.species?.classifications || null,
          }

          if (specimen.protection_type_ids && specimen.protection_type_ids.length > 0) {
            const { data: protectionTypes } = await supabase
              .from('protection_types')
              .select('name')
              .in('id', specimen.protection_type_ids)

            return {
              ...flattenedSpecimen,
              protection_types: protectionTypes?.map((p) => p.name) || [],
            }
          }
          return { ...flattenedSpecimen, protection_types: [] }
        }),
      )

      setSpecimens(specimensWithProtection)
    } catch (error) {
      console.error('Error fetching specimens:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-gray-600'>로딩중...</div>
      </div>
    )
  }

  return (
    <>
      {isPageInfo && <Intro isPageInfo={isPageInfo} setIsPageInfo={setIsPageInfo} />}
      <div className='w-full h-dvh flex flex-col gap-0 break-keep overflow-hidden'>
        <div className={classNames('flex-1 w-full h-full flex flex-row p-2 overflow-hidden')}>
          <div className={classNames('h-full relative')}>
            <motion.div
              initial={{ width: hideTab ? '0' : '25vw', paddingRight: '0.5rem' }}
              animate={{
                width: hideTab ? '0' : '25vw',
                paddingRight: hideTab ? '0rem' : '0.5rem',
              }}
              transition={{ duration: 0.3 }}
              className={classNames('h-full flex flex-col gap-2')}
            >
              {/* 페이지 타이틀 영역 - 좌상단 */}
              <TitleSection className='w-full h-fit flex-shrink-0 shadow-md rounded-lg overflow-hidden' />
              {/* 필터/3D 영역 - 좌하단 */}
              <FilterSection
                className='w-full h-full rounded-lg shadow-md overflow-hidden'
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
              />
            </motion.div>

            <button
              style={{
                boxShadow: '4px 0 6px 0 rgba(0,0,0,0.1)',
              }}
              className='absolute -right-11 w-12 h-12 rounded-r-xl bg-white text-[#028261] top-1/2 -translate-y-1/2 flex items-center justify-center z-20 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all'
              onClick={() => setHideTab(!hideTab)}
            >
              <motion.svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
                className={classNames('w-6 h-6')}
                initial={{ rotate: !hideTab ? 180 : 0 }}
                animate={{ rotate: !hideTab ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
              </motion.svg>
            </button>
          </div>
          {/* 맵 - 오른쪽 전체 */}
          <MapSection
            className='w-full flex rounded-lg shadow-md overflow-hidden'
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
