import { createClient } from './supabase/client'
import { Participant, Episode, Season, UserPrediction } from '@/types/database'

const supabase = createClient()

// 시즌 관련 함수들
export async function getSeasons() {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('시즌 조회 오류:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function createSeason(season: Omit<Season, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('seasons')
    .insert(season)
    .select()

  if (error) {
    console.error('시즌 생성 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('시즌 생성 실패')
    return { data: null, error: { message: '시즌 생성에 실패했습니다.' } }
  }

  return { data: data[0], error: null }
}

export async function updateSeason(id: string, updates: Partial<Season>) {
  // 먼저 기존 데이터 조회
  const { data: existingSeasons, error: checkError } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', id)

  if (checkError || !existingSeasons || existingSeasons.length === 0) {
    console.error('시즌을 찾을 수 없습니다:', id)
    return { data: null, error: { message: '시즌을 찾을 수 없습니다.' } }
  }

  const existingSeason = existingSeasons[0]

  // 업데이트 수행
  const { error: updateError } = await supabase
    .from('seasons')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    console.error('시즌 수정 오류:', updateError)
    return { data: null, error: updateError }
  }

  // 업데이트 후 조회
  const { data: updatedData, error: selectError } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', id)

  if (selectError || !updatedData || updatedData.length === 0) {
    // 조회 실패 시 병합된 데이터 반환
    return { data: { ...existingSeason, ...updates }, error: null }
  }

  return { data: updatedData[0], error: null }
}

// 출연자 관련 함수들
export async function getParticipants(seasonId?: string) {
  let query = supabase
    .from('participants')
    .select('*')
    .eq('is_active', true)

  if (seasonId) {
    query = query.eq('season_id', seasonId)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('출연자 조회 오류:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function createParticipant(participant: Omit<Participant, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('participants')
    .insert(participant)
    .select()

  if (error) {
    console.error('출연자 생성 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('출연자 생성 실패')
    return { data: null, error: { message: '출연자 생성에 실패했습니다.' } }
  }

  return { data: data[0], error: null }
}

export async function updateParticipant(id: string, updates: Partial<Participant>) {
  // 먼저 기존 데이터 조회
  const { data: existingParticipants, error: checkError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)

  if (checkError || !existingParticipants || existingParticipants.length === 0) {
    console.error('출연자를 찾을 수 없습니다:', id)
    return { data: null, error: { message: '출연자를 찾을 수 없습니다.' } }
  }

  const existingParticipant = existingParticipants[0]

  // 업데이트 수행
  const { error: updateError } = await supabase
    .from('participants')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    console.error('출연자 수정 오류:', updateError)
    return { data: null, error: updateError }
  }

  // 업데이트 후 조회
  const { data: updatedData, error: selectError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)

  if (selectError || !updatedData || updatedData.length === 0) {
    // 조회 실패 시 병합된 데이터 반환
    return { data: { ...existingParticipant, ...updates }, error: null }
  }

  return { data: updatedData[0], error: null }
}

export async function deleteParticipant(id: string) {
  const { data, error } = await supabase
    .from('participants')
    .update({ is_active: false })
    .eq('id', id)
    .select()

  if (error) {
    console.error('출연자 삭제 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('출연자를 찾을 수 없습니다:', id)
    return { data: null, error: { message: '출연자를 찾을 수 없습니다.' } }
  }

  return { data: data[0], error: null }
}

// 회차 관련 함수들
export async function getEpisodes(seasonId?: string) {
  let query = supabase
    .from('episodes')
    .select(`
      *,
      seasons (
        id,
        title,
        code
      )
    `)

  if (seasonId) {
    query = query.eq('season_id', seasonId)
  }

  const { data, error } = await query.order('number', { ascending: true })

  if (error) {
    console.error('회차 조회 오류:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function getEpisode(id: string) {
  const { data, error } = await supabase
    .from('episodes')
    .select(`
      *,
      seasons (
        id,
        title,
        code
      )
    `)
    .eq('id', id)

  if (error) {
    console.error('회차 조회 오류:', error)
    console.error('회차 ID:', id)
    console.error('오류 상세:', error.message)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('회차를 찾을 수 없습니다:', id)
    return { data: null, error: { message: '회차를 찾을 수 없습니다.' } }
  }

  return { data: data[0], error: null }
}

export async function createEpisode(episode: Omit<Episode, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('episodes')
    .insert(episode)
    .select()

  if (error) {
    console.error('회차 생성 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('회차 생성 실패')
    return { data: null, error: { message: '회차 생성에 실패했습니다.' } }
  }

  return { data: data[0], error: null }
}

export async function updateEpisode(id: string, updates: Partial<Episode>) {
  console.log('=== updateEpisode 시작 ===')
  console.log('ID:', id)
  console.log('업데이트 데이터:', updates)
  
  // 먼저 해당 ID의 회차가 존재하는지 확인
  console.log('1단계: 기존 회차 조회 시작')
  const { data: existingEpisodes, error: checkError } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)

  console.log('기존 회차 조회 결과:', { 
    data: existingEpisodes, 
    error: checkError,
    dataLength: existingEpisodes?.length,
    hasData: !!existingEpisodes && existingEpisodes.length > 0
  })

  if (checkError) {
    console.error('❌ 회차 존재 확인 오류:', checkError)
    console.error('오류 상세:', {
      message: checkError.message,
      details: checkError.details,
      hint: checkError.hint,
      code: checkError.code
    })
    return { data: null, error: { message: `회차를 찾을 수 없습니다. ID: ${id}` } }
  }

  if (!existingEpisodes || existingEpisodes.length === 0) {
    console.error('❌ 회차가 존재하지 않습니다:', id)
    return { data: null, error: { message: `회차가 존재하지 않습니다. ID: ${id}` } }
  }

  const existingEpisode = existingEpisodes[0]
  console.log('✅ 기존 회차 찾음:', existingEpisode)

  // 실제 업데이트 수행
  console.log('2단계: 업데이트 수행 시작')
  const { data: updateResult, error: updateError } = await supabase
    .from('episodes')
    .update(updates)
    .eq('id', id)
    .select()

  console.log('업데이트 결과:', { 
    updateResult, 
    updateError,
    resultLength: updateResult?.length,
    hasResult: !!updateResult && updateResult.length > 0
  })

  if (updateError) {
    console.error('❌ 회차 수정 오류:', updateError)
    console.error('업데이트 오류 상세:', {
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      code: updateError.code
    })
    return { data: null, error: updateError }
  }

  // 업데이트가 실제로 적용되었는지 확인
  if (updateResult && updateResult.length > 0) {
    console.log('✅ 업데이트 성공, 업데이트된 데이터:', updateResult[0])
    return { data: updateResult[0], error: null }
  }

  // 업데이트 후 다시 조회
  console.log('3단계: 업데이트 후 재조회 시작')
  const { data: updatedData, error: selectError } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)

  console.log('재조회 결과:', { 
    updatedData, 
    selectError,
    dataLength: updatedData?.length,
    hasData: !!updatedData && updatedData.length > 0
  })

  if (selectError) {
    console.error('❌ 업데이트 후 조회 오류:', selectError)
    console.error('조회 오류 상세:', {
      message: selectError.message,
      details: selectError.details,
      hint: selectError.hint,
      code: selectError.code
    })
    // 조회 실패 시 기존 데이터 + 업데이트 데이터를 합쳐서 반환
    const mergedData = { ...existingEpisode, ...updates }
    console.log('🔄 병합된 데이터를 반환합니다:', mergedData)
    return { data: mergedData, error: null }
  }

  if (!updatedData || updatedData.length === 0) {
    console.error('❌ 업데이트 후 데이터를 찾을 수 없습니다:', id)
    // 데이터가 없으면 기존 데이터 + 업데이트 데이터를 합쳐서 반환
    const mergedData = { ...existingEpisode, ...updates }
    console.log('🔄 병합된 데이터를 반환합니다:', mergedData)
    return { data: mergedData, error: null }
  }

  console.log('✅ 최종 성공, 업데이트된 데이터:', updatedData[0])
  return { data: updatedData[0], error: null }
}

// 예측 관련 함수들
export async function getUserPredictions(userId: string, episodeId?: string) {
  console.log('=== getUserPredictions 시작 ===')
  console.log('사용자 ID:', userId)
  console.log('회차 ID:', episodeId)
  
  let query = supabase
    .from('user_predictions')
    .select(`
      *,
      episodes (
        id,
        number,
        title,
        status
      )
    `)
    .eq('user_id', userId)

  if (episodeId) {
    query = query.eq('episode_id', episodeId)
  }

  const { data, error } = await query.order('submitted_at', { ascending: false })

  console.log('예측 조회 결과:', { data, error })

  if (error) {
    console.error('❌ 예측 조회 오류:', error)
    console.error('오류 상세:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return { data: null, error }
  }

  // 예측 데이터에 참가자 이름 추가
  if (data && data.length > 0) {
    for (const prediction of data) {
      if (prediction.pairs && Array.isArray(prediction.pairs)) {
        // 각 예측 쌍에 참가자 이름 추가
        for (const pair of prediction.pairs) {
          if (pair.maleId) {
            const { data: maleParticipant } = await supabase
              .from('participants')
              .select('name, image_url')
              .eq('id', pair.maleId)
              .single()
            if (maleParticipant) {
              pair.maleName = maleParticipant.name
              pair.maleImageUrl = maleParticipant.image_url
            }
          }
          
          if (pair.femaleId) {
            const { data: femaleParticipant } = await supabase
              .from('participants')
              .select('name, image_url')
              .eq('id', pair.femaleId)
              .single()
            if (femaleParticipant) {
              pair.femaleName = femaleParticipant.name
              pair.femaleImageUrl = femaleParticipant.image_url
            }
          }
        }
      }
    }
  }

  console.log('✅ 예측 조회 성공:', data?.length || 0, '개')
  return { data, error: null }
}

export async function createUserPrediction(prediction: Omit<UserPrediction, 'id' | 'submitted_at'>) {
  console.log('=== createUserPrediction 시작 ===')
  console.log('예측 데이터:', prediction)
  
  // 먼저 기존 예측이 있는지 확인
  const { data: existingPredictions, error: checkError } = await supabase
    .from('user_predictions')
    .select('*')
    .eq('user_id', prediction.user_id)
    .eq('episode_id', prediction.episode_id)
    .eq('version', prediction.version)

  console.log('기존 예측 확인:', { existingPredictions, checkError })

  if (checkError) {
    console.error('❌ 기존 예측 확인 오류:', checkError)
    return { data: null, error: checkError }
  }

  let result
  if (existingPredictions && existingPredictions.length > 0) {
    // 기존 예측이 있으면 업데이트
    console.log('기존 예측 업데이트:', existingPredictions[0].id)
    const { data, error } = await supabase
      .from('user_predictions')
      .update({
        pairs: prediction.pairs,
        submitted_at: new Date().toISOString()
      })
      .eq('id', existingPredictions[0].id)
      .select()

    result = { data, error }
  } else {
    // 새로운 예측 생성
    console.log('새로운 예측 생성')
    const { data, error } = await supabase
      .from('user_predictions')
      .insert(prediction)
      .select()

    result = { data, error }
  }

  console.log('예측 처리 결과:', result)

  if (result.error) {
    console.error('❌ 예측 처리 오류:', result.error)
    console.error('오류 상세:', {
      message: result.error.message,
      details: result.error.details,
      hint: result.error.hint,
      code: result.error.code
    })
    return { data: null, error: result.error }
  }

  if (!result.data || result.data.length === 0) {
    console.error('❌ 예측 처리 실패 - 데이터 없음')
    return { data: null, error: { message: '예측 처리에 실패했습니다.' } }
  }

  console.log('✅ 예측 처리 성공:', result.data[0])
  return { data: result.data[0], error: null }
}

// 공식 커플 관련 함수들
export async function getOfficialCouples(episodeId?: string) {
  let query = supabase
    .from('couple_pairs')
    .select(`
      *,
      episodes (
        id,
        number,
        title,
        status
      )
    `)
    .eq('is_official_result', true)

  if (episodeId) {
    query = query.eq('episode_id', episodeId)
  }

  const { data, error } = await query.order('decided_at', { ascending: false })

  if (error) {
    console.error('공식 커플 조회 오류:', error)
    return { data: null, error }
  }

  // 참가자 정보를 별도로 가져와서 결합
  if (data && data.length > 0) {
    const { data: allParticipants } = await supabase
      .from('participants')
      .select('id, name, gender')
      .eq('is_active', true)

    const couplesWithNames = data.map(couple => {
      const maleParticipant = allParticipants?.find(p => p.id === couple.male_id)
      const femaleParticipant = allParticipants?.find(p => p.id === couple.female_id)
      
      return {
        ...couple,
        male_participant: maleParticipant,
        female_participant: femaleParticipant
      }
    })

    return { data: couplesWithNames, error: null }
  }

  return { data, error: null }
}

export async function createOfficialCouple(couple: {
  episode_id: string
  male_id: string
  female_id: string
}) {
  console.log('=== createOfficialCouple 시작 ===')
  console.log('공식 커플 데이터:', couple)
  
  const { data, error } = await supabase
    .from('couple_pairs')
    .insert({
      ...couple,
      is_official_result: true,
      decided_at: new Date().toISOString()
    })
    .select()

  console.log('공식 커플 생성 결과:', { data, error })

  if (error) {
    console.error('❌ 공식 커플 생성 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('❌ 공식 커플 생성 실패 - 데이터 없음')
    return { data: null, error: { message: '공식 커플 생성에 실패했습니다.' } }
  }

  console.log('✅ 공식 커플 생성 성공:', data[0])
  return { data: data[0], error: null }
}

export async function deleteOfficialCouple(id: string) {
  const { data, error } = await supabase
    .from('couple_pairs')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error('공식 커플 삭제 오류:', error)
    return { data: null, error }
  }

  return { data: data[0], error: null }
}

export async function updateUserPrediction(id: string, updates: Partial<UserPrediction>) {
  const { data, error } = await supabase
    .from('user_predictions')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('예측 수정 오류:', error)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    console.error('예측을 찾을 수 없습니다:', id)
    return { data: null, error: { message: '예측을 찾을 수 없습니다.' } }
  }

  return { data: data[0], error: null }
}

// 회차별 출연자 조회 (예측 페이지용)
export async function getEpisodeParticipants(episodeId: string) {
  // 먼저 회차 정보를 가져와서 시즌 ID를 얻음
  const { data: episode, error: episodeError } = await getEpisode(episodeId)
  
  if (episodeError || !episode) {
    return { data: null, error: episodeError }
  }

  // 해당 시즌의 출연자들을 가져옴
  const { data: participants, error: participantsError } = await getParticipants(episode.season_id)

  if (participantsError || !participants) {
    return { data: null, error: participantsError }
  }

  // 공식 커플 조회 (이전 회차들에서 공개된 커플들)
  const { data: officialCouples, error: couplesError } = await supabase
    .from('couple_pairs')
    .select('*')
    .eq('is_official_result', true)
    .lt('episode_id', episodeId) // 현재 회차보다 이전 회차들의 공식 커플만

  if (couplesError) {
    console.error('공식 커플 조회 오류:', couplesError)
    return { data: null, error: couplesError }
  }

  // 성별별로 분류
  const male = participants.filter(p => p.gender === 'M')
  const female = participants.filter(p => p.gender === 'F')

  // 공식 커플로 고정된 참가자들 추출
  const fixedParticipants = new Set()
  const officialCouplesWithNames: any[] = []
  
  if (officialCouples && officialCouples.length > 0) {
    // 각 공식 커플의 참가자 이름을 가져오기
    for (const couple of officialCouples) {
      if (couple.male_id) fixedParticipants.add(couple.male_id)
      if (couple.female_id) fixedParticipants.add(couple.female_id)
      
      // 참가자 이름 찾기
      const maleParticipant = participants.find(p => p.id === couple.male_id)
      const femaleParticipant = participants.find(p => p.id === couple.female_id)
      
      officialCouplesWithNames.push({
        ...couple,
        male_participant: maleParticipant,
        female_participant: femaleParticipant
      })
    }
  }

  return { 
    data: { 
      male, 
      female, 
      episode,
      officialCouples: officialCouplesWithNames,
      fixedParticipants: Array.from(fixedParticipants)
    }, 
    error: null 
  }
}

// 회차별 통계 조회
export async function getEpisodeStats(episodeId: string) {
  console.log('getEpisodeStats 호출 - episodeId:', episodeId);
  
  const { data, error } = await supabase
    .from('user_predictions')
    .select('*')
    .eq('episode_id', episodeId)

  if (error) {
    console.error('회차 통계 조회 오류:', error)
    return { data: null, error }
  }

  console.log('user_predictions 데이터:', data);
  const totalPredictions = data?.length || 0
  console.log('총 예측 수:', totalPredictions);
  
  // TODO: 정답률 계산 로직 추가 (실제 정답 데이터가 있을 때)

  return { 
    data: { 
      total_predictions: totalPredictions,
      accuracy_rate: 0 // 임시로 0
    }, 
    error: null 
  }
}

// 회차 목록과 통계 함께 조회
export async function getEpisodesWithStats(seasonId?: string) {
  let query = supabase
    .from('episodes')
    .select(`
      *,
      seasons (
        id,
        title,
        code
      )
    `)

  if (seasonId) {
    query = query.eq('season_id', seasonId)
  }

  const { data: episodes, error } = await query.order('number', { ascending: true })

  if (error) {
    console.error('회차 조회 오류:', error)
    return { data: null, error }
  }

  // 각 회차별 통계 추가
  const episodesWithStats = await Promise.all(
    episodes.map(async (episode) => {
      const { data: stats } = await getEpisodeStats(episode.id)
      return {
        ...episode,
        total_predictions: stats?.total_predictions || 0,
        accuracy_rate: stats?.accuracy_rate || 0
      }
    })
  )

  return { data: episodesWithStats, error: null }
}

// 디버깅용: 모든 회차 조회
export async function getAllEpisodes() {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('모든 회차 데이터:', { data, error })
  return { data, error }
}

// 디버깅용: 특정 회차 조회
export async function getEpisodeForDebug(id: string) {
  console.log('디버깅용 회차 조회 시작:', id)
  
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single()

  console.log('디버깅용 회차 조회 결과:', { data, error })
  return { data, error }
}

// 디버깅용: 업데이트 테스트
export async function testUpdateEpisode(id: string, updates: any) {
  console.log('업데이트 테스트 시작:', { id, updates })
  
  // 1. 현재 데이터 확인
  const { data: beforeData, error: beforeError } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single()
  
  console.log('업데이트 전 데이터:', { beforeData, beforeError })
  
  // 2. 업데이트 시도
  const { data: updateData, error: updateError } = await supabase
    .from('episodes')
    .update(updates)
    .eq('id', id)
    .select()
  
  console.log('업데이트 결과:', { updateData, updateError })
  
  // 3. 업데이트 후 데이터 확인
  const { data: afterData, error: afterError } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single()
  
  console.log('업데이트 후 데이터:', { afterData, afterError })
  
  return { beforeData, updateData, afterData, updateError, afterError }
}
