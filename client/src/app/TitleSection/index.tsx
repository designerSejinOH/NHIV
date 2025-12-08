'use client'

import { useState } from 'react'
import classNames from 'classnames'

export const TitleSection = ({ className }: { className?: string }) => {
  return (
    <section
      className={classNames(
        'rounded-lg flex flex-col items-start bg-[#028261] text-white justify-start p-3 gap-2 md:gap-3 lg:gap-3.5 xl:gap-4',
        className,
      )}
    >
      {/* 타이틀/설명 등 */}
      <span className='text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold leading-none'>NHIV</span>
      <span className='text-sm md:text-base font-normal leading-tight'>
        Natural Heritage map-based Information Visualization
      </span>
      <span className='text-lg md:text-xl font-medium leading-tight'>자연유산DB 지도기반 시각화</span>
    </section>
  )
}
