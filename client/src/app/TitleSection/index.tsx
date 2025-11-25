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
      <h1 className='text-base md:text-lg lg:text-lg xl:text-xl font-bold leading-tight'>
        자연유산 DB
        <br />
        지도기반시각화
      </h1>

      <h3 className='text-base font-normal leading-tight'>
        디지털 박물관 서비스를 위한 AI 기반 <br />
        네이처 복원 기술 개발
      </h3>
    </section>
  )
}
