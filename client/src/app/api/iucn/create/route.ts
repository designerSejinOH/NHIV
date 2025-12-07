import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { code, name_kr, name_en, sort_order } = await request.json()

    if (!code || !code.trim()) {
      return NextResponse.json({ error: '코드를 입력해주세요.' }, { status: 400 })
    }

    if (!name_kr || !name_kr.trim()) {
      return NextResponse.json({ error: '한글명을 입력해주세요.' }, { status: 400 })
    }

    if (!name_en || !name_en.trim()) {
      return NextResponse.json({ error: '영문명을 입력해주세요.' }, { status: 400 })
    }

    if (!sort_order || sort_order < 1) {
      return NextResponse.json({ error: '정렬 순서는 1 이상이어야 합니다.' }, { status: 400 })
    }

    // 코드 중복 확인
    const { data: existingCode } = await supabase
      .from('iucn_statuses')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (existingCode) {
      return NextResponse.json({ error: '이미 존재하는 코드입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('iucn_statuses')
      .insert([
        {
          code: code.trim().toUpperCase(),
          name_kr: name_kr.trim(),
          name_en: name_en.trim(),
          sort_order,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'IUCN 등급이 추가되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Create IUCN status error:', error)
    return NextResponse.json({ error: 'IUCN 등급 추가 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
