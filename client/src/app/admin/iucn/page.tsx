'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import IucnStatusModal from '../components/IucnStatusModal'

interface IucnStatus {
  id: number
  code: string
  name_kr: string
  name_en: string
  sort_order: number
  created_at: string
}

export default function IucnPage() {
  const [iucnStatuses, setIucnStatuses] = useState<IucnStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIucnStatus, setSelectedIucnStatus] = useState<IucnStatus | null>(null)

  useEffect(() => {
    fetchIucnStatuses()
  }, [])

  const fetchIucnStatuses = async () => {
    try {
      const { data, error } = await supabase.from('iucn_statuses').select('*').order('sort_order', { ascending: true })

      if (error) throw error
      setIucnStatuses(data || [])
    } catch (error) {
      console.error('Error fetching IUCN statuses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedIucnStatus(null)
    setIsModalOpen(true)
  }

  const handleEdit = (iucnStatus: IucnStatus) => {
    setSelectedIucnStatus(iucnStatus)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, code: string, nameKr: string) => {
    if (!confirm(`정말 "${code} (${nameKr})" 등급을 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('iucn_statuses').delete().eq('id', id)

      if (error) {
        if (error.code === '23503') {
          alert('이 IUCN 등급을 사용하는 표본이 있어 삭제할 수 없습니다.')
        } else {
          throw error
        }
      } else {
        alert('IUCN 등급이 삭제되었습니다.')
        fetchIucnStatuses()
      }
    } catch (error) {
      console.error('Error deleting IUCN status:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleModalSuccess = () => {
    fetchIucnStatuses()
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>IUCN 등급 목록</h2>
        <button onClick={handleAdd} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          새 등급 추가
        </button>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        {iucnStatuses.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>등록된 IUCN 등급이 없습니다.</div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>정렬순서</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>코드</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>한글명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>영문명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>등록일</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>작업</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {iucnStatuses.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.sort_order}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-bold'>{item.code}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.name_kr}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.name_en}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <button onClick={() => handleEdit(item)} className='text-blue-600 hover:text-blue-900 mr-4'>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.code, item.name_kr)}
                      className='text-red-600 hover:text-red-900'
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <IucnStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        iucnStatus={selectedIucnStatus}
      />
    </div>
  )
}
