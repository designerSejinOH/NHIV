import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id, name, name_en } = await request.json()

    if (!id) {
      return NextResponse.json({ error: '분류 ID가 필요합니다.' }, { status: 400 })
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '분류명을 입력해주세요.' }, { status: 400 })
    }

    // 중복 확인 (자기 자신 제외)
    const { data: existing } = await supabase
      .from('classifications')
      .select('id')
      .eq('name', name.trim())
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 분류명입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('classifications')
      .update({
        name: name.trim(),
        name_en: name_en?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '분류가 수정되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Update classification error:', error)
    return NextResponse.json({ error: '분류 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
