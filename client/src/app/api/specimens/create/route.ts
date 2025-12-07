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
      return NextResponse.json({ error: '표본 번호를 입력해주세요.' }, { status: 400 })
    }

    if (!body.specimen_id || !body.specimen_id.trim()) {
      return NextResponse.json({ error: '표본 ID를 입력해주세요.' }, { status: 400 })
    }

    // No 중복 확인
    const { data: existingNo } = await supabase.from('specimens').select('no').eq('no', body.no).single()

    if (existingNo) {
      return NextResponse.json({ error: '이미 존재하는 표본 번호입니다.' }, { status: 400 })
    }

    // specimen_id 중복 확인
    const { data: existingId } = await supabase
      .from('specimens')
      .select('no')
      .eq('specimen_id', body.specimen_id.trim())
      .single()

    if (existingId) {
      return NextResponse.json({ error: '이미 존재하는 표본 ID입니다.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('specimens').insert([body]).select().single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '표본이 추가되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Create specimen error:', error)
    return NextResponse.json({ error: '표본 추가 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
