'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import FileUpload from './FileUpload'
import { Map as GoogleMap } from '@/components'
import { MarkerF, Autocomplete } from '@react-google-maps/api'

interface Specimen {
  no: number
  specimen_id: string
  sex_growth: string | null
  size: string | null
  model_url: string | null
  collection_id: number | null
  death_location_text: string | null
  death_latitude: number | null
  death_longitude: number | null
  death_date: string | null
  made_date: string | null
  made_by: string | null
  species_id: number | null
  lifespan: string | null
  diets: string | null
  predators: string | null
  habitats: string | null
  distribution_regions: string | null
  iucn_status_id: number | null
  protection_type_ids: number[] | null
}

interface SpecimenModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  specimen?: Specimen | null
}

const DEFAULT_ZOOM = 15
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }

export default function SpecimenModal({ isOpen, onClose, onSuccess, specimen }: SpecimenModalProps) {
  // 기본 정보
  const [no, setNo] = useState('')
  const [specimenId, setSpecimenId] = useState('')
  const [sexGrowth, setSexGrowth] = useState('')
  const [size, setSize] = useState('')
  const [modelUrl, setModelUrl] = useState('')

  // 소장 및 위치 정보
  const [collectionId, setCollectionId] = useState('')
  const [deathLocationText, setDeathLocationText] = useState('')
  const [deathLatitude, setDeathLatitude] = useState('')
  const [deathLongitude, setDeathLongitude] = useState('')

  // 마커 위치 (맵용)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // 날짜 정보
  const [deathDateType, setDeathDateType] = useState<'full' | 'month'>('full')
  const [deathYear, setDeathYear] = useState('')
  const [deathMonth, setDeathMonth] = useState('')
  const [deathDay, setDeathDay] = useState('')

  const [madeDateType, setMadeDateType] = useState<'full' | 'month'>('full')
  const [madeYear, setMadeYear] = useState('')
  const [madeMonth, setMadeMonth] = useState('')
  const [madeDay, setMadeDay] = useState('')

  const [madeBy, setMadeBy] = useState('')

  // 생물 정보
  const [speciesId, setSpeciesId] = useState('')
  const [lifespan, setLifespan] = useState('')
  const [diets, setDiets] = useState('')
  const [predators, setPredators] = useState('')
  const [habitats, setHabitats] = useState('')
  const [distributionRegions, setDistributionRegions] = useState('')

  // 보호 상태
  const [iucnStatusId, setIucnStatusId] = useState('')
  const [protectionTypeIds, setProtectionTypeIds] = useState<number[]>([])

  // 참조 데이터
  const [collections, setCollections] = useState<any[]>([])
  const [speciesList, setSpeciesList] = useState<any[]>([])
  const [iucnStatuses, setIucnStatuses] = useState<any[]>([])
  const [protectionTypes, setProtectionTypes] = useState<any[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'bio' | 'protection'>('basic')
  const [originalModelUrl, setOriginalModelUrl] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const isEditMode = !!specimen

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData()
    }
  }, [isOpen])

  // 좌표 입력 시 마커 위치 업데이트
  useEffect(() => {
    const lat = parseFloat(deathLatitude)
    const lng = parseFloat(deathLongitude)

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMarkerPosition({ lat, lng })

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng })
      }
    } else if (!deathLatitude.trim() && !deathLongitude.trim()) {
      setMarkerPosition(null)
    }
  }, [deathLatitude, deathLongitude])

  useEffect(() => {
    if (specimen) {
      setNo(specimen.no.toString())
      setSpecimenId(specimen.specimen_id)
      setSexGrowth(specimen.sex_growth || '')
      setSize(specimen.size || '')
      setModelUrl(specimen.model_url || '')
      setOriginalModelUrl(specimen.model_url || '')
      setCollectionId(specimen.collection_id?.toString() || '')
      setDeathLocationText(specimen.death_location_text || '')
      setDeathLatitude(specimen.death_latitude?.toString() || '')
      setDeathLongitude(specimen.death_longitude?.toString() || '')

      // 마커 위치 설정
      if (specimen.death_latitude && specimen.death_longitude) {
        setMarkerPosition({
          lat: specimen.death_latitude,
          lng: specimen.death_longitude,
        })
      } else {
        setMarkerPosition(null)
      }

      setMadeBy(specimen.made_by || '')
      setSpeciesId(specimen.species_id?.toString() || '')
      setLifespan(specimen.lifespan || '')
      setDiets(specimen.diets || '')
      setPredators(specimen.predators || '')
      setHabitats(specimen.habitats || '')
      setDistributionRegions(specimen.distribution_regions || '')
      setIucnStatusId(specimen.iucn_status_id?.toString() || '')
      setProtectionTypeIds(specimen.protection_type_ids || [])

      // 사망 날짜 파싱
      if (specimen.death_date) {
        const parts = specimen.death_date.split('-')

        if (parts.length === 3) {
          setDeathYear(parts[0] || '')
          setDeathMonth(parts[1] || '')
          setDeathDay(parts[2] || '')
          setDeathDateType('full')
        } else if (parts.length === 2) {
          setDeathYear(parts[0] || '')
          setDeathMonth(parts[1] || '')
          setDeathDay('')
          setDeathDateType('month')
        } else {
          setDeathYear('')
          setDeathMonth('')
          setDeathDay('')
          setDeathDateType('full')
        }
      } else {
        setDeathYear('')
        setDeathMonth('')
        setDeathDay('')
        setDeathDateType('full')
      }

      // 제작 날짜 파싱
      if (specimen.made_date) {
        const parts = specimen.made_date.split('-')

        if (parts.length === 3) {
          setMadeYear(parts[0] || '')
          setMadeMonth(parts[1] || '')
          setMadeDay(parts[2] || '')
          setMadeDateType('full')
        } else if (parts.length === 2) {
          setMadeYear(parts[0] || '')
          setMadeMonth(parts[1] || '')
          setMadeDay('')
          setMadeDateType('month')
        } else {
          setMadeYear('')
          setMadeMonth('')
          setMadeDay('')
          setMadeDateType('full')
        }
      } else {
        setMadeYear('')
        setMadeMonth('')
        setMadeDay('')
        setMadeDateType('full')
      }
    } else {
      resetForm()
    }
    setError('')
    setSuccess('')
    setUploadedFiles([])
  }, [specimen, isOpen])

  const resetForm = () => {
    setNo('')
    setSpecimenId('')
    setSexGrowth('')
    setSize('')
    setModelUrl('')
    setOriginalModelUrl('')
    setCollectionId('')
    setDeathLocationText('')
    setDeathLatitude('')
    setDeathLongitude('')
    setMarkerPosition(null)
    setDeathDateType('full')
    setDeathYear('')
    setDeathMonth('')
    setDeathDay('')
    setMadeDateType('full')
    setMadeYear('')
    setMadeMonth('')
    setMadeDay('')
    setMadeBy('')
    setSpeciesId('')
    setLifespan('')
    setDiets('')
    setPredators('')
    setHabitats('')
    setDistributionRegions('')
    setIucnStatusId('')
    setProtectionTypeIds([])
    setUploadedFiles([])
  }

  const fetchReferenceData = async () => {
    try {
      const [collectionsRes, speciesRes, iucnRes, protectionRes] = await Promise.all([
        supabase.from('collections').select('*').order('id', { ascending: true }),
        supabase.from('species').select('*').order('name_kr', { ascending: true }),
        supabase.from('iucn_statuses').select('*').order('sort_order', { ascending: true }),
        supabase.from('protection_types').select('*').order('id', { ascending: true }),
      ])

      if (collectionsRes.data) setCollections(collectionsRes.data)
      if (speciesRes.data) setSpeciesList(speciesRes.data)
      if (iucnRes.data) setIucnStatuses(iucnRes.data)
      if (protectionRes.data) setProtectionTypes(protectionRes.data)
    } catch (error) {
      console.error('Error fetching reference data:', error)
    }
  }

  // Autocomplete 로드
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  // 장소 선택
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()

      if (!place.geometry || !place.geometry.location) {
        setError('자동완성 목록에서 장소를 선택해주세요.')
        setTimeout(() => setError(''), 3000)
        return
      }

      setError('')

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      setDeathLocationText(place.formatted_address || '')
      setDeathLatitude(lat.toFixed(8))
      setDeathLongitude(lng.toFixed(8))
      setMarkerPosition({ lat, lng })

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng })
        mapRef.current.setZoom(17)
      }
    }
  }

  // 마커 드래그
  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      setDeathLatitude(newLat.toFixed(8))
      setDeathLongitude(newLng.toFixed(8))
      setMarkerPosition({ lat: newLat, lng: newLng })

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        {
          location: { lat: newLat, lng: newLng },
          language: 'ko',
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setDeathLocationText(results[0].formatted_address)
          }
        },
      )
    }
  }

  // 맵 클릭
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      setDeathLatitude(newLat.toFixed(8))
      setDeathLongitude(newLng.toFixed(8))
      setMarkerPosition({ lat: newLat, lng: newLng })

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        {
          location: { lat: newLat, lng: newLng },
          language: 'ko',
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setDeathLocationText(results[0].formatted_address)
          }
        },
      )
    }
  }

  const handleProtectionTypeToggle = (typeId: number) => {
    setProtectionTypeIds((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const handleFileUploadSuccess = (url: string) => {
    if (url && url !== originalModelUrl) {
      setUploadedFiles((prev) => [...prev, url])
    }
    setModelUrl(url)
  }

  const cleanupUploadedFiles = async () => {
    for (const url of uploadedFiles) {
      try {
        const { data: existingSpecimens } = await supabase.from('specimens').select('no').eq('model_url', url)

        if (existingSpecimens && existingSpecimens.length > 0) {
          console.log(`⚠️ File ${url} is used by specimens, skipping deletion`)
          continue
        }

        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          console.log('🗑️ Deleting unused file:', filePath)
          await supabase.storage.from('specimen-models').remove([filePath])
        }
      } catch (error) {
        console.error('Failed to cleanup file:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isEditMode && !no.trim()) {
      setError('표본 번호를 입력해주세요.')
      return
    }

    if (!specimenId.trim()) {
      setError('표본 ID를 입력해주세요.')
      return
    }

    let lat: number | null = null
    let lng: number | null = null

    if (deathLatitude.trim()) {
      lat = parseFloat(deathLatitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setError('위도는 -90에서 90 사이의 숫자여야 합니다.')
        return
      }
    }

    if (deathLongitude.trim()) {
      lng = parseFloat(deathLongitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setError('경도는 -180에서 180 사이의 숫자여야 합니다.')
        return
      }
    }

    if ((deathLatitude.trim() && !deathLongitude.trim()) || (!deathLatitude.trim() && deathLongitude.trim())) {
      setError('위도와 경도는 함께 입력해야 합니다.')
      return
    }

    let deathDate: string | null = null
    if (deathYear && deathMonth) {
      if (deathDateType === 'full' && deathDay) {
        deathDate = `${deathYear}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`
      } else if (deathDateType === 'month') {
        deathDate = `${deathYear}-${deathMonth.padStart(2, '0')}`
      }
    }

    let madeDate: string | null = null
    if (madeYear && madeMonth) {
      if (madeDateType === 'full' && madeDay) {
        madeDate = `${madeYear}-${madeMonth.padStart(2, '0')}-${madeDay.padStart(2, '0')}`
      } else if (madeDateType === 'month') {
        madeDate = `${madeYear}-${madeMonth.padStart(2, '0')}`
      }
    }

    setLoading(true)

    try {
      const url = isEditMode ? '/api/specimens/update' : '/api/specimens/create'

      const body: any = {
        specimen_id: specimenId.trim(),
        sex_growth: sexGrowth.trim() || null,
        size: size.trim() || null,
        model_url: modelUrl.trim() || null,
        collection_id: collectionId ? parseInt(collectionId) : null,
        death_location_text: deathLocationText.trim() || null,
        death_latitude: lat,
        death_longitude: lng,
        death_date: deathDate,
        made_date: madeDate,
        made_by: madeBy.trim() || null,
        species_id: speciesId ? parseInt(speciesId) : null,
        lifespan: lifespan.trim() || null,
        diets: diets.trim() || null,
        predators: predators.trim() || null,
        habitats: habitats.trim() || null,
        distribution_regions: distributionRegions.trim() || null,
        iucn_status_id: iucnStatusId ? parseInt(iucnStatusId) : null,
        protection_type_ids: protectionTypeIds.length > 0 ? protectionTypeIds : null,
      }

      if (isEditMode) {
        body.no = specimen.no
      } else {
        body.no = parseInt(no)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedFiles([])

        if (isEditMode && originalModelUrl && originalModelUrl !== modelUrl && modelUrl) {
          try {
            const { data: otherSpecimens } = await supabase
              .from('specimens')
              .select('no')
              .eq('model_url', originalModelUrl)
              .neq('no', specimen.no)

            if (otherSpecimens && otherSpecimens.length > 0) {
              console.log('⚠️ File is used by other specimens, skipping deletion')
            } else {
              const urlObj = new URL(originalModelUrl)
              const pathParts = urlObj.pathname.split('/')
              const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')
              if (bucketIndex !== -1) {
                const filePath = pathParts.slice(bucketIndex + 1).join('/')
                console.log('🗑️ Deleting old file:', filePath)
                await supabase.storage.from('specimen-models').remove([filePath])
              }
            }
          } catch (error) {
            console.error('Failed to delete old file:', error)
          }
        }

        setSuccess(isEditMode ? '표본이 수정되었습니다.' : '표본이 추가되었습니다.')
        setTimeout(() => {
          onSuccess()
          resetForm()
          setError('')
          setSuccess('')
          setActiveTab('basic')
          onClose()
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

  const handleClose = async () => {
    if (uploadedFiles.length > 0) {
      await cleanupUploadedFiles()
    }

    resetForm()
    setError('')
    setSuccess('')
    setActiveTab('basic')
    onClose()
  }

  const mapCenter = markerPosition || DEFAULT_CENTER

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg w-full max-w-6xl h-[85vh] flex flex-col'>
        <div className='p-6'>
          <h2 className='text-2xl font-bold'>{isEditMode ? '표본 수정' : '새 표본 추가'}</h2>
        </div>

        {/* 탭 네비게이션 */}
        <div className='flex border-b'>
          <button
            type='button'
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'basic' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            기본 정보
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('location')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'location'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            소장/위치
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('bio')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'bio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            생물 정보
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('protection')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'protection'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            보호 상태
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-6'>
            {error && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>
            )}

            {success && (
              <div className='mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
            )}

            {/* 기본 정보 탭 */}
            {activeTab === 'basic' && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      표본 번호 (No) <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      value={no}
                      onChange={(e) => setNo(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      disabled={loading || isEditMode}
                      placeholder='예: 1'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      표본 ID <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={specimenId}
                      onChange={(e) => setSpecimenId(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      disabled={loading}
                      placeholder='예: SP0017'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>성별/성장단계</label>
                    <input
                      type='text'
                      value={sexGrowth}
                      onChange={(e) => setSexGrowth(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      disabled={loading}
                      placeholder='예: 성체/암컷'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>크기</label>
                    <input
                      type='text'
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      disabled={loading}
                      placeholder='예: 50cm'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>3D 모델 파일</label>
                  <FileUpload currentUrl={modelUrl} onUploadSuccess={handleFileUploadSuccess} disabled={loading} />
                </div>
              </div>
            )}

            {/* 소장/위치 탭 */}
            {activeTab === 'location' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* 왼쪽: 입력 폼 */}
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>소장처</label>
                    <select
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      disabled={loading}
                    >
                      <option value=''>선택 안 함</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.institution_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 🔥 주소 검색 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>사망 위치 검색</label>
                    <Autocomplete
                      onLoad={onLoadAutocomplete}
                      onPlaceChanged={onPlaceChanged}
                      options={{
                        componentRestrictions: { country: 'kr' }, // 한국으로 제한
                        fields: ['formatted_address', 'geometry', 'name'],
                      }}
                    >
                      <input
                        type='text'
                        value={deathLocationText}
                        onChange={(e) => setDeathLocationText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                          }
                        }}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        disabled={loading}
                        placeholder='예: 서울특별시 강남구'
                      />
                    </Autocomplete>
                    <p className='mt-1 text-xs text-gray-500'>🔍 장소명이나 주소를 입력하세요</p>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>사망 위치 위도</label>
                      <input
                        type='text'
                        value={deathLatitude}
                        onChange={(e) => setDeathLatitude(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        disabled={loading}
                        placeholder='예: 37.427715'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>사망 위치 경도</label>
                      <input
                        type='text'
                        value={deathLongitude}
                        onChange={(e) => setDeathLongitude(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        disabled={loading}
                        placeholder='예: 127.016968'
                      />
                    </div>
                  </div>

                  <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                    <p className='text-sm text-blue-800 font-semibold mb-2'>💡 위치 설정 방법</p>
                    <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                      <li>
                        🔍 <strong>주소 검색:</strong> 장소명이나 주소 입력
                      </li>
                      <li>
                        📍 <strong>지도 클릭:</strong> 원하는 위치 클릭
                      </li>
                      <li>
                        🖱️ <strong>마커 드래그:</strong> 마커를 끌어서 조정
                      </li>
                      <li>
                        ⌨️ <strong>직접 입력:</strong> 위도/경도 수동 입력
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>사망 날짜</label>
                    <div className='space-y-2'>
                      <select
                        value={deathDateType}
                        onChange={(e) => {
                          setDeathDateType(e.target.value as 'full' | 'month')
                          if (e.target.value === 'month') {
                            setDeathDay('')
                          }
                        }}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        disabled={loading}
                      >
                        <option value='month'>년/월만</option>
                        <option value='full'>전체 날짜 (년/월/일)</option>
                      </select>

                      <div className='flex flex-row gap-2'>
                        <div className='flex-1'>
                          <input
                            type='number'
                            value={deathYear}
                            onChange={(e) => setDeathYear(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            disabled={loading}
                            placeholder='년 (YYYY)'
                            min='1900'
                            max='2100'
                          />
                        </div>
                        <div className='flex-1'>
                          <input
                            type='number'
                            value={deathMonth}
                            onChange={(e) => setDeathMonth(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            disabled={loading}
                            placeholder='월 (MM)'
                            min='1'
                            max='12'
                          />
                        </div>
                        {deathDateType === 'full' && (
                          <div className='flex-1'>
                            <input
                              type='number'
                              value={deathDay}
                              onChange={(e) => setDeathDay(e.target.value)}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                              disabled={loading}
                              placeholder='일 (DD)'
                              min='1'
                              max='31'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>제작 날짜</label>
                      <div className='space-y-2'>
                        <select
                          value={madeDateType}
                          onChange={(e) => {
                            setMadeDateType(e.target.value as 'full' | 'month')
                            if (e.target.value === 'month') {
                              setMadeDay('')
                            }
                          }}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                          disabled={loading}
                        >
                          <option value='month'>년/월만</option>
                          <option value='full'>전체 날짜 (년/월/일)</option>
                        </select>

                        <div className='flex flex-row gap-2'>
                          <div className='flex-1'>
                            <input
                              type='number'
                              value={madeYear}
                              onChange={(e) => setMadeYear(e.target.value)}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                              disabled={loading}
                              placeholder='년'
                              min='1900'
                              max='2100'
                            />
                          </div>
                          <div className='flex-1'>
                            <input
                              type='number'
                              value={madeMonth}
                              onChange={(e) => setMadeMonth(e.target.value)}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                              disabled={loading}
                              placeholder='월'
                              min='1'
                              max='12'
                            />
                          </div>
                          {madeDateType === 'full' && (
                            <div className='flex-1'>
                              <input
                                type='number'
                                value={madeDay}
                                onChange={(e) => setMadeDay(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                disabled={loading}
                                placeholder='일'
                                min='1'
                                max='31'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>제작자</label>
                      <input
                        type='text'
                        value={madeBy}
                        onChange={(e) => setMadeBy(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        disabled={loading}
                        placeholder='예: 홍길동'
                      />
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 구글맵 */}
                <div className='w-full h-[600px] rounded-lg overflow-hidden border-2 border-gray-300'>
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
            )}

            {/* 생물 정보 탭 */}
            {activeTab === 'bio' && (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>생물종</label>
                  <select
                    value={speciesId}
                    onChange={(e) => setSpeciesId(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                  >
                    <option value=''>선택 안 함</option>
                    {speciesList.map((species) => (
                      <option key={species.id} value={species.id}>
                        {species.name_kr} {species.name_sci && `(${species.name_sci})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>수명</label>
                  <input
                    type='text'
                    value={lifespan}
                    onChange={(e) => setLifespan(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    placeholder='예: 10-15년'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>식성</label>
                  <textarea
                    value={diets}
                    onChange={(e) => setDiets(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    rows={2}
                    placeholder='예: 육식성, 주로 물고기'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>천적</label>
                  <textarea
                    value={predators}
                    onChange={(e) => setPredators(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    rows={2}
                    placeholder='예: 대형 맹금류'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>서식지</label>
                  <textarea
                    value={habitats}
                    onChange={(e) => setHabitats(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    rows={2}
                    placeholder='예: 하천, 호수'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>분포 지역</label>
                  <textarea
                    value={distributionRegions}
                    onChange={(e) => setDistributionRegions(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                    rows={2}
                    placeholder='예: 한국, 중국, 러시아'
                  />
                </div>
              </div>
            )}

            {/* 보호 상태 탭 */}
            {activeTab === 'protection' && (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>IUCN 등급</label>
                  <select
                    value={iucnStatusId}
                    onChange={(e) => setIucnStatusId(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    disabled={loading}
                  >
                    <option value=''>선택 안 함</option>
                    {iucnStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.code} - {status.name_kr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>국가보호종 (복수 선택 가능)</label>

                  <div className='flex flex-wrap gap-2 mb-4'>
                    {protectionTypes.length === 0 ? (
                      <p className='text-sm text-gray-500'>등록된 보호종이 없습니다.</p>
                    ) : (
                      protectionTypes.map((type) => {
                        const isSelected = protectionTypeIds.includes(type.id)
                        return (
                          <button
                            key={type.id}
                            type='button'
                            onClick={() => handleProtectionTypeToggle(type.id)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isSelected && <span className='mr-1'>✓</span>}
                            {type.name}
                          </button>
                        )
                      })
                    )}
                  </div>

                  {protectionTypeIds.length > 0 && (
                    <div className='border border-gray-300 rounded-md p-4 bg-gray-50'>
                      <p className='text-xs font-medium text-gray-700 mb-2'>
                        선택된 보호종 ({protectionTypeIds.length}개)
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {protectionTypeIds.map((typeId) => {
                          const type = protectionTypes.find((t) => t.id === typeId)
                          if (!type) return null
                          return (
                            <div
                              key={typeId}
                              className='inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                            >
                              <span>{type.name}</span>
                              <button
                                type='button'
                                onClick={() => handleProtectionTypeToggle(typeId)}
                                disabled={loading}
                                className='ml-2 text-blue-600 hover:text-blue-800 font-bold'
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {protectionTypeIds.length === 0 && (
                    <div className='border border-gray-200 rounded-md p-4 bg-gray-50'>
                      <p className='text-sm text-gray-500 text-center'>선택된 보호종이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='border-t p-6 flex space-x-3'>
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
