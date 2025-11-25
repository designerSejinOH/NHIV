'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { GrFormUp, GrFormDown, GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { useState } from 'react'
import classNames from 'classnames'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface FilterBoxProps {
  title: string
  filters: {
    type: 'checkbox' | 'range'
    key: string
    label: string
    options: string[] // range면 ['1950', '2025']처럼 [min, max]
  }[]
  currentFilter: string[] | null
  setCurrentFilter: React.Dispatch<React.SetStateAction<string[] | null>>
  className?: string
}

export const FilterBox = ({ title, filters, currentFilter, setCurrentFilter, className }: FilterBoxProps) => {
  const [isOpen, setIsOpen] = useState(true)

  // 현재 currentFilter에서 해당 range(label)의 값을 파싱해서 [from, to]로 가져오기
  const getRangeFromCurrentFilter = (label: string, min: number, max: number): [number, number] => {
    const prefix = `${label}:`
    const tag = currentFilter?.find((f) => f.startsWith(prefix))

    if (!tag) return [min, max]

    // 예: "표본 제작 기간: 1960–1990"
    const match = tag.match(/: (\d+)[^\d]+(\d+)/)
    if (!match) return [min, max]

    const from = Number(match[1])
    const to = Number(match[2])
    if (Number.isNaN(from) || Number.isNaN(to)) return [min, max]

    return [from, to]
  }

  // range 슬라이더가 바뀔 때 currentFilter에 `"label: from–to"` 문자열로 넣기
  const updateRangeFilterTag = (label: string, from: number, to: number) => {
    const prefix = `${label}:`
    setCurrentFilter((prev) => {
      let next = prev ? [...prev] : []

      // 같은 label의 기존 태그 제거
      next = next.filter((f) => !f.startsWith(prefix))

      // 기본 범위 그대로면(예: 1950–2025) 태그를 안 넣고 싶다면 여기서 조건 걸어도 됨
      next.push(`${prefix} ${from}–${to}`)

      return next
    })
  }

  return (
    <motion.div className={classNames('w-full h-fit flex flex-col gap-5 p-2 bg-white rounded-lg', className)}>
      <div
        onClick={() => setIsOpen((open) => !open)}
        className='text-base font-semibold flex flex-row items-center gap-1 cursor-pointer hover:opacity-70 transition-all'
      >
        {isOpen ? <GrFormUp /> : <GrFormDown />}
        {title}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div className='w-full h-fit flex flex-col gap-6 pb-6'>
            {filters.map((filter) => {
              // range 타입인 경우 min, max 계산
              let min = 0
              let max = 0
              if (filter.type === 'range') {
                min = Number(filter.options[0])
                max = Number(filter.options[filter.options.length - 1])
              }

              const currentRange = filter.type === 'range' ? getRangeFromCurrentFilter(filter.label, min, max) : null

              return (
                <motion.div key={filter.key} className='w-full h-fit flex flex-col gap-1'>
                  <span className='px-2 text-base font-medium'>{filter.label}</span>

                  {/* 체크박스 필터 */}
                  {filter.type === 'checkbox' && (
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
                          {currentFilter?.includes(option) ? <GrCheckboxSelected /> : <GrCheckbox />}
                          <span className='text-base font-normal'>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* range 필터 (년도를 양쪽에서 조절) */}
                  {filter.type === 'range' && currentRange && (
                    <div className='w-full h-fit flex flex-col gap-2 px-2 py-2'>
                      <div className='flex flex-row justify-between text-xs text-gray-600'>
                        <span className='font-medium'>{currentRange[0]}년</span>
                        <span className='font-medium'>{currentRange[1]}년</span>
                      </div>
                      <RangeSlider
                        min={min}
                        max={max}
                        value={currentRange}
                        onChange={([from, to]) => updateRangeFilterTag(filter.label, from, to)}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const RangeSlider = ({
  min,
  max,
  value,
  onChange,
  step = 1,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (val: [number, number]) => void
  step?: number
}) => {
  const [minVal, maxVal] = value

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value)
    // 오른쪽 핸들을 넘지 않도록
    const clamped = Math.min(newVal, maxVal - step)
    onChange([clamped, maxVal])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value)
    // 왼쪽 핸들을 넘지 않도록
    const clamped = Math.max(newVal, minVal + step)
    onChange([minVal, clamped])
  }

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  const minPercent = getPercent(minVal)
  const maxPercent = getPercent(maxVal)

  return (
    <div className='w-full relative h-8'>
      {/* 전체 레일 */}
      <div className='absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-[#D1E8DD]' />

      {/* 선택 구간 하이라이트 */}
      <div
        className='absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-[#028261]'
        style={{
          left: `${minPercent}%`,
          right: `${100 - maxPercent}%`,
        }}
      />

      {/* 왼쪽 핸들 */}
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className='pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent cursor-grab active:cursor-grabbing
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-[#028261]
          [&::-webkit-slider-thumb]:shadow
          [&::-moz-range-thumb]:pointer-events:auto
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-[#028261]
          [&::-moz-range-thumb]:shadow
        '
      />

      {/* 오른쪽 핸들 */}
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className='pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent cursor-grab active:cursor-grabbing
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-[#028261]
          [&::-webkit-slider-thumb]:shadow
          [&::-moz-range-thumb]:pointer-events:auto
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-[#028261]
          [&::-moz-range-thumb]:shadow
        '
      />
    </div>
  )
}
