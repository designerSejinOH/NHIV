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
  const [fileStatuses, setFileStatuses] = useState<Record<number, 'checking' | 'valid' | 'invalid' | 'none'>>({})

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

      // 파일 상태 확인
      if (data) {
        checkFileStatuses(data)
      }
    } catch (error) {
      console.error('Error fetching specimens:', error)
    } finally {
      setLoading(false)
    }
  }

  // 파일 유효성 확인
  const checkFileStatuses = async (specimens: SpecimenWithRelations[]) => {
    const statuses: Record<number, 'checking' | 'valid' | 'invalid' | 'none'> = {}

    // 초기 상태 설정
    specimens.forEach((specimen) => {
      if (!specimen.model_url) {
        statuses[specimen.no] = 'none'
      } else {
        statuses[specimen.no] = 'checking'
      }
    })
    setFileStatuses(statuses)

    // 파일 존재 확인
    for (const specimen of specimens) {
      if (!specimen.model_url) continue

      try {
        const url = new URL(specimen.model_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')

        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')

          // Storage에서 파일 존재 확인
          const { data, error } = await supabase.storage
            .from('specimen-models')
            .list(filePath.substring(0, filePath.lastIndexOf('/')), {
              search: filePath.substring(filePath.lastIndexOf('/') + 1),
            })

          if (error || !data || data.length === 0) {
            statuses[specimen.no] = 'invalid'
          } else {
            statuses[specimen.no] = 'valid'
          }
        } else {
          statuses[specimen.no] = 'invalid'
        }
      } catch (error) {
        statuses[specimen.no] = 'invalid'
      }

      // 상태 업데이트 (실시간으로 보여주기)
      setFileStatuses({ ...statuses })
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
      console.log('🗑️ Starting deletion for specimen:', specimenId)

      const { data: specimenToDelete } = await supabase.from('specimens').select('model_url').eq('no', no).single()

      console.log('📋 Specimen data:', specimenToDelete)

      const { error } = await supabase.from('specimens').delete().eq('no', no)

      if (error) throw error
      console.log('✅ Specimen deleted from database')

      if (specimenToDelete?.model_url) {
        try {
          console.log('🔍 Checking if file is used by other specimens...')

          const { data: otherSpecimens } = await supabase
            .from('specimens')
            .select('no')
            .eq('model_url', specimenToDelete.model_url)

          console.log('📊 Other specimens using this file:', otherSpecimens?.length || 0)

          if (!otherSpecimens || otherSpecimens.length === 0) {
            const url = new URL(specimenToDelete.model_url)
            const pathParts = url.pathname.split('/')
            const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')

            if (bucketIndex !== -1) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/')
              console.log('🗑️ Deleting file:', filePath)

              const { error: deleteFileError } = await supabase.storage.from('specimen-models').remove([filePath])

              if (deleteFileError) {
                console.error('❌ Failed to delete file:', deleteFileError)
              } else {
                console.log('✅ File deleted successfully')
              }
            }
          } else {
            console.log('⚠️ File is used by other specimens, keeping file')
          }
        } catch (fileError) {
          console.error('⚠️ Error handling file deletion:', fileError)
        }
      } else {
        console.log('ℹ️ No file to delete')
      }

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

  // 파일 상태 뱃지 컴포넌트
  const FileStatusBadge = ({ status }: { status: 'checking' | 'valid' | 'invalid' | 'none' }) => {
    switch (status) {
      case 'checking':
        return (
          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
            <svg className='animate-spin h-3 w-3 mr-1' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            확인중
          </span>
        )
      case 'valid':
        return (
          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            정상
          </span>
        )
      case 'invalid':
        return (
          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            없음
          </span>
        )
      case 'none':
        return (
          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
            -
          </span>
        )
      default:
        return null
    }
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
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>파일 상태</th>
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
                      <FileStatusBadge status={fileStatuses[item.no] || 'checking'} />
                    </td>
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
