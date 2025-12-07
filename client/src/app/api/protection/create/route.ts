import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '보호종 유형을 입력해주세요.' }, { status: 400 })
    }

    // 중복 확인
    const { data: existing } = await supabase.from('protection_types').select('id').eq('name', name.trim()).single()

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 보호종 유형입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('protection_types')
      .insert([{ name: name.trim() }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '보호종이 추가되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Create protection type error:', error)
    return NextResponse.json({ error: '보호종 추가 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
