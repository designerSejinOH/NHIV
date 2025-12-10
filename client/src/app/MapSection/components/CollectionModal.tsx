'use client'

import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { CollectionGroup } from '../index'
import { CLASSIFICATION_COLORS } from '@/styles/colors'
import { extractClassificationKey } from '@/hooks/extractClassificationKey'

interface CollectionModalProps {
  selectedCollection: CollectionGroup | null
  setSelectedCollection: (collection: CollectionGroup | null) => void
  setSelectedHeritage: (heritage: { isSelected: boolean; data: any } | null) => void
}

export const CollectionModal = ({
  selectedCollection,
  setSelectedCollection,
  setSelectedHeritage,
}: CollectionModalProps) => {
  // 분류별 그룹핑
  const classificationGroups = useMemo(() => {
    if (!selectedCollection) return []

    const groups = new Map<string, typeof selectedCollection.specimens>()

    selectedCollection.specimens.forEach((specimen) => {
      const classificationName = specimen.species?.classifications?.name || '분류 정보 없음'
      const key = extractClassificationKey(classificationName)

      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(specimen)
    })

    return Array.from(groups.entries()).map(([name, specimens]) => ({
      name,
      name_en: specimens[0].species?.classifications?.name_en || '',
      specimens,
      count: specimens.length,
      color: CLASSIFICATION_COLORS[name] || CLASSIFICATION_COLORS['기타'],
    }))
  }, [selectedCollection])

  // 도넛 차트 데이터
  const chartData = useMemo(() => {
    return classificationGroups.map((group) => ({
      name: group.name,
      value: group.count,
      color: group.color,
    }))
  }, [classificationGroups])

  if (!selectedCollection) return null

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='collection-modal'
        className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.2 }}
        onClick={() => setSelectedCollection(null)}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className={classNames(
            'w-full lg:w-[85%] xl:w-[80%] 2xl:w-[70%] relative h-[80vh] bg-gray-100 text-black p-3',
            'rounded-2xl shadow-2xl',
            'flex flex-col gap-4',
          )}
        >
          {/* 헤더 */}
          <div className='h-fit bg-white shadow p-4 rounded-xl flex justify-between items-start flex-shrink-0'>
            <div className=''>
              <h2 className='text-2xl font-bold leading-none text-[#028261]'>{selectedCollection.institutionName}</h2>
              <p className='text-gray-600 mt-2'>{selectedCollection.address}</p>
            </div>
            <button
              onClick={() => setSelectedCollection(null)}
              className='text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
            >
              <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
          {/* 왼쪽: 표본 목록 (분류별) */}
          <div className='h-full overflow-y-auto  bg-white p-4 rounded-xl shadow'>
            <div className='space-y-6'>
              {classificationGroups.map((group) => (
                <div key={group.name} className='space-y-4'>
                  {/* 분류 헤더 */}
                  <div className='flex justify-between items-center '>
                    <div className='flex justify-start items-end gap-3 ml-1'>
                      <span className='text-xl font-semibold leading-none'>
                        {group.name}{' '}
                        <span className='ml-1 text-base font-medium opacity-50 leading-none'>{group.name_en}</span>
                      </span>
                    </div>
                    {/* <span className='text-base bg-gray-100 px-3 py-1 rounded-full'>{group.count}개</span> */}
                  </div>

                  {/* 표본 그리드 */}
                  <div className='grid grid-cols-2 gap-3'>
                    {group.specimens
                      .sort((a, b) => a.no - b.no) // 🔥 no 기준 오름차순 정렬
                      .map((specimen) => (
                        <button
                          key={specimen.no}
                          onClick={() => {
                            setSelectedHeritage({ isSelected: true, data: specimen })
                            setSelectedCollection(null)
                          }}
                          className={classNames(
                            'p-2 rounded-lg hover:shadow-lg active:shadow-none active:scale-95 transition-all text-left group cursor-pointer',
                            'flex flex-row justify-start gap-1 h-full',
                            'bg-white border border-gray-200',
                          )}
                          style={{
                            borderColor: '#e5e7eb', // gray-200
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = group.color + '20' // 20% 투명도
                            e.currentTarget.style.borderColor = group.color + '40' // 40% 투명도
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                          }}
                        >
                          <div className='flex w-fit h-12 p-2 aspect-square rounded-lg'>
                            <div
                              className='w-full h-full'
                              style={{
                                backgroundColor: '#333',
                                mask: `url('/img/${extractClassificationKey(specimen.species?.classifications?.name || '')}.png') no-repeat center / contain`,
                                WebkitMask: `url('/img/${extractClassificationKey(specimen.species?.classifications?.name || '')}.png') no-repeat center / contain` /* Safari */,
                              }}
                            />
                          </div>
                          <div className='w-full h-full flex flex-col items-start justify-center px-1 gap-1'>
                            {specimen.species && (
                              <p className='text-gray-800 font-medium text-base line-clamp-1'>
                                {specimen.species.name_kr}
                              </p>
                            )}
                            <p className='font-mono font-normal text-sm text-black/50'>{specimen.specimen_id}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 오른쪽: 도넛 차트 */}
          <div className='h-full flex flex-col gap-4  bg-white p-4 rounded-xl shadow'>
            <div className='w-full h-fit flex flex-row justify-between items-center'>
              <span className='text-xl font-semibold text-gray-800 leading-none'>소장 현황</span>
              <span className='text-base bg-gray-100 px-3 py-1 rounded-full'>총 {selectedCollection.count}점</span>
            </div>
            <div className='w-full h-full inline-flex items-center justify-center gap-4'>
              <ResponsiveContainer height='100%' width='100%' className='pointer-events-none'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey='value'
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill }) => {
                      const RADIAN = Math.PI / 180
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.2
                      const x = cx + radius * Math.cos(-midAngle! * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle! * RADIAN)

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={fill} // 🔥 해당 섹션의 색상 사용
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline='central'
                          className='text-xs font-bold'
                        >
                          {`${(percent! * 100).toFixed(0)}%`}
                        </text>
                      )
                    }}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className='w-full space-y-2 p-2'>
                {classificationGroups.map((group) => (
                  <div key={group.name} className='w-fit gap-2 flex items-center justify-between'>
                    <div className='flex items-center gap-1 text-lg'>
                      <div className='flex w-fit h-12 p-2 aspect-square rounded-lg'>
                        <div
                          className='w-full h-full'
                          style={{
                            backgroundColor: group.color,
                            mask: `url('/img/${extractClassificationKey(group.name || '')}.png') no-repeat center / contain`,
                            WebkitMask: `url('/img/${extractClassificationKey(group.name || '')}.png') no-repeat center / contain` /* Safari */,
                          }}
                        />
                      </div>
                      <span className='font-medium text-gray-700'>{group.name} :</span>
                    </div>
                    <span className='font-medium text-lg text-gray-500'>
                      {group.count}점 ({((group.count / selectedCollection.count) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
