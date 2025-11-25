'use client'

import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { ModelView } from './ModelView'
import { useEffect, useState } from 'react'
import { Specimen } from '@/types'

interface HeritageModalProps {
  specimens: Specimen[]
  selectedSpeciemen: {
    isSelected: boolean
    data: Specimen
  } | null
  setSelectedSpeciemen: (value: any) => void
}

export const HeritageModal = ({ specimens, selectedSpeciemen, setSelectedSpeciemen }: HeritageModalProps) => {
  const [currentSpecimen, setCurrentSpecimen] = useState<Specimen | null>(selectedSpeciemen?.data || null)

  useEffect(() => {
    setCurrentSpecimen(selectedSpeciemen?.data || null)
  }, [selectedSpeciemen])

  if (!selectedSpeciemen || !currentSpecimen) return null

  // name_sci가 같은 표본들 → currentSpecimen 기준으로 잡는 게 자연스러움
  const sameSciSpecimens = specimens?.filter((specimen) => specimen.name_sci === currentSpecimen.name_sci) || [
    currentSpecimen,
  ]

  console.log('현재 모델 URL:', currentSpecimen.specimen_id, currentSpecimen.model_url)

  return (
    <>
      <AnimatePresence mode='wait'>
        {selectedSpeciemen.isSelected && (
          <motion.div
            key='heritage-modal' // 모달 전체에 key 추가
            className='absolute inset-0 bg-black/50 flex flex-col items-end justify-start z-50 p-10'
            initial={{
              opacity: 0,
            }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }} // duration 줄이기
            onClick={
              () => setSelectedSpeciemen(null) // 배경 클릭 시 닫기
            }
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.15 }} // duration 줄이기
              onClick={(e) => e.stopPropagation()} // 내용 클릭 시 이벤트 버블링 방지
              className={classNames(
                'w-4/5 relative h-full bg-white text-[#028261] p-2',
                'grid grid-cols-[3fr_2fr] gap-2',
                'min-h-0',
              )}
            >
              {/* 왼쪽 컬럼 */}
              <div className='col-start-1 flex flex-col gap-2 min-h-0'>
                {/* 3D: 아래, 남은 공간 꽉 채우기 */}
                <div className='bg-[#F6FFFA] flex-1 min-h-0 relative'>
                  <div className='absolute inset-0'>
                    <ModelView
                      key={`${currentSpecimen.no}-${currentSpecimen.model_url}`}
                      sceneKey={`${currentSpecimen.no}-${currentSpecimen.model_url}`}
                      modelUrl={currentSpecimen.model_url}
                    />
                  </div>
                </div>
                {/* 동일 학명 표본 선택 버튼들 */}
                <div className='bg-[#028261] text-white p-2 flex flex-row gap-2'>
                  {sameSciSpecimens.map((item) => (
                    <button
                      key={item.specimen_id}
                      onClick={() => setCurrentSpecimen(item)}
                      className={classNames(
                        'w-fit px-4 h-10 flex justify-center items-center font-medium hover:opacity-80 active:scale-95 transition-all cursor-pointer',
                        item.specimen_id === currentSpecimen.specimen_id
                          ? 'bg-white text-[#028261]'
                          : 'bg-[#02674C] text-white',
                      )}
                    >
                      {item.specimen_id}
                    </button>
                  ))}
                </div>
              </div>

              {/* 오른쪽 컬럼 */}
              <div className='col-start-2 flex flex-col gap-2 min-h-0'>
                <div className='bg-[#3EBA72] text-white h-fit p-2 flex flex-col gap-2 relative'>
                  <button
                    onClick={() => setSelectedSpeciemen(null)}
                    className='absolute top-0 right-0 p-2 text-white flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={2}
                      stroke='currentColor'
                      className='w-8 h-8'
                    >
                      <path d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>

                  {/* 🔥 여기들도 currentSpecimen 기준으로 */}
                  <span className='text-2xl font-bold'>{currentSpecimen.name_kr}</span>
                  <span className='text-base font-medium'>{currentSpecimen.name_en}</span>
                </div>

                <div className='bg-[#E0F2E6] text-[#028261] flex-1 min-h-0 overflow-y-auto p-2'>
                  {currentSpecimen.specimen_id}

                  {/* 추가 정보들 */}
                  <div className='mt-4 flex flex-col gap-2'>
                    <span className='font-medium'>표본정보 (성별/성장단계): </span>
                    <span>{currentSpecimen.sex_growth || '정보 없음'}</span>

                    <span className='font-medium mt-2'>크기(단위): </span>
                    <span>{currentSpecimen.size || '정보 없음'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
