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

  /** ──────────────────────────────
   *  Session Check
   *  ────────────────────────────── */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  /** ──────────────────────────────
   *  Navigation Items
   *  ────────────────────────────── */
  const navItems = [
    { href: '/admin', label: '전체', exact: true },
    { href: '/admin/specimens', label: '표본 관리' },
    { href: '/admin/species', label: '생물종' },
    { href: '/admin/classifications', label: '분류' },
    { href: '/admin/collections', label: '소장처' },
    { href: '/admin/iucn', label: 'IUCN 등급' },
    { href: '/admin/protection', label: '보호종' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  /** ──────────────────────────────
   *  Render
   *  ────────────────────────────── */

  // 로그인 페이지는 레이아웃 적용하지 않음
  if (pathname === '/admin/login') return children

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-gray-600'>로딩중...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* 헤더 */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 flex flex-col gap-4'>
          {/* 상단: 타이틀 + 유저 */}
          <div className='flex justify-between items-center w-full'>
            <h1 className='text-xl font-bold'>표본 관리 시스템</h1>

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

          {/* 네비게이션 */}
          <div className='flex w-full'>
            {navItems.map(({ href, label, exact }) => {
              const active = isActive(href, exact)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 flex-1 border-b-2 text-center text-sm font-medium transition-all ${
                    active
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:border-black hover:text-black'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>{children}</main>

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  )
}
