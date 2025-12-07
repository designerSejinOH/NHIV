'use client'

import { useState, useEffect } from 'react'

interface Classification {
  id: number
  name: string
  name_en: string | null
}

interface ClassificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classification?: Classification | null
}

export default function ClassificationModal({ isOpen, onClose, onSuccess, classification }: ClassificationModalProps) {
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!classification

  useEffect(() => {
    if (classification) {
      setName(classification.name)
      setNameEn(classification.name_en || '')
    } else {
      setName('')
      setNameEn('')
    }
    setError('')
    setSuccess('')
  }, [classification, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('분류명을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const url = isEditMode ? '/api/classifications/update' : '/api/classifications/create'

      const body = isEditMode
        ? { id: classification.id, name: name.trim(), name_en: nameEn.trim() || null }
        : { name: name.trim(), name_en: nameEn.trim() || null }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditMode ? '분류가 수정되었습니다.' : '분류가 추가되었습니다.')
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
    setName('')
    setNameEn('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4'>{isEditMode ? '분류 수정' : '새 분류 추가'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              분류명 <span className='text-red-500'>*</span>
            </label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 포유류 (포유동물강, Mammalia)'
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
              placeholder='예: Mammalia'
            />
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
