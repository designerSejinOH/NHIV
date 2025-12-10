'use client'

import { useState, useEffect, useRef } from 'react'
import { Map as GoogleMap } from '@/components'
import { MarkerF, Autocomplete } from '@react-google-maps/api'

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

const DEFAULT_ZOOM = 15
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 } // 서울 시청

export default function CollectionModal({ isOpen, onClose, onSuccess, collection }: CollectionModalProps) {
  const [institutionName, setInstitutionName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // 마커 위치 상태
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const isEditMode = !!collection

  useEffect(() => {
    if (collection) {
      setInstitutionName(collection.institution_name)
      setAddress(collection.address || '')
      setLatitude(collection.latitude?.toString() || '')
      setLongitude(collection.longitude?.toString() || '')

      if (collection.latitude && collection.longitude) {
        setMarkerPosition({
          lat: collection.latitude,
          lng: collection.longitude,
        })
      } else {
        setMarkerPosition(null)
      }
    } else {
      setInstitutionName('')
      setAddress('')
      setLatitude('')
      setLongitude('')
      setMarkerPosition(null)
    }
    setError('')
    setSuccess('')
  }, [collection, isOpen])

  // latitude/longitude input 변경 시 마커 위치 업데이트
  useEffect(() => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMarkerPosition({ lat, lng })

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng })
      }
    } else if (!latitude.trim() && !longitude.trim()) {
      setMarkerPosition(null)
    }
  }, [latitude, longitude])

  // Autocomplete 로드 핸들러
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  // 장소 선택 핸들러
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()

      // 🔥 place.geometry가 없으면 (자동완성 선택 안 함) 경고
      if (!place.geometry || !place.geometry.location) {
        setError('자동완성 목록에서 장소를 선택해주세요.')
        setTimeout(() => setError(''), 3000) // 3초 후 자동 제거
        return
      }

      // 에러 메시지 제거
      setError('')

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      // 주소 업데이트
      setAddress(place.formatted_address || '')

      // 좌표 업데이트
      setLatitude(lat.toFixed(8))
      setLongitude(lng.toFixed(8))

      // 마커 위치 업데이트
      setMarkerPosition({ lat, lng })

      // 맵 이동 및 줌
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng })
        mapRef.current.setZoom(17)
      }

      // 기관명이 비어있으면 장소 이름으로 채우기
      if (!institutionName.trim() && place.name) {
        setInstitutionName(place.name)
      }
    }
  }

  // 마커 드래그 핸들러
  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      setLatitude(newLat.toFixed(8))
      setLongitude(newLng.toFixed(8))
      setMarkerPosition({ lat: newLat, lng: newLng })

      // Reverse Geocoding으로 주소 가져오기
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address)
        }
      })
    }
  }

  // 맵 클릭 핸들러
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      setLatitude(newLat.toFixed(8))
      setLongitude(newLng.toFixed(8))
      setMarkerPosition({ lat: newLat, lng: newLng })

      // Reverse Geocoding으로 주소 가져오기
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address)
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!institutionName.trim()) {
      setError('기관명을 입력해주세요.')
      return
    }

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
    setMarkerPosition(null)
    setError('')
    setSuccess('')
    onClose()
  }

  const mapCenter = markerPosition || DEFAULT_CENTER

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>{isEditMode ? '소장처 수정' : '새 소장처 추가'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* 왼쪽: 입력 폼 */}
            <div className='space-y-4'>
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

              {/* 🔥 주소 검색 */}
              <div>
                <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
                  주소 검색
                </label>
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'kr' }, // 한국으로 제한
                    fields: ['formatted_address', 'geometry', 'name'],
                  }}
                >
                  <input
                    id='address'
                    type='text'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => {
                      // 🔥 엔터키로 폼 제출 방지
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    placeholder='예: 서울대공원'
                  />
                </Autocomplete>
                <p className='mt-1 text-xs text-gray-500'>🔍 장소명이나 주소를 입력하세요</p>
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

              <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                <p className='text-sm text-blue-800 font-semibold mb-2'>💡 위치 설정 방법</p>
                <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                  <li>
                    🔍 <strong>주소 검색:</strong> 장소명이나 주소를 입력하면 자동 완성
                  </li>
                  <li>
                    📍 <strong>지도 클릭:</strong> 원하는 위치를 직접 클릭
                  </li>
                  <li>
                    🖱️ <strong>마커 드래그:</strong> 마커를 끌어서 미세 조정
                  </li>
                  <li>
                    ⌨️ <strong>직접 입력:</strong> 위도/경도를 수동 입력
                  </li>
                </ul>
              </div>
            </div>

            {/* 오른쪽: 구글맵 */}
            <div className='w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-300'>
              <GoogleMap
                defaultCenter={mapCenter}
                defaultZoom={DEFAULT_ZOOM}
                onIdle={(map) => {
                  mapRef.current = map
                }}
              >
                {markerPosition && (
                  <MarkerF
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    animation={google.maps.Animation.DROP}
                    onClick={handleMapClick}
                  />
                )}
              </GoogleMap>
            </div>
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
