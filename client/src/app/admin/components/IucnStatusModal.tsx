'use client'

import { useState, useEffect } from 'react'

interface IucnStatus {
  id: number
  code: string
  name_kr: string
  name_en: string
  sort_order: number
}

interface IucnStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  iucnStatus?: IucnStatus | null
}

export default function IucnStatusModal({ isOpen, onClose, onSuccess, iucnStatus }: IucnStatusModalProps) {
  const [code, setCode] = useState('')
  const [nameKr, setNameKr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!iucnStatus

  useEffect(() => {
    if (iucnStatus) {
      setCode(iucnStatus.code)
      setNameKr(iucnStatus.name_kr)
      setNameEn(iucnStatus.name_en)
      setSortOrder(iucnStatus.sort_order.toString())
    } else {
      setCode('')
      setNameKr('')
      setNameEn('')
      setSortOrder('')
    }
    setError('')
    setSuccess('')
  }, [iucnStatus, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!code.trim()) {
      setError('코드를 입력해주세요.')
      return
    }

    if (!nameKr.trim()) {
      setError('한글명을 입력해주세요.')
      return
    }

    if (!nameEn.trim()) {
      setError('영문명을 입력해주세요.')
      return
    }

    if (!sortOrder.trim()) {
      setError('정렬 순서를 입력해주세요.')
      return
    }

    const sortOrderNum = parseInt(sortOrder)
    if (isNaN(sortOrderNum) || sortOrderNum < 1) {
      setError('정렬 순서는 1 이상의 숫자여야 합니다.')
      return
    }

    setLoading(true)

    try {
      const url = isEditMode ? '/api/iucn/update' : '/api/iucn/create'

      const body = isEditMode
        ? {
            id: iucnStatus.id,
            code: code.trim().toUpperCase(),
            name_kr: nameKr.trim(),
            name_en: nameEn.trim(),
            sort_order: sortOrderNum,
          }
        : {
            code: code.trim().toUpperCase(),
            name_kr: nameKr.trim(),
            name_en: nameEn.trim(),
            sort_order: sortOrderNum,
          }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditMode ? 'IUCN 등급이 수정되었습니다.' : 'IUCN 등급이 추가되었습니다.')
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
    setCode('')
    setNameKr('')
    setNameEn('')
    setSortOrder('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4'>{isEditMode ? 'IUCN 등급 수정' : '새 IUCN 등급 추가'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div>
            <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
              코드 <span className='text-red-500'>*</span>
            </label>
            <input
              id='code'
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: CR, EN, VU'
              maxLength={10}
            />
          </div>

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
              placeholder='예: 위급'
            />
          </div>

          <div>
            <label htmlFor='nameEn' className='block text-sm font-medium text-gray-700 mb-1'>
              영문명 <span className='text-red-500'>*</span>
            </label>
            <input
              id='nameEn'
              type='text'
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: Critically Endangered'
            />
          </div>

          <div>
            <label htmlFor='sortOrder' className='block text-sm font-medium text-gray-700 mb-1'>
              정렬 순서 <span className='text-red-500'>*</span>
            </label>
            <input
              id='sortOrder'
              type='number'
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 1'
              min='1'
            />
            <p className='mt-1 text-xs text-gray-500'>숫자가 작을수록 먼저 표시됩니다</p>
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
