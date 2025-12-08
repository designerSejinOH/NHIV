// api/specimens/duplicate/route.ts

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

    // ✅ 3D 모델 파일 복제
    let newModelUrl = original.model_url

    if (original.model_url) {
      try {
        console.log('📋 Duplicating 3D model file...')

        // URL에서 파일 경로 추출
        const url = new URL(original.model_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex((part) => part === 'specimen-models')

        if (bucketIndex !== -1) {
          const originalFilePath = pathParts.slice(bucketIndex + 1).join('/')

          console.log('📁 Original file path:', originalFilePath)

          // 원본 파일 다운로드
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('specimen-models')
            .download(originalFilePath)

          if (downloadError) {
            console.error('❌ Download error:', downloadError)
            throw downloadError
          }

          if (fileData) {
            // 새 파일명 생성
            const fileExtension = originalFilePath.substring(originalFilePath.lastIndexOf('.'))
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            const newFileName = `${timestamp}-${randomStr}${fileExtension}`
            const newFilePath = `models/${newFileName}`

            console.log('📝 New file path:', newFilePath)

            // 새 파일 업로드
            const { error: uploadError } = await supabase.storage
              .from('specimen-models')
              .upload(newFilePath, fileData, {
                cacheControl: '3600',
                upsert: false,
              })

            if (uploadError) {
              console.error('❌ Upload error:', uploadError)
              throw uploadError
            }

            // 새 파일의 Public URL 생성
            const {
              data: { publicUrl },
            } = supabase.storage.from('specimen-models').getPublicUrl(newFilePath)

            newModelUrl = publicUrl
            console.log('✅ 3D model file duplicated successfully')
            console.log('🔗 New URL:', publicUrl)
          }
        }
      } catch (error) {
        console.error('⚠️ Failed to duplicate 3D model file:', error)
        // 파일 복제 실패 시 원본 URL 그대로 사용 (fallback)
        console.log('⚠️ Using original URL as fallback')
      }
    }

    // 새 표본 생성 (no, specimen_id, model_url 변경)
    const { no: _, created_at, updated_at, ...dataToClone } = original

    const newSpecimen = {
      ...dataToClone,
      no: new_no,
      specimen_id: new_specimen_id.trim(),
      model_url: newModelUrl,
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
