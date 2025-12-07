'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ChangePasswordModal from './components/ChangePasswordModal'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Session check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  if (pathname === '/admin/login') {
    return children
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-gray-600'>로딩중...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-3 lg:pt-5 gap-2 sm:gap-4 lg:gap-6 flex flex-col justify-center items-center '>
          <div className='flex justify-between items-center w-full'>
            <div className='flex items-center space-x-8'>
              <h1 className='text-xl font-bold'>표본 관리 시스템</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-gray-700'>{user?.username}님</span>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className='px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300'
              >
                비밀번호 변경
              </button>
              <button
                onClick={handleLogout}
                className='px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700'
              >
                로그아웃
              </button>
            </div>
          </div>
          <div className='flex justify-between items-center w-full'>
            <Link
              href='/admin'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname === '/admin'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:border-black hover:text-black'
              }`}
            >
              대시보드
            </Link>
            <Link
              href='/admin/specimens'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/specimens')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              표본 관리
            </Link>
            <Link
              href='/admin/species'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/species')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              생물종
            </Link>
            <Link
              href='/admin/classifications'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/classifications')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              분류
            </Link>
            <Link
              href='/admin/collections'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/collections')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              소장처
            </Link>
            <Link
              href='/admin/iucn'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/iucn')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              IUCN 등급
            </Link>
            <Link
              href='/admin/protection'
              className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                pathname.startsWith('/admin/protection')
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              보호종
            </Link>
          </div>
        </div>
      </nav>
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>{children}</main>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  )
}
