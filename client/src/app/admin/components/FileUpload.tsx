'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface FileUploadProps {
  currentUrl: string | null
  onUploadSuccess: (url: string) => void
  disabled?: boolean
}

export default function FileUpload({ currentUrl, onUploadSuccess, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('📤 Upload started...')
      setUploadError('')
      setUploading(true)

      if (!e.target.files || e.target.files.length === 0) {
        console.log('❌ No file selected')
        setUploading(false)
        return
      }

      const file = e.target.files[0]
      console.log('📁 File:', file.name, file.size, 'bytes')

      // 파일 형식 검증 (3D 모델 형식)
      const allowedExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.usdz']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

      if (!allowedExtensions.includes(fileExtension)) {
        setUploadError('지원하는 3D 모델 형식: .glb, .gltf, .obj, .fbx, .usdz')
        setUploading(false)
        return
      }

      // 파일 크기 검증 (50MB 제한)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        setUploadError('파일 크기는 50MB를 초과할 수 없습니다.')
        setUploading(false)
        return
      }

      // 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}-${randomStr}${fileExtension}`
      const filePath = `models/${fileName}`

      console.log('📝 File path:', filePath)

      // Supabase Storage에 업로드
      console.log('⬆️ Uploading to Supabase...')
      const { data, error } = await supabase.storage.from('specimen-models').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        console.error('❌ Upload error:', error)
        throw error
      }

      console.log('✅ Upload successful:', data)

      // Public URL 생성 (수정된 부분)
      const {
        data: { publicUrl },
      } = supabase.storage.from('specimen-models').getPublicUrl(filePath)

      console.log('🔗 Public URL:', publicUrl)

      onUploadSuccess(publicUrl)

      // 입력 필드 초기화
      e.target.value = ''
    } catch (error: any) {
      console.error('💥 Upload failed:', error)
      setUploadError(error.message || '파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!currentUrl || !confirm('파일을 삭제하시겠습니까?')) return

    try {
      setUploading(true)
      console.log('🗑️ Deleting:', currentUrl)

      // URL에서 파일 경로 추출
      const url = new URL(currentUrl)
      const pathParts = url.pathname.split('/')

      // 'specimen-models' 다음부터가 실제 파일 경로
      const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')
      if (bucketIndex === -1) {
        throw new Error('Invalid URL format')
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/')
      console.log('📍 File path:', filePath)

      // Storage에서 파일 삭제
      const { error } = await supabase.storage.from('specimen-models').remove([filePath])

      if (error) {
        console.error('❌ Delete error:', error)
        throw error
      }

      console.log('✅ Deleted')
      onUploadSuccess('')
    } catch (error: any) {
      console.error('💥 Delete failed:', error)
      setUploadError('파일 삭제 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <label className='flex-1'>
          <input
            type='file'
            accept='.glb,.gltf,.obj,.fbx,.usdz'
            onChange={handleFileUpload}
            disabled={disabled || uploading}
            className='block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed'
          />
        </label>
        {currentUrl && (
          <button
            type='button'
            onClick={handleRemove}
            disabled={disabled || uploading}
            className='px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50'
          >
            삭제
          </button>
        )}
      </div>

      {uploading && <p className='text-sm text-blue-600'>⏳ 업로드 중...</p>}

      {uploadError && <p className='text-sm text-red-600'>❌ {uploadError}</p>}

      {currentUrl && !uploading && (
        <div className='text-sm'>
          <p className='text-gray-600'>현재 파일:</p>
          <a
            href={currentUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 break-all'
          >
            {currentUrl}
          </a>
        </div>
      )}

      <p className='text-xs text-gray-500'>지원 형식: .glb, .gltf, .obj, .fbx, .usdz (최대 50MB)</p>
    </div>
  )
}
