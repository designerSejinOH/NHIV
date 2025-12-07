'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ClassificationModal from '../components/ClassificationModal'

interface Classification {
  id: number
  name: string
  name_en: string | null
  created_at: string
}

export default function ClassificationsPage() {
  const [classifications, setClassifications] = useState<Classification[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null)

  useEffect(() => {
    fetchClassifications()
  }, [])

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase.from('classifications').select('*').order('id', { ascending: true })

      if (error) throw error
      setClassifications(data || [])
      console.log(data)
    } catch (error) {
      console.error('Error fetching classifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedClassification(null)
    setIsModalOpen(true)
  }

  const handleEdit = (classification: Classification) => {
    setSelectedClassification(classification)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`정말 "${name}" 분류를 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('classifications').delete().eq('id', id)

      if (error) {
        // 외래키 제약 조건 위반 시
        if (error.code === '23503') {
          alert('이 분류를 사용하는 생물종이 있어 삭제할 수 없습니다.')
        } else {
          throw error
        }
      } else {
        alert('분류가 삭제되었습니다.')
        fetchClassifications()
      }
    } catch (error) {
      console.error('Error deleting classification:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleModalSuccess = () => {
    fetchClassifications()
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>분류 목록</h2>
        <button onClick={handleAdd} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          새 분류 추가
        </button>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        {classifications.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>등록된 분류가 없습니다.</div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>분류명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>영문명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>등록일</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>작업</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {classifications.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.id}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>{item.name}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.name_en || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <button onClick={() => handleEdit(item)} className='text-blue-600 hover:text-blue-900 mr-4'>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
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

      <ClassificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        classification={selectedClassification}
      />
    </div>
  )
}
