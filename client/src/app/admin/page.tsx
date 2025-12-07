'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    specimens: 0,
    species: 0,
    classifications: 0,
    collections: 0,
    iucn: 0,
    protection: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [specimens, species, classifications, collections, iucn, protection] = await Promise.all([
        supabase.from('specimens').select('*', { count: 'exact', head: true }),
        supabase.from('species').select('*', { count: 'exact', head: true }),
        supabase.from('classifications').select('*', { count: 'exact', head: true }),
        supabase.from('collections').select('*', { count: 'exact', head: true }),
        supabase.from('iucn_statuses').select('*', { count: 'exact', head: true }),
        supabase.from('protection_types').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        specimens: specimens.count || 0,
        species: species.count || 0,
        classifications: classifications.count || 0,
        collections: collections.count || 0,
        iucn: iucn.count || 0,
        protection: protection.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className='text-center py-8'>로딩중...</div>
  }

  const cards = [
    { title: '표본', count: stats.specimens, href: '/admin/specimens', color: 'bg-blue-500' },
    { title: '생물종', count: stats.species, href: '/admin/species', color: 'bg-green-500' },
    { title: '분류', count: stats.classifications, href: '/admin/classifications', color: 'bg-purple-500' },
    { title: '소장처', count: stats.collections, href: '/admin/collections', color: 'bg-yellow-500' },
    { title: 'IUCN 등급', count: stats.iucn, href: '/admin/iucn', color: 'bg-red-500' },
    { title: '보호종', count: stats.protection, href: '/admin/protection', color: 'bg-indigo-500' },
  ]

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>대시보드</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className='block bg-white rounded-lg shadow hover:shadow-lg transition-shadow'
          >
            <div className='p-6'>
              <div className={`inline-block p-3 rounded-lg ${card.color} text-white mb-4`}>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>{card.title}</h3>
              <p className='text-3xl font-bold text-gray-900 mt-2'>{card.count}</p>
              <p className='text-sm text-gray-500 mt-1'>총 {card.count}개</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
