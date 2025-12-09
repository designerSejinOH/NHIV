'use client'

import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { CollectionGroup } from '../index'

interface CollectionModalProps {
  selectedCollection: CollectionGroup | null
  setSelectedCollection: (collection: CollectionGroup | null) => void
  setSelectedHeritage: (heritage: { isSelected: boolean; data: any } | null) => void
}

// 분류별 색상 매핑
const CLASSIFICATION_COLORS: Record<string, string> = {
  포유류: '#FF6B6B',
  조류: '#4ECDC4',
  곤충류: '#FFD93D',
  파충류: '#95E1D3',
  양서류: '#F38181',
  어류: '#6C5CE7',
  기타: '#A8A8A8',
}

// 분류명에서 키워드 추출 (포유류, 조류 등)
const extractClassificationKey = (name: string): string => {
  if (name.includes('포유')) return '포유류'
  if (name.includes('조류')) return '조류'
  if (name.includes('곤충')) return '곤충류'
  if (name.includes('파충')) return '파충류'
  if (name.includes('양서')) return '양서류'
  if (name.includes('어류')) return '어류'
  return '기타'
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
            'w-full lg:w-[85%] xl:w-[80%] 2xl:w-[70%] relative h-[80vh] bg-white text-black p-6',
            'rounded-lg shadow-2xl',
            'flex flex-col gap-4',
          )}
        >
          {/* 헤더 */}
          <div className='h-fit flex justify-between items-start flex-shrink-0'>
            <div>
              <h2 className='text-3xl font-bold text-[#028261]'>{selectedCollection.institutionName}</h2>
              <p className='text-gray-600 mt-2 text-lg'>총 {selectedCollection.count}개 표본</p>
            </div>
            <button
              onClick={() => setSelectedCollection(null)}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* 왼쪽: 표본 목록 (분류별) */}
          <div className='h-full overflow-y-auto'>
            <div className='space-y-6'>
              {classificationGroups.map((group) => (
                <div key={group.name} className='space-y-3'>
                  {/* 분류 헤더 */}
                  <div className='flex items-center gap-3 sticky top-0 bg-white py-2 z-10'>
                    <div className='w-4 h-4 rounded-full flex-shrink-0' style={{ backgroundColor: group.color }} />
                    <h3 className='text-xl font-bold text-gray-800'>
                      {group.name} <span className='text-sm text-gray-500'>({group.count}개)</span>
                    </h3>
                  </div>

                  {/* 표본 그리드 */}
                  <div className='grid grid-cols-3 gap-3'>
                    {group.specimens
                      .sort((a, b) => a.no - b.no) // 🔥 no 기준 오름차순 정렬
                      .map((specimen) => (
                        <button
                          key={specimen.no}
                          onClick={() => {
                            setSelectedHeritage({ isSelected: true, data: specimen })
                            setSelectedCollection(null)
                          }}
                          className='p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-all text-left group'
                          style={{
                            borderColor: 'transparent',
                            backgroundColor: `${group.color}10`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = group.color
                            e.currentTarget.style.backgroundColor = `${group.color}20`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent'
                            e.currentTarget.style.backgroundColor = `${group.color}10`
                          }}
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <p className='font-mono font-bold text-base text-gray-800'>{specimen.specimen_id}</p>
                              <p className='text-gray-500 text-sm mt-1'>표본 #{specimen.no}</p>
                              {specimen.species && (
                                <p className='text-gray-600 text-xs mt-2 line-clamp-1'>{specimen.species.name_kr}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 도넛 차트 */}
          <div className='h-full flex flex-col gap-4 bg-gray-50 rounded-lg p-4'>
            <h3 className='text-xl font-bold text-gray-800'>분류별 소장 현황</h3>

            <div className='flex-1 flex items-center justify-center'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}
                    labelLine={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}개`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 범례 (수동 구현) */}
            <div className='space-y-2'>
              {classificationGroups.map((group) => (
                <div key={group.name} className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ backgroundColor: group.color }} />
                    <span className='font-medium text-gray-700'>{group.name}</span>
                  </div>
                  <span className='font-bold text-gray-800'>
                    {group.count}개 ({((group.count / selectedCollection.count) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
