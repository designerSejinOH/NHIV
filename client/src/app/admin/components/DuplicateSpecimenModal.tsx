'use client'

import { useState } from 'react'

interface DuplicateSpecimenModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  originalNo: number
  originalSpecimenId: string
}

export default function DuplicateSpecimenModal({
  isOpen,
  onClose,
  onSuccess,
  originalNo,
  originalSpecimenId,
}: DuplicateSpecimenModalProps) {
  const [newNo, setNewNo] = useState('')
  const [newSpecimenId, setNewSpecimenId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newNo.trim()) {
      setError('새 표본 번호를 입력해주세요.')
      return
    }

    if (!newSpecimenId.trim()) {
      setError('새 표본 ID를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/specimens/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_no: originalNo,
          new_no: parseInt(newNo),
          new_specimen_id: newSpecimenId.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('표본이 복제되었습니다.')
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
    setNewNo('')
    setNewSpecimenId('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4'>표본 복제</h2>

        <div className='mb-4 p-3 bg-gray-50 rounded border border-gray-200'>
          <p className='text-sm text-gray-600 mb-1'>복제할 표본:</p>
          <p className='font-medium'>
            No. {originalNo} - {originalSpecimenId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div>
            <label htmlFor='newNo' className='block text-sm font-medium text-gray-700 mb-1'>
              새 표본 번호 (No) <span className='text-red-500'>*</span>
            </label>
            <input
              id='newNo'
              type='number'
              value={newNo}
              onChange={(e) => setNewNo(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 100'
            />
          </div>

          <div>
            <label htmlFor='newSpecimenId' className='block text-sm font-medium text-gray-700 mb-1'>
              새 표본 ID <span className='text-red-500'>*</span>
            </label>
            <input
              id='newSpecimenId'
              type='text'
              value={newSpecimenId}
              onChange={(e) => setNewSpecimenId(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: SP0100'
            />
          </div>

          <p className='text-xs text-gray-500'>* 나머지 정보는 모두 원본과 동일하게 복제됩니다.</p>

          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : '복제하기'}
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
