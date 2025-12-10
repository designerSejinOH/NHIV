'use client'

import { useEffect, useRef, useState } from 'react'
import { FilterBox } from './Filterbox'
import classNames from 'classnames'
import { MdFilterVintage } from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'
import type { FilterOptions } from '@/lib/filterUtils'

interface FilterSectionProps {
  currentFilter: string[] | null
  setCurrentFilter: React.Dispatch<React.SetStateAction<string[] | null>>
  filterOptions: FilterOptions | null
  className?: string
}

export const FilterSection = ({ currentFilter, setCurrentFilter, filterOptions, className }: FilterSectionProps) => {
  const selectedRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [atTop, setAtTop] = useState(true)

  // currentFilter 개수가 변할 때마다 → 자동으로 맨 아래로 스크롤 + overflow 여부 체크
  useEffect(() => {
    const el = selectedRef.current
    if (!el) return

    const isOverflow = el.scrollHeight > el.clientHeight + 1
    setHasOverflow(isOverflow)

    if (isOverflow) {
      // 맨 아래로 스크롤
      el.scrollTop = el.scrollHeight
      setAtTop(false)
    } else {
      el.scrollTop = 0
      setAtTop(true)
    }
  }, [currentFilter?.length])

  const handleSelectedScroll = () => {
    const el = selectedRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el

    const top = scrollTop <= 1
    setAtTop(top)

    const overflow = scrollHeight > clientHeight + 1
    setHasOverflow(overflow)
  }

  // 필터 옵션이 로드되지 않은 경우
  if (!filterOptions) {
    return (
      <section
        className={classNames(
          'bg-[#E0F2E6] text-[#028261] flex flex-col gap-2 pb-2 px-2 justify-center items-center min-h-0',
          className,
        )}
      >
        <div className='text-base'>필터 옵션을 로딩 중...</div>
      </section>
    )
  }

  return (
    <section
      className={classNames(
        'bg-[#E0F2E6] text-[#028261] flex flex-col gap-2 pb-2 px-2 justify-start items-center min-h-0',
        className,
      )}
    >
      <div className='w-full h-fit flex flex-col rounded-b-lg gap-2 pt-2'>
        <span className='text-lg font-semibold flex flex-row items-center gap-1'>
          <MdFilterVintage />
          자연유산 필터 탐색
        </span>
      </div>

      <div className='w-full h-fit flex flex-col gap-2'>
        <div className='w-full h-fit flex flex-row justify-between items-center gap-2'>
          <span className='text-base font-semibold '>현재 선택된 필터</span>
          <button
            onClick={() => setCurrentFilter(null)}
            className='w-fit h-fit text-sm leading-none flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-semibold hover:bg-white  active:translate-y-0.5 transition-all cursor-pointer'
          >
            <RiDeleteBinLine />
            모든 필터 초기화
          </button>
        </div>

        {/* 현재 선택된 필터 + 오버레이 래퍼 */}
        <div className='w-full relative'>
          <div
            ref={selectedRef}
            onScroll={handleSelectedScroll}
            className='w-full overflow-y-scroll snap-x scroll-pl-2 scoll-pr-2 h-20 rounded-lg bg-white flex flex-row flex-wrap gap-2 p-2 justify-start items-start'
          >
            {currentFilter && currentFilter.length > 0 ? (
              currentFilter.map((filter) => (
                <div
                  key={filter}
                  className='snap-start text-sm pl-2 pr-1 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.2)] rounded-lg w-fit flex-shrink-0 h-fit flex justify-center items-center bg-white text-[#028261] font-medium'
                >
                  {filter}
                  <div
                    onClick={() => {
                      setCurrentFilter((filters) => filters?.filter((f) => f !== filter) || null)
                    }}
                    className='ml-2.5 font-semibold hover:opacity-70 active:scale-95 transition-all cursor-pointer'
                  >
                    ×
                  </div>
                </div>
              ))
            ) : (
              <span className='text-sm font-medium w-full px-1 h-fit flex flex-col justify-center items-start'>
                아직 선택된 필터가 없습니다.
              </span>
            )}
          </div>

          {/* 스크롤 힌트용 그라디언트 오버레이 */}
          {hasOverflow && (
            <>
              {/* 위쪽에 더 있을 때 → 위 오버레이 */}
              {!atTop && (
                <div
                  className={classNames(
                    'pointer-events-none absolute left-0 right-0 top-0 h-8 z-10',
                    'bg-gradient-to-b from-white/70 via-white/50 to-transparent',
                    'rounded-t-lg',
                  )}
                />
              )}
              {/* 맨 위에 있을 때 → 아래에 더 있다는 힌트 */}
              {atTop && (
                <div
                  className={classNames(
                    'pointer-events-none absolute left-0 right-0 bottom-0 h-8 z-10',
                    'bg-gradient-to-t from-white/70 via-white/50 to-transparent',
                    'rounded-b-lg',
                  )}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* scrollable area - 실제 데이터 기반 필터 */}
      <div className='w-full flex-1 flex flex-col gap-2 overflow-y-auto snap-y no-scroll-bar rounded-lg'>
        <FilterBox
          title='주요 탐색'
          filters={[
            // 국가보호종 - 데이터에서 추출
            ...(filterOptions.protectionTypes.length > 0
              ? [
                  {
                    type: 'checkbox' as const,
                    key: 'national_protection_status',
                    label: '국가보호종',
                    options: filterOptions.protectionTypes,
                  },
                ]
              : []),
            // 생물학적 분류 - 데이터에서 추출
            ...(filterOptions.classifications.length > 0
              ? [
                  {
                    type: 'checkbox' as const,
                    key: 'class_name',
                    label: '생물학적 분류',
                    options: filterOptions.classifications,
                  },
                ]
              : []),
            // 소장처 - 데이터에서 추출
            ...(filterOptions.collections.length > 0
              ? [
                  {
                    type: 'checkbox' as const,
                    key: 'specimen_location',
                    label: '소장처',
                    options: filterOptions.collections,
                  },
                ]
              : []),
            // 표본 제작자 - 데이터에서 추출
            ...(filterOptions.makers.length > 0
              ? [
                  {
                    type: 'checkbox' as const,
                    key: 'specimen_made_by',
                    label: '표본 제작자',
                    options: filterOptions.makers,
                  },
                ]
              : []),
          ]}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
        <FilterBox
          title='보조 탐색'
          filters={[
            {
              type: 'range' as const,
              key: 'specimen_made_date',
              label: '표본 제작 기간',
              options: [filterOptions.madeYearRange[0].toString(), filterOptions.madeYearRange[1].toString()],
            },
            {
              type: 'range' as const,
              key: 'death_date',
              label: '표본 수집 기간',
              options: [filterOptions.deathYearRange[0].toString(), filterOptions.deathYearRange[1].toString()],
            },
          ]}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
      </div>
    </section>
  )
}
