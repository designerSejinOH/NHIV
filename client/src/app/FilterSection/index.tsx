'use client'

import { useEffect, useRef, useState } from 'react'
import { FilterBox } from './Filterbox'
import classNames from 'classnames'
import { MdFilterVintage } from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'

interface FilterSectionProps {
  currentFilter: string[] | null
  setCurrentFilter: React.Dispatch<React.SetStateAction<string[] | null>>
  className?: string
}

export const FilterSection = ({ currentFilter, setCurrentFilter, className }: FilterSectionProps) => {
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
            className='w-fit h-fit text-sm leading-none flex flex-row items-center gap-1 px-1 font-semibold hover:opacity-80 active:translate-y-0.5 transition-all cursor-pointer'
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
                  className='snap-start text-sm pl-2 pr-1 py-1 shadow rounded-lg w-fit flex-shrink-0 h-fit flex justify-center items-center bg-white text-[#028261] font-medium'
                >
                  {filter}
                  <div
                    onClick={() => {
                      setCurrentFilter((filters) => filters?.filter((f) => f !== filter) || null)
                    }}
                    className='ml-2.5 font-semibold hover:opacity-70 active:shadow-none active:translate-y-0.5 transition-all cursor-pointer'
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

      {/* scrollable area */}
      <div className='w-full flex-1 flex flex-col gap-2 overflow-y-auto snap-y no-scroll-bar rounded-lg'>
        <FilterBox
          className='pb-10'
          title='주요 탐색'
          filters={[
            {
              type: 'checkbox',
              key: 'national_protection_status',
              label: '국가보호종',
              options: ['멸종위기 야생생물', '멸종위기 야생생물 2급', '천연기념물', '해양보호생물'],
            },
            {
              type: 'checkbox',
              key: 'class_name',
              label: '생물학적 분류',
              options: ['포유류 (포유동물강, Mammalia)', '조류 (조강, Aves)', '곤충류 (곤충강, Insecta)'],
            },
            {
              type: 'checkbox',
              key: 'specimen_location',
              label: '표본 수집 위치',
              options: ['서울특별시', '경기도', '강원도'],
            },
            {
              type: 'checkbox',
              key: 'specimen_made_by',
              label: '표본 제작자',
              options: [
                '국가유산수리기능자 제2456호 오동세',
                '국가유산수리기능자 제2460호 원효식',
                '국가유산수리기능자 제7937호 오정우',
                'DASHBAT Tuvdendorj',
              ],
            },
          ]}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
        <FilterBox
          className='pb-10'
          title='보조 탐색'
          filters={[
            {
              type: 'range',
              key: 'specimen_made_date',
              label: '표본 제작 기간',
              options: ['1950', '2025'], // min, max
            },
            {
              type: 'range',
              key: 'death_date',
              label: '표본 수집 기간',
              options: ['1950', '2025'],
            },
          ]}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
      </div>
    </section>
  )
}
