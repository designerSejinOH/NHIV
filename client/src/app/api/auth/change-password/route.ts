import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 세션에서 사용자 정보 가져오기
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'))

    const { currentPassword, newPassword } = await request.json()

    // 현재 비밀번호 확인
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', session.userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
    }

    // 비밀번호 업데이트
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password: newPassword })
      .eq('id', session.userId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: '비밀번호 변경 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
