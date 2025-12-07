'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Species {
  id: number
  name_kr: string
  name_en: string | null
  name_sci: string | null
  class_id: number | null
}

interface Classification {
  id: number
  name: string
  name_en: string | null
}

interface SpeciesModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  species?: Species | null
}

export default function SpeciesModal({ isOpen, onClose, onSuccess, species }: SpeciesModalProps) {
  const [nameKr, setNameKr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameSci, setNameSci] = useState('')
  const [classId, setClassId] = useState('')
  const [classifications, setClassifications] = useState<Classification[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!species

  useEffect(() => {
    if (isOpen) {
      fetchClassifications()
    }
  }, [isOpen])

  useEffect(() => {
    if (species) {
      setNameKr(species.name_kr)
      setNameEn(species.name_en || '')
      setNameSci(species.name_sci || '')
      setClassId(species.class_id?.toString() || '')
    } else {
      setNameKr('')
      setNameEn('')
      setNameSci('')
      setClassId('')
    }
    setError('')
    setSuccess('')
  }, [species, isOpen])

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase.from('classifications').select('*').order('id', { ascending: true })

      if (error) throw error
      setClassifications(data || [])
    } catch (error) {
      console.error('Error fetching classifications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!nameKr.trim()) {
      setError('한글명을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const url = isEditMode ? '/api/species/update' : '/api/species/create'

      const body = isEditMode
        ? {
            id: species.id,
            name_kr: nameKr.trim(),
            name_en: nameEn.trim() || null,
            name_sci: nameSci.trim() || null,
            class_id: classId ? parseInt(classId) : null,
          }
        : {
            name_kr: nameKr.trim(),
            name_en: nameEn.trim() || null,
            name_sci: nameSci.trim() || null,
            class_id: classId ? parseInt(classId) : null,
          }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditMode ? '생물종이 수정되었습니다.' : '생물종이 추가되었습니다.')
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 1000)
      } else {
        setError(data.error || '오류가 발생했습니다.')
      }
    } catch (err) {
      setError('처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNameKr('')
    setNameEn('')
    setNameSci('')
    setClassId('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>{isEditMode ? '생물종 수정' : '새 생물종 추가'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div>
            <label htmlFor='nameKr' className='block text-sm font-medium text-gray-700 mb-1'>
              한글명 <span className='text-red-500'>*</span>
            </label>
            <input
              id='nameKr'
              type='text'
              value={nameKr}
              onChange={(e) => setNameKr(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 수달'
            />
          </div>

          <div>
            <label htmlFor='nameEn' className='block text-sm font-medium text-gray-700 mb-1'>
              영문명
            </label>
            <input
              id='nameEn'
              type='text'
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: Common Otter'
            />
          </div>

          <div>
            <label htmlFor='nameSci' className='block text-sm font-medium text-gray-700 mb-1'>
              학명
            </label>
            <input
              id='nameSci'
              type='text'
              value={nameSci}
              onChange={(e) => setNameSci(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: Lutra lutra'
            />
          </div>

          <div>
            <label htmlFor='classId' className='block text-sm font-medium text-gray-700 mb-1'>
              분류
            </label>
            <select
              id='classId'
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
            >
              <option value=''>선택 안 함</option>
              {classifications.map((classification) => (
                <option key={classification.id} value={classification.id}>
                  {classification.name}
                </option>
              ))}
            </select>
          </div>

          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : isEditMode ? '수정하기' : '추가하기'}
            </button>
            <button
              type='button'
              onClick={handleClose}
              disabled={loading}
              className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50'
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
