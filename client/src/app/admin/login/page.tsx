'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordInput from '../components/PasswordInput'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || '로그인에 실패했습니다.')
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <div>
          <h2 className='text-center text-3xl font-bold text-gray-900'>관리자 로그인</h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>{error}</div>}
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium text-gray-700'>
                아이디
              </label>
              <input
                id='username'
                name='username'
                type='text'
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <PasswordInput
              id='password'
              label='비밀번호'
              value={password}
              onChange={setPassword}
              required
              disabled={loading}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
