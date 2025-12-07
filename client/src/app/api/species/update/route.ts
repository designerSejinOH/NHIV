import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id, name_kr, name_en, name_sci, class_id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: '생물종 ID가 필요합니다.' }, { status: 400 })
    }

    if (!name_kr || !name_kr.trim()) {
      return NextResponse.json({ error: '한글명을 입력해주세요.' }, { status: 400 })
    }

    // 한글명 중복 확인 (자기 자신 제외)
    const { data: existing } = await supabase
      .from('species')
      .select('id')
      .eq('name_kr', name_kr.trim())
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 한글명입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('species')
      .update({
        name_kr: name_kr.trim(),
        name_en: name_en || null,
        name_sci: name_sci || null,
        class_id: class_id || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '생물종이 수정되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Update species error:', error)
    return NextResponse.json({ error: '생물종 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
