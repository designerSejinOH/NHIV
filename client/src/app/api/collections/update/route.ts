import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id, institution_name, address, latitude, longitude } = await request.json()

    if (!id) {
      return NextResponse.json({ error: '소장처 ID가 필요합니다.' }, { status: 400 })
    }

    if (!institution_name || !institution_name.trim()) {
      return NextResponse.json({ error: '기관명을 입력해주세요.' }, { status: 400 })
    }

    // 기관명 중복 확인 (자기 자신 제외)
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('institution_name', institution_name.trim())
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 기관명입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('collections')
      .update({
        institution_name: institution_name.trim(),
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '소장처가 수정되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Update collection error:', error)
    return NextResponse.json({ error: '소장처 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
