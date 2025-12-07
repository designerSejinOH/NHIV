'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SpeciesModal from '../components/SpeciesModal'

interface Species {
  id: number
  name_kr: string
  name_en: string | null
  name_sci: string | null
  class_id: number | null
  created_at: string
  classifications?: {
    name: string
  }
}

export default function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)

  useEffect(() => {
    fetchSpecies()
  }, [])

  const fetchSpecies = async () => {
    try {
      const { data, error } = await supabase
        .from('species')
        .select(
          `
          *,
          classifications (
            name
          )
        `,
        )
        .order('id', { ascending: false })

      if (error) throw error
      setSpecies(data || [])
    } catch (error) {
      console.error('Error fetching species:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedSpecies(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: Species) => {
    setSelectedSpecies(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`정말 "${name}" 생물종을 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('species').delete().eq('id', id)

      if (error) {
        if (error.code === '23503') {
          alert('이 생물종을 사용하는 표본이 있어 삭제할 수 없습니다.')
        } else {
          throw error
        }
      } else {
        alert('생물종이 삭제되었습니다.')
        fetchSpecies()
      }
    } catch (error) {
      console.error('Error deleting species:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleModalSuccess = () => {
    fetchSpecies()
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>생물종 목록</h2>
        <button onClick={handleAdd} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          새 생물종 추가
        </button>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        {species.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>등록된 생물종이 없습니다.</div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>한글명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>영문명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>학명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>분류</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>등록일</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>작업</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {species.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.id}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>{item.name_kr}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.name_en || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm italic'>{item.name_sci || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.classifications?.name || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <button onClick={() => handleEdit(item)} className='text-blue-600 hover:text-blue-900 mr-4'>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name_kr)}
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

      <SpeciesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        species={selectedSpecies}
      />
    </div>
  )
}
