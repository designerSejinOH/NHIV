import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { institution_name, address, latitude, longitude } = await request.json()

    if (!institution_name || !institution_name.trim()) {
      return NextResponse.json({ error: '기관명을 입력해주세요.' }, { status: 400 })
    }

    // 기관명 중복 확인
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('institution_name', institution_name.trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 기관명입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          institution_name: institution_name.trim(),
          address: address || null,
          latitude: latitude || null,
          longitude: longitude || null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '소장처가 추가되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json({ error: '소장처 추가 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
