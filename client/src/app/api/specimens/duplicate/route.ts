import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { original_no, new_no, new_specimen_id } = await request.json()

    if (!original_no || !new_no || !new_specimen_id) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
    }

    // No 중복 확인
    const { data: existingNo } = await supabase.from('specimens').select('no').eq('no', new_no).single()

    if (existingNo) {
      return NextResponse.json({ error: '이미 존재하는 표본 번호입니다.' }, { status: 400 })
    }

    // specimen_id 중복 확인
    const { data: existingId } = await supabase
      .from('specimens')
      .select('no')
      .eq('specimen_id', new_specimen_id.trim())
      .single()

    if (existingId) {
      return NextResponse.json({ error: '이미 존재하는 표본 ID입니다.' }, { status: 400 })
    }

    // 원본 표본 조회
    const { data: original, error: fetchError } = await supabase
      .from('specimens')
      .select('*')
      .eq('no', original_no)
      .single()

    if (fetchError || !original) {
      return NextResponse.json({ error: '원본 표본을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 새 표본 생성 (no와 specimen_id만 변경)
    const { no: _, created_at, updated_at, ...dataToClone } = original

    const newSpecimen = {
      ...dataToClone,
      no: new_no,
      specimen_id: new_specimen_id.trim(),
    }

    const { data, error } = await supabase.from('specimens').insert([newSpecimen]).select().single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '표본이 복제되었습니다.',
      data,
    })
  } catch (error) {
    console.error('Duplicate specimen error:', error)
    return NextResponse.json({ error: '표본 복제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
