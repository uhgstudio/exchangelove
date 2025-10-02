import { createClient } from './supabase/server'

export async function getCurrentUserServer() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { error: error.message }
    }

    if (!user) {
      return { user: null }
    }

    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return { error: userError.message }
    }

    return { user: userData }
  } catch (error) {
    return { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}
