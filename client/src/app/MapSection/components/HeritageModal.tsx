'use client'

import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { ModelView } from './ModelView'
import { useEffect, useState } from 'react'
import { GoCheckCircleFill } from 'react-icons/go'
import { AiFillAlert } from 'react-icons/ai'
import { FaShieldAlt } from 'react-icons/fa'

// 확장된 Specimen 타입 (조인된 데이터 포함)
interface SpecimenWithRelations {
  no: number
  specimen_id: string
  sex_growth: string | null
  size: string | null
  model_url: string | null
  death_location_text: string | null
  death_date: string | null
  made_date: string | null
  made_by: string | null
  lifespan: string | null
  diets: string | null
  predators: string | null
  habitats: string | null
  distribution_regions: string | null
  species?: {
    name_kr: string
    name_en: string | null
    name_sci: string | null
  }
  classifications?: {
    name: string
  }
  collections?: {
    institution_name: string
  }
  iucn_statuses?: {
    code: string
    name_kr: string
    name_en: string
  }
  protection_type_ids: number[] | null
  // 보호종 이름 배열 (별도 조회 필요)
  protection_types?: string[]
}

interface HeritageModalProps {
  specimens: SpecimenWithRelations[]
  selectedSpeciemen: {
    isSelected: boolean
    data: SpecimenWithRelations
  } | null
  setSelectedSpeciemen: (value: any) => void
}

export const HeritageModal = ({ specimens, selectedSpeciemen, setSelectedSpeciemen }: HeritageModalProps) => {
  const [currentSpecimen, setCurrentSpecimen] = useState<SpecimenWithRelations | null>(selectedSpeciemen?.data || null)

  useEffect(() => {
    setCurrentSpecimen(selectedSpeciemen?.data || null)
  }, [selectedSpeciemen])

  if (!selectedSpeciemen || !currentSpecimen) return null

  // 같은 학명(생물종)을 가진 표본들 필터링
  const sameSciSpecimens = specimens?.filter(
    (specimen) => specimen.species?.name_sci === currentSpecimen.species?.name_sci && specimen.species?.name_sci, // null이 아닌 경우만
  ) || [currentSpecimen]

  const toKoreanDate = (dateStr: string | null): string => {
    if (!dateStr) return ''

    // YYYY-MM-DD 형태
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number)
      return `${y}년 ${m}월 ${d}일`
    }

    // YYYY-MM 형태
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [y, m] = dateStr.split('-').map(Number)
      return `${y}년 ${m}월`
    }

    return dateStr
  }

  return (
    <>
      <AnimatePresence mode='wait'>
        {selectedSpeciemen.isSelected && (
          <motion.div
            key='heritage-modal'
            className='absolute inset-0 bg-black/50 flex flex-col items-end justify-start z-50 p-10'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            onClick={() => setSelectedSpeciemen(null)}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={classNames(
                'w-4/5 relative h-full bg-gray-100 text-[#028261] p-2',
                'rounded-lg shadow-2xl',
                'grid grid-cols-[3fr_2fr] gap-2',
                'min-h-0',
              )}
            >
              {/* 왼쪽 컬럼 */}
              <div className='col-start-1 flex flex-col gap-2 min-h-0'>
                {/* 3D 모델 뷰 */}
                <div className='bg-[#F6FFFA] rounded-lg overflow-hidden flex-1 min-h-0 relative'>
                  <div className='absolute inset-0'>
                    <ModelView
                      key={`${currentSpecimen.no}-${currentSpecimen.model_url}`}
                      sceneKey={`${currentSpecimen.no}-${currentSpecimen.model_url}`}
                      modelUrl={currentSpecimen.model_url || ''}
                    />
                  </div>
                </div>
                {/* 동일 생물종 표본 선택 버튼들 */}
                <div className='flex flex-row gap-2 overflow-x-auto'>
                  {sameSciSpecimens.map((item) => (
                    <button
                      key={item.specimen_id}
                      onClick={() => setCurrentSpecimen(item)}
                      className={classNames(
                        'w-fit relative h-fit p-3 rounded-lg overflow-hidden flex flex-row justify-center gap-4 items-start font-medium transition-all flex-shrink-0',
                        item.specimen_id === currentSpecimen.specimen_id
                          ? 'bg-[#028261] border-[#028261] text-white pointer-events-none cursor-not-allowed'
                          : 'bg-white border-[#028261] text-[#028261] shadow-[0_2px_4px_rgba(0,0,0,0.2)] pointer-events-auto hover:bg-[#028261] hover:text-white active:scale-95 cursor-pointer',
                      )}
                    >
                      <div className='w-fit h-fit flex flex-col gap-4 pr-8 justify-center items-start'>
                        <span className='text-lg leading-none font-semibold'>{item.sex_growth || '정보없음'}</span>
                        <span className='text-base font-mono leading-none font-normal'>{item.specimen_id}</span>
                      </div>
                      <GoCheckCircleFill
                        className={classNames(
                          'text-lg absolute top-2 right-2',
                          item.specimen_id === currentSpecimen.specimen_id ? 'opacity-100' : 'opacity-10',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 오른쪽 컬럼 */}
              <div className='col-start-2 flex flex-col min-h-0'>
                {/* 헤더 (고정) */}
                <div className='bg-[#028261] rounded-lg overflow-hidden text-white h-fit p-2 flex flex-col gap-2 relative flex-shrink-0'>
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

                  <span className='text-2xl font-bold'>{currentSpecimen.species?.name_kr || '생물종 정보 없음'}</span>
                  <span className='text-base font-medium italic'>{currentSpecimen.species?.name_en || ''}</span>
                </div>

                {/* 헤더 밑부터 스크롤 영역 */}
                <div className='flex flex-col gap-2 overflow-y-auto min-h-0 mt-2'>
                  {/* 국가보호 표시 */}
                  <div className='flex flex-col gap-2 flex-shrink-0'>
                    {currentSpecimen.iucn_statuses && (
                      <div className='w-full bg-white rounded-lg h-fit flex flex-row p-2 gap-2 items-start'>
                        <div className='w-full flex flex-col gap-2'>
                          <span className='text-base font-medium leading-none text-gray-700'>
                            <AiFillAlert className='inline mr-1 mb-1 text-red-500' />
                            IUCN 적색목록
                          </span>
                          <IUCNStatusBadge
                            code={currentSpecimen.iucn_statuses.code}
                            nameKr={currentSpecimen.iucn_statuses.name_kr}
                            nameEn={currentSpecimen.iucn_statuses.name_en}
                          />
                        </div>
                      </div>
                    )}

                    {currentSpecimen.protection_types && currentSpecimen.protection_types.length > 0 && (
                      <div className='w-full bg-white rounded-lg h-fit flex flex-row p-2 gap-2 items-start'>
                        <div className='w-full flex flex-col gap-2'>
                          <span className='text-base font-medium leading-none text-gray-700'>
                            <FaShieldAlt className='inline mr-1 mb-1 text-blue-500' />
                            국가보호종
                          </span>

                          {currentSpecimen.protection_types.map((status) => (
                            <NationalProtectionStatusBadge key={status} status={status} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 상세정보 박스 */}
                  <div className='bg-white rounded-lg text-black px-3 py-2'>
                    <div className='text-lg mb-4 font-semibold'>생물 정보</div>

                    <InfoRow label='국명' value={currentSpecimen.species?.name_kr} />
                    <InfoRow label='영명' value={currentSpecimen.species?.name_en} />
                    <InfoRow label='학명' value={currentSpecimen.species?.name_sci} />
                    <InfoRow label='분류' value={currentSpecimen.classifications?.name} />
                    <InfoRow label='수명' value={currentSpecimen.lifespan} />
                    <InfoRow label='식성' value={currentSpecimen.diets} />
                    <InfoRow label='천적' value={currentSpecimen.predators} />
                    <InfoRow label='서식지' value={currentSpecimen.habitats} />
                    <InfoRow label='분포지' value={currentSpecimen.distribution_regions} />

                    <div className='text-lg mt-8 mb-4 font-semibold'>표본 정보</div>

                    <InfoRow label='표본 ID' value={currentSpecimen.specimen_id} />
                    <InfoRow label='소장처' value={currentSpecimen.collections?.institution_name} />
                    <InfoRow label='폐사 장소' value={currentSpecimen.death_location_text} />
                    <InfoRow label='폐사 일자' value={toKoreanDate(currentSpecimen.death_date)} />
                    <InfoRow label='표본 제작 일자' value={toKoreanDate(currentSpecimen.made_date)} />
                    <InfoRow label='표본 제작자' value={currentSpecimen.made_by} />
                    <InfoRow label='성별/성장단계' value={currentSpecimen.sex_growth} />
                    <InfoRow label='크기' value={currentSpecimen.size} />
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

const IUCNStatusBadge = ({ code, nameKr, nameEn }: { code: string; nameKr: string; nameEn: string }) => {
  let bgColor = 'bg-gray-400'
  let textColor = 'text-white'
  let bgtextColor = 'text-gray-400'

  switch (code) {
    case 'EX':
      bgColor = 'bg-[#000000]'
      bgtextColor = 'text-[#000000]'
      textColor = 'text-white'
      break
    case 'EW':
      bgColor = 'bg-[#8530B7]'
      bgtextColor = 'text-[#8530B7]'
      textColor = 'text-white'
      break
    case 'CR':
      bgColor = 'bg-[#DB0303]'
      bgtextColor = 'text-[#DB0303]'
      textColor = 'text-white'
      break
    case 'EN':
      bgColor = 'bg-[#F76E08]'
      bgtextColor = 'text-[#F76E08]'
      textColor = 'text-white'
      break
    case 'VU':
      bgColor = 'bg-[#FFD112]'
      bgtextColor = 'text-[#FFD112]'
      textColor = 'text-white'
      break
    case 'NT':
      bgColor = 'bg-[#A3C644]'
      bgtextColor = 'text-[#A3C644]'
      textColor = 'text-white'
      break
    case 'LC':
      bgColor = 'bg-[#3E8733]'
      bgtextColor = 'text-[#3E8733]'
      textColor = 'text-white'
      break
    case 'DD':
      bgColor = 'bg-[#7A7A7A]'
      bgtextColor = 'text-[#7A7A7A]'
      textColor = 'text-white'
      break
    case 'NE':
      bgColor = 'bg-[#E0E0E0]'
      bgtextColor = 'text-[#E0E0E0]'
      textColor = 'text-black'
      break
    default:
      bgColor = 'bg-gray-400'
      bgtextColor = 'text-gray-400'
      textColor = 'text-white'
      break
  }

  return (
    <div
      className={classNames(
        'w-full rounded-lg p-2 flex flex-row justify-start items-center gap-2 text-base font-semibold',
        bgColor,
        textColor,
      )}
    >
      <div
        className={classNames(
          'w-fit h-auto aspect-square text-lg flex justify-center items-center px-2 rounded-md',
          'bg-white',
          bgtextColor,
          'leading-none',
        )}
      >
        {code}
      </div>
      <div className='w-full flex flex-col justify-center items-start gap-1'>
        <span className={classNames('leading-none text-lg font-bold')}>{code}</span>
        <span className='leading-none font-medium'>
          {nameKr} ({nameEn})
        </span>
      </div>
    </div>
  )
}

const NationalProtectionStatusBadge = ({ status }: { status: string }) => {
  let infoText = ''
  let government = ''

  // 보호종 이름에서 등급/타입 파싱
  if (status.includes('멸종위기')) {
    infoText = '야생생물 보호 및 관리에 관한 법률'
    government = '환경부'
  } else if (status.includes('천연기념물')) {
    infoText = '문화재보호법'
    government = '문화재청'
  } else if (status.includes('해양보호생물')) {
    infoText = '해양 생태계의 보전 및 관리에 관한 법률'
    government = '해양수산부'
  } else if (status.includes('희귀식물') || status.includes('특산식물')) {
    infoText = '수목원, 정원의 조성 및 진흥에 관한 법률'
    government = '산림청'
  } else {
    infoText = status
    government = ''
  }

  return (
    <div
      className={classNames(
        'w-full h-fit p-2 flex flex-row justify-start items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.2)] bg-white text-black rounded-lg text-base font-medium',
      )}
    >
      <div className='w-12 h-auto text-xs break-all text-center aspect-square flex justify-center items-center bg-[#028261] text-white rounded-md'>
        {government}
      </div>
      <div>
        <div className='font-medium'>{status}</div>
        <div className='font-normal text-sm'>{infoText}</div>
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string | number | null | undefined
}

export const InfoRow = ({ label, value }: InfoRowProps) => {
  return (
    <div className='mb-2 w-full h-fit flex flex-row gap-2 px-1'>
      <span className='font-medium w-1/4 flex-shrink-0'>{label}</span>
      <span className='flex-1 break-words'>{value || '-'}</span>
    </div>
  )
}
