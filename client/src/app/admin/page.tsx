'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { IoChevronDown, IoChevronForward } from 'react-icons/io5'
interface ClassificationWithSpecies {
  id: number
  name: string
  name_en: string | null
  species_count: number
  species: Array<{
    id: number
    name_kr: string
    name_sci: string | null
    specimen_count: number
    specimens?: Array<{
      no: number
      specimen_id: string
    }>
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    specimens: 0,
    species: 0,
    classifications: 0,
    collections: 0,
    iucn: 0,
    protection: 0,
  })
  const [hierarchy, setHierarchy] = useState<ClassificationWithSpecies[]>([])
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set())
  const [expandedSpecies, setExpandedSpecies] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchHierarchy()
  }, [])

  const fetchStats = async () => {
    try {
      const [
        { count: specimensCount },
        { count: speciesCount },
        { count: classificationsCount },
        { count: collectionsCount },
        { count: iucnCount },
        { count: protectionCount },
      ] = await Promise.all([
        supabase.from('specimens').select('*', { count: 'exact', head: true }),
        supabase.from('species').select('*', { count: 'exact', head: true }),
        supabase.from('classifications').select('*', { count: 'exact', head: true }),
        supabase.from('collections').select('*', { count: 'exact', head: true }),
        supabase.from('iucn_statuses').select('*', { count: 'exact', head: true }),
        supabase.from('protection_types').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        specimens: specimensCount || 0,
        species: speciesCount || 0,
        classifications: classificationsCount || 0,
        collections: collectionsCount || 0,
        iucn: iucnCount || 0,
        protection: protectionCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchHierarchy = async () => {
    try {
      // 1. 모든 분류 조회
      const { data: classifications } = await supabase.from('classifications').select('*').order('id')

      if (!classifications) return

      // 2. 각 분류별 생물종과 표본 개수 조회
      const hierarchyData = await Promise.all(
        classifications.map(async (classification) => {
          // 해당 분류의 생물종들 조회
          const { data: species } = await supabase
            .from('species')
            .select('id, name_kr, name_sci')
            .eq('class_id', classification.id)
            .order('name_kr')

          if (!species || species.length === 0) {
            return {
              ...classification,
              species_count: 0,
              species: [],
            }
          }

          // 각 생물종별 표본 개수 조회
          const speciesWithCounts = await Promise.all(
            species.map(async (sp) => {
              const { count } = await supabase
                .from('specimens')
                .select('*', { count: 'exact', head: true })
                .eq('species_id', sp.id)

              // 표본 목록도 가져오기 (최대 5개만)
              const { data: specimens } = await supabase
                .from('specimens')
                .select('no, specimen_id')
                .eq('species_id', sp.id)
                .limit(5)

              return {
                ...sp,
                specimen_count: count || 0,
                specimens: specimens || [],
              }
            }),
          )

          return {
            ...classification,
            species_count: species.length,
            species: speciesWithCounts,
          }
        }),
      )

      setHierarchy(hierarchyData)
    } catch (error) {
      console.error('Error fetching hierarchy:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleClass = (classId: number) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(classId)) {
        newSet.delete(classId)
      } else {
        newSet.add(classId)
      }
      return newSet
    })
  }

  const toggleSpecies = (speciesId: number) => {
    setExpandedSpecies((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(speciesId)) {
        newSet.delete(speciesId)
      } else {
        newSet.add(speciesId)
      }
      return newSet
    })
  }

  const StatCard = ({ title, count, link, color }: any) => (
    <Link href={link}>
      <div
        className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${color}`}
      >
        <h3 className='text-gray-600 text-sm font-medium'>{title}</h3>
        <p className='text-3xl font-bold mt-2'>{count}</p>
      </div>
    </Link>
  )

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <StatCard title='총 표본 수' count={stats.specimens} link='/admin/specimens' color='border-blue-500' />
        <StatCard title='생물종 수' count={stats.species} link='/admin/species' color='border-green-500' />
        <StatCard
          title='분류 수'
          count={stats.classifications}
          link='/admin/classifications'
          color='border-purple-500'
        />
        <StatCard title='소장처 수' count={stats.collections} link='/admin/collections' color='border-orange-500' />
        <StatCard title='IUCN 등급 수' count={stats.iucn} link='/admin/iucn' color='border-red-500' />
        <StatCard
          title='국가보호종 유형 수'
          count={stats.protection}
          link='/admin/protection'
          color='border-yellow-500'
        />
      </div>

      {/* 계층 구조 시각화 */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-2xl font-bold mb-4'>분류 체계</h2>
        <p className='text-sm text-gray-600 mb-4'>분류 → 생물종 → 표본</p>

        <div className='space-y-2'>
          {hierarchy.map((classification) => (
            <div key={classification.id} className='rounded-lg border shadow border-gray-200 overflow-hidden'>
              {/* 분류 레벨 */}
              <button
                onClick={() => toggleClass(classification.id)}
                className='w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors cursor-pointer'
              >
                <div className='flex items-center space-x-4'>
                  {expandedClasses.has(classification.id) ? (
                    <IoChevronDown className='w-5 h-5 text-green-500' />
                  ) : (
                    <IoChevronForward className='w-5 h-5 text-green-500' />
                  )}
                  <div className='flex items-center space-x-2'>
                    <div className='text-left'>
                      <p className='font-bold text-base'>{classification.name}</p>
                      {classification.name_en && (
                        <p className='text-sm text-gray-600 italic'>{classification.name_en}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-end text-right space-y-1'>
                  <span className='text-black text-sm font-semibold'>{classification.species_count}종</span>
                  <span className='text-gray-500 text-xs'>
                    {classification.species.reduce((sum, sp) => sum + sp.specimen_count, 0)}개 표본
                  </span>
                </div>
              </button>

              {/* 생물종 레벨 */}
              {expandedClasses.has(classification.id) && (
                <div className=' bg-gray-100 border-t border-gray-200 p-3 overflow-hidden'>
                  {classification.species.length === 0 ? (
                    <div className='text-center py-4 text-gray-500 text-sm'>등록된 생물종이 없습니다</div>
                  ) : (
                    <div className='space-y-1'>
                      {classification.species.map((species) => (
                        <div
                          key={species.id}
                          className='bg-white border shadow border-gray-200 rounded-lg overflow-hidden'
                        >
                          {/* 생물종 정보 */}
                          <button
                            onClick={() => toggleSpecies(species.id)}
                            className='w-full flex items-center border-b border-gray-200 justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer'
                          >
                            <div className='flex items-center space-x-4'>
                              {expandedSpecies.has(species.id) ? (
                                <IoChevronDown className='w-4 h-4 text-green-500' />
                              ) : (
                                <IoChevronForward className='w-4 h-4 text-green-500' />
                              )}
                              <div className='text-left'>
                                <p className='font-semibold'>{species.name_kr}</p>
                                {species.name_sci && <p className='text-xs text-gray-500 italic'>{species.name_sci}</p>}
                              </div>
                            </div>
                            <span className='text-black text-sm text-right font-semibold'>
                              {species.specimen_count}개 표본
                            </span>
                          </button>

                          {/* 표본 레벨 */}
                          {expandedSpecies.has(species.id) && species.specimens && (
                            <div className='p-3 bg-gray-50'>
                              {species.specimen_count === 0 ? (
                                <div className='text-center py-2 text-gray-500 text-xs'>등록된 표본이 없습니다</div>
                              ) : (
                                <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                                  {species.specimens.map((specimen) => (
                                    <Link
                                      key={specimen.no}
                                      href={`/admin/specimens?edit=${specimen.no}`} // 쿼리 파라미터 추가
                                      className='flex items-center space-x-2 p-2 rounded-md bg-white border border-gray-200 hover:border-green-500 shadow transition-all'
                                    >
                                      <span className='text-lg'>🔬</span>
                                      <div className='text-sm'>
                                        <p className='font-mono font-semibold'>{specimen.specimen_id}</p>
                                        <p className='text-gray-500'>No.{specimen.no}</p>
                                      </div>
                                    </Link>
                                  ))}
                                  {species.specimen_count > 5 && (
                                    <div className='flex items-center justify-center p-2 bg-gray-100 rounded border border-dashed'>
                                      <span className='text-xs text-gray-500'>+{species.specimen_count - 5}개 더</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
