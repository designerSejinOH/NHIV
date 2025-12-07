'use client'

import { useState } from 'react'
import PasswordInput from './PasswordInput'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (newPassword.length < 4) {
      setError('새 비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (currentPassword === newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        // 2초 후 모달 닫기
        setTimeout(() => {
          onClose()
          setSuccess('')
        }, 2000)
      } else {
        setError(data.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch (err) {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4'>비밀번호 변경</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded'>{success}</div>
          )}

          <PasswordInput
            id='currentPassword'
            label='현재 비밀번호'
            value={currentPassword}
            onChange={setCurrentPassword}
            disabled={loading}
          />

          <PasswordInput
            id='newPassword'
            label='새 비밀번호'
            value={newPassword}
            onChange={setNewPassword}
            disabled={loading}
          />

          <PasswordInput
            id='confirmPassword'
            label='새 비밀번호 확인'
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={loading}
          />

          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '변경 중...' : '변경하기'}
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
