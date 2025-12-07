import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.no) {
      return NextResponse.json({ error: '표본 번호가 필요합니다.' }, { status: 400 })
    }

    if (!body.specimen_id || !body.specimen_id.trim()) {
      return NextResponse.json({ error: '표본 ID를 입력해주세요.' }, { status: 400 })
    }

    // specimen_id 중복 확인 (자기 자신 제외)
    const { data: existingId } = await supabase
      .from('specimens')
      .select('no')
      .eq('specimen_id', body.specimen_id.trim())
      .neq('no', body.no)
      .single()

    if (existingId) {
      return NextResponse.json({ error: '이미 존재하는 표본 ID입니다.' }, { status: 400 })
    }

    const { no, ...updateData } = body

    const { data, error } = await supabase.from('specimens').update(updateData).eq('no', no).select().single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '표본이 수정되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Update specimen error:', error)
    return NextResponse.json({ error: '표본 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
