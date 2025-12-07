'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CollectionModal from '../components/CollectionModal'

interface Collection {
  id: number
  institution_name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase.from('collections').select('*').order('id', { ascending: true })

      if (error) throw error
      setCollections(data || [])
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedCollection(null)
    setIsModalOpen(true)
  }

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`정말 "${name}" 소장처를 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase.from('collections').delete().eq('id', id)

      if (error) {
        if (error.code === '23503') {
          alert('이 소장처를 사용하는 표본이 있어 삭제할 수 없습니다.')
        } else {
          throw error
        }
      } else {
        alert('소장처가 삭제되었습니다.')
        fetchCollections()
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleModalSuccess = () => {
    fetchCollections()
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>소장처 목록</h2>
        <button onClick={handleAdd} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          새 소장처 추가
        </button>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        {collections.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>등록된 소장처가 없습니다.</div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>기관명</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>주소</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>좌표</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>등록일</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>작업</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {collections.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>{item.id}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>{item.institution_name}</td>
                  <td className='px-6 py-4 text-sm max-w-xs truncate'>{item.address || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {item.latitude && item.longitude ? (
                      <div className='space-y-1'>
                        <div>위도: {item.latitude.toFixed(6)}</div>
                        <div>경도: {item.longitude.toFixed(6)}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <button onClick={() => handleEdit(item)} className='text-blue-600 hover:text-blue-900 mr-4'>
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.institution_name)}
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

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        collection={selectedCollection}
      />
    </div>
  )
}
