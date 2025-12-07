'use client'

import { useState, useEffect } from 'react'

interface Collection {
  id: number
  institution_name: string
  address: string | null
  latitude: number | null
  longitude: number | null
}

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  collection?: Collection | null
}

export default function CollectionModal({ isOpen, onClose, onSuccess, collection }: CollectionModalProps) {
  const [institutionName, setInstitutionName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = !!collection

  useEffect(() => {
    if (collection) {
      setInstitutionName(collection.institution_name)
      setAddress(collection.address || '')
      setLatitude(collection.latitude?.toString() || '')
      setLongitude(collection.longitude?.toString() || '')
    } else {
      setInstitutionName('')
      setAddress('')
      setLatitude('')
      setLongitude('')
    }
    setError('')
    setSuccess('')
  }, [collection, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!institutionName.trim()) {
      setError('기관명을 입력해주세요.')
      return
    }

    // 위도/경도 유효성 검사
    let lat: number | null = null
    let lng: number | null = null

    if (latitude.trim()) {
      lat = parseFloat(latitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setError('위도는 -90에서 90 사이의 숫자여야 합니다.')
        return
      }
    }

    if (longitude.trim()) {
      lng = parseFloat(longitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setError('경도는 -180에서 180 사이의 숫자여야 합니다.')
        return
      }
    }

    // 위도와 경도는 둘 다 입력하거나 둘 다 입력하지 않아야 함
    if ((latitude.trim() && !longitude.trim()) || (!latitude.trim() && longitude.trim())) {
      setError('위도와 경도는 함께 입력해야 합니다.')
      return
    }

    setLoading(true)

    try {
      const url = isEditMode ? '/api/collections/update' : '/api/collections/create'

      const body = isEditMode
        ? {
            id: collection.id,
            institution_name: institutionName.trim(),
            address: address.trim() || null,
            latitude: lat,
            longitude: lng,
          }
        : {
            institution_name: institutionName.trim(),
            address: address.trim() || null,
            latitude: lat,
            longitude: lng,
          }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditMode ? '소장처가 수정되었습니다.' : '소장처가 추가되었습니다.')
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
    setInstitutionName('')
    setAddress('')
    setLatitude('')
    setLongitude('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>{isEditMode ? '소장처 수정' : '새 소장처 추가'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div>
            <label htmlFor='institutionName' className='block text-sm font-medium text-gray-700 mb-1'>
              기관명 <span className='text-red-500'>*</span>
            </label>
            <input
              id='institutionName'
              type='text'
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 서울대공원'
            />
          </div>

          <div>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
              주소
            </label>
            <input
              id='address'
              type='text'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
              placeholder='예: 경기도 과천시 대공원광장로 102'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label htmlFor='latitude' className='block text-sm font-medium text-gray-700 mb-1'>
                위도
              </label>
              <input
                id='latitude'
                type='text'
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                disabled={loading}
                placeholder='예: 37.427715'
              />
              <p className='mt-1 text-xs text-gray-500'>-90 ~ 90</p>
            </div>

            <div>
              <label htmlFor='longitude' className='block text-sm font-medium text-gray-700 mb-1'>
                경도
              </label>
              <input
                id='longitude'
                type='text'
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                disabled={loading}
                placeholder='예: 127.016968'
              />
              <p className='mt-1 text-xs text-gray-500'>-180 ~ 180</p>
            </div>
          </div>

          <p className='text-xs text-gray-500'>* 위도와 경도는 함께 입력하거나 모두 비워두어야 합니다</p>

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
