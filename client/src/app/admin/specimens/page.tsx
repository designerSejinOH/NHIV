'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SpecimenModal from '../components/SpecimenModal'
import DuplicateSpecimenModal from '../components/DuplicateSpecimenModal'
import type { Specimen } from '@/types/database'
import { useSearchParams, useRouter } from 'next/navigation'

interface SpecimenWithRelations extends Specimen {
  species?: {
    name_kr: string
    name_sci: string | null
  }
  collections?: {
    institution_name: string
  }
  iucn_statuses?: {
    code: string
    name_kr: string
  }
}

export default function SpecimensPage() {
  const [specimens, setSpecimens] = useState<SpecimenWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null)
  const [duplicateTarget, setDuplicateTarget] = useState<{ no: number; specimen_id: string } | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetchSpecimens()
  }, [])

  // 쿼리 파라미터 확인하여 모달 열기
  useEffect(() => {
    const editNo = searchParams.get('edit')
    if (editNo && specimens.length > 0) {
      const specimenToEdit = specimens.find((s) => s.no === parseInt(editNo))
      if (specimenToEdit) {
        setSelectedSpecimen(specimenToEdit)
        setIsModalOpen(true)
        // URL에서 쿼리 파라미터 제거
        router.replace('/admin/specimens', { scroll: false })
      }
    }
  }, [searchParams, specimens, router])

  const fetchSpecimens = async () => {
    try {
      const { data, error } = await supabase
        .from('specimens')
        .select(
          `
          *,
          species (
            name_kr,
            name_sci
          ),
          collections (
            institution_name
          ),
          iucn_statuses (
            code,
            name_kr
          )
        `,
        )
        .order('no', { ascending: false })

      if (error) throw error
      setSpecimens(data || [])
    } catch (error) {
      console.error('Error fetching specimens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedSpecimen(null)
    setIsModalOpen(true)
  }

  const handleEdit = (specimen: Specimen) => {
    setSelectedSpecimen(specimen)
    setIsModalOpen(true)
  }

  const handleDuplicate = (no: number, specimenId: string) => {
    setDuplicateTarget({ no, specimen_id: specimenId })
    setIsDuplicateModalOpen(true)
  }

  const handleDelete = async (no: number, specimenId: string) => {
    if (!confirm(`정말 표본 "${specimenId}"를 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('specimens').delete().eq('no', no)

      if (error) throw error

      alert('표본이 삭제되었습니다.')
      fetchSpecimens()
    } catch (error) {
      console.error('Error deleting specimen:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleModalSuccess = () => {
    fetchSpecimens()
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>표본 목록</h2>
        <button onClick={handleAdd} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          새 표본 추가
        </button>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        {specimens.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>등록된 표본이 없습니다.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>No</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>표본 ID</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>생물종</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>소장처</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>IUCN</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>작업</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {specimens.map((item) => (
                  <tr key={item.no} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.no}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>{item.specimen_id}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      {item.species ? (
                        <div>
                          <div>{item.species.name_kr}</div>
                          {item.species.name_sci && (
                            <div className='text-xs text-gray-500 italic'>{item.species.name_sci}</div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.collections?.institution_name || '-'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      {item.iucn_statuses ? <span className='font-bold'>{item.iucn_statuses.code}</span> : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <button onClick={() => handleEdit(item)} className='text-blue-600 hover:text-blue-900 mr-3'>
                        수정
                      </button>
                      <button
                        onClick={() => handleDuplicate(item.no, item.specimen_id)}
                        className='text-green-600 hover:text-green-900 mr-3'
                      >
                        복제
                      </button>
                      <button
                        onClick={() => handleDelete(item.no, item.specimen_id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SpecimenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        specimen={selectedSpecimen}
      />

      {duplicateTarget && (
        <DuplicateSpecimenModal
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            setIsDuplicateModalOpen(false)
            setDuplicateTarget(null)
          }}
          onSuccess={handleModalSuccess}
          originalNo={duplicateTarget.no}
          originalSpecimenId={duplicateTarget.specimen_id}
        />
      )}
    </div>
  )
}
