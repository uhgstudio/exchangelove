'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Save, RotateCcw, Loader2 } from 'lucide-react'
import { PredictionPair, Participant, Episode } from '@/types/database'
import { getEpisodeParticipants, createUserPrediction, getUserPredictions } from '@/lib/database'
import { getCurrentUserWithRole } from '@/lib/auth'

interface SortableParticipantProps {
  participant: any
  isMatched: boolean
  onMatch: (participantId: string) => void
  isOfficial?: boolean
}

function ParticipantCard({ participant, isMatched, onMatch, onClick, isSelected, pairColor, isOfficial }: SortableParticipantProps & { onClick: (id: string) => void, isSelected: boolean, pairColor?: any, isOfficial?: boolean }) {
  return (
    <div
      onClick={() => !isOfficial && onClick(participant.id)}
      className={`p-4 rounded-lg shadow-md transition-all duration-200 ${
        isOfficial
          ? 'bg-green-100 border-2 border-green-400 cursor-not-allowed opacity-75'
          : isMatched && pairColor
          ? `${pairColor.bg} border-2 ${pairColor.border} hover:opacity-80 cursor-pointer` 
          : isSelected
          ? 'bg-blue-100 border-2 border-blue-400 hover:bg-blue-200 cursor-pointer'
          : 'bg-white border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {participant.image_url ? (
            <img 
              src={participant.image_url} 
              alt={participant.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isMatched && pairColor ? pairColor.icon : isSelected ? 'bg-blue-200' : 'bg-gray-200'
          } ${participant.image_url ? 'hidden' : ''}`}>
            <span className="text-lg">
              {isMatched ? '💕' : isSelected ? '👆' : '👤'}
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{participant.name}</h3>
            {isOfficial && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                공식 커플
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {participant.gender === 'M' ? '남성' : '여성'}
            {isOfficial && ' • 변경 불가'}
          </p>
        </div>
      </div>
      {isMatched && (
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs font-medium ${pairColor ? pairColor.text : 'text-green-600'}`}>
            매칭됨
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMatch(participant.id)
            }}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            해제
          </button>
        </div>
      )}
      {isSelected && !isMatched && (
        <div className="mt-2">
          <span className="text-xs text-blue-600 font-medium">선택됨 - 반대쪽을 클릭하세요</span>
        </div>
      )}
    </div>
  )
}

export default function PredictPage() {
  const params = useParams()
  const router = useRouter()
  const [predictions, setPredictions] = useState<PredictionPair[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [participants, setParticipants] = useState<{ 
    male: Participant[], 
    female: Participant[], 
    officialCouples?: any[], 
    fixedParticipants?: string[] 
  }>({ male: [], female: [] })
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [user, setUser] = useState<any>(null)
  const [, setIsAdmin] = useState(false)

  const [selectedMale, setSelectedMale] = useState<string | null>(null)
  const [selectedFemale, setSelectedFemale] = useState<string | null>(null)

  const handleParticipantClick = (participantId: string) => {
    const participant = [...participants.male, ...participants.female].find(p => p.id === participantId)
    if (!participant) return

    const isMale = participant.gender === 'M'
    const isMatched = predictions.some(p => p.maleId === participantId || p.femaleId === participantId)

    if (isMatched) {
      // 이미 매칭된 경우 매칭 해제
      setPredictions(prev => 
        prev.filter(p => p.maleId !== participantId && p.femaleId !== participantId)
      )
      // 선택 상태도 초기화
      if (isMale) {
        setSelectedMale(null)
      } else {
        setSelectedFemale(null)
      }
    } else {
      // 매칭되지 않은 경우
      if (isMale) {
        if (selectedMale === participantId) {
          // 같은 남성을 다시 클릭하면 선택 해제
          setSelectedMale(null)
        } else {
          // 새로운 남성 선택
          setSelectedMale(participantId)
          // 여성이 선택되어 있다면 매칭 생성
          if (selectedFemale) {
            setPredictions(prev => [...prev, { maleId: participantId, femaleId: selectedFemale }])
            setSelectedMale(null)
            setSelectedFemale(null)
          }
        }
      } else {
        if (selectedFemale === participantId) {
          // 같은 여성을 다시 클릭하면 선택 해제
          setSelectedFemale(null)
        } else {
          // 새로운 여성 선택
          setSelectedFemale(participantId)
          // 남성이 선택되어 있다면 매칭 생성
          if (selectedMale) {
            setPredictions(prev => [...prev, { maleId: selectedMale, femaleId: participantId }])
            setSelectedMale(null)
            setSelectedFemale(null)
          }
        }
      }
    }
  }

  const handleUnmatch = (participantId: string) => {
    setPredictions(prev => 
      prev.filter(p => p.maleId !== participantId && p.femaleId !== participantId)
    )
  }

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true)
        
        // 사용자 정보 가져오기
        const userResult = await getCurrentUserWithRole()
        if (userResult.error || !userResult.user) {
          router.push('/auth/login')
          return
        }
        setUser(userResult.user)
        setIsAdmin(userResult.isAdmin)

        // 회차별 출연자 데이터 가져오기
        const episodeId = params.id as string
        const { data, error } = await getEpisodeParticipants(episodeId)
        
        if (error || !data) {
          console.error('데이터 로딩 실패:', error)
          console.error('회차 ID:', episodeId)
          // 에러가 있어도 빈 데이터로 설정하여 UI가 표시되도록 함
          setParticipants({ male: [], female: [] })
          setEpisode(null)
          return
        }

        setParticipants({
          ...data,
          fixedParticipants: data.fixedParticipants as string[]
        })
        setEpisode(data.episode)
        
        // 공식 커플 정보 설정
        if (data.officialCouples && data.officialCouples.length > 0) {
          console.log('공식 커플 발견:', data.officialCouples)
        }

        // 기존 예측 데이터 가져오기
        try {
          const { data: existingPredictions, error: predictionError } = await getUserPredictions(userResult.user.id, episodeId)
          if (predictionError) {
            console.error('기존 예측 조회 오류:', predictionError)
          } else if (existingPredictions && existingPredictions.length > 0) {
            const latestPrediction = existingPredictions[0]
            console.log('기존 예측 로드:', latestPrediction)
            setPredictions(latestPrediction.pairs || [])
          }
        } catch (error) {
          console.error('기존 예측 로드 중 오류:', error)
        }

      } catch (error) {
        console.error('데이터 로딩 오류:', error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  const handleSave = async () => {
    console.log('=== handleSave 시작 ===')
    console.log('사용자:', user)
    console.log('회차:', episode)
    console.log('예측:', predictions)
    
    if (!user || !episode || predictions.length === 0) {
      console.error('❌ 저장 조건 불만족:', { user: !!user, episode: !!episode, predictionsLength: predictions.length })
      return
    }

    setLoading(true)
    try {
      const predictionData = {
        user_id: user.id,
        episode_id: episode.id,
        pairs: predictions,
        version: 1
      }
      
      console.log('저장할 예측 데이터:', predictionData)
      
      const { data, error } = await createUserPrediction(predictionData)

      if (error) {
        console.error('❌ 예측 저장 실패:', error)
        alert(`예측 저장에 실패했습니다: ${error.message}`)
        return
      }

      console.log('✅ 예측 저장 성공:', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('❌ 예측 저장 오류:', error)
      alert('예측 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPredictions([])
  }

  const isMatched = (participantId: string) => {
    return predictions.some(p => p.maleId === participantId || p.femaleId === participantId)
  }

  const getMatchedPair = (participantId: string) => {
    const pair = predictions.find(p => p.maleId === participantId || p.femaleId === participantId)
    if (!pair) return null
    
    const matchedId = pair.maleId === participantId ? pair.femaleId : pair.maleId
    return participants.male.find(p => p.id === matchedId) || participants.female.find(p => p.id === matchedId)
  }

  const getPairColor = (participantId: string) => {
    const pairIndex = predictions.findIndex(p => p.maleId === participantId || p.femaleId === participantId)
    if (pairIndex === -1) return null
    
    const colors = [
      { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', icon: 'bg-pink-200' },
      { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', icon: 'bg-orange-200' },
      { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', icon: 'bg-blue-200' },
      { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: 'bg-green-200' },
      { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'bg-yellow-200' },
      { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', icon: 'bg-indigo-200' },
      { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', icon: 'bg-red-200' },
      { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', icon: 'bg-cyan-200' },
    ]
    
    return colors[pairIndex % colors.length]
  }

  // 로딩 상태
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (!episode || participants.male.length === 0 || participants.female.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">데이터를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">출연자 정보나 회차 정보가 없습니다.</p>
          <Link href="/episodes" className="text-pink-600 hover:text-pink-700">
            회차 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/episodes" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                회차 목록
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-pink-500" />
                <h1 className="text-2xl font-bold text-gray-900">{episode.number}회차 예측</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                초기화
              </button>
              <button
                onClick={handleSave}
                disabled={loading || predictions.length === 0}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            예측이 저장되었습니다!
          </div>
        )}

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">커플 예측하기</h2>
          
          {/* 공식 커플 안내 */}
          {participants.officialCouples && participants.officialCouples.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold text-green-800">공식 커플 안내</span>
              </div>
              <div className="text-sm text-green-700 space-y-2">
                <p>다음 출연자들은 이미 공식 커플로 확정되어 예측에서 제외됩니다:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {participants.officialCouples.map((couple: any) => (
                    <span key={couple.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      💕 {couple.male_participant?.name} × {couple.female_participant?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">👆</span>
              <span className="font-semibold text-blue-800">사용법</span>
            </div>
            <p className="text-blue-700 text-sm">
              <strong>1단계:</strong> 남성 출연자를 클릭하세요 (파란색으로 선택됨)<br />
              <strong>2단계:</strong> 여성 출연자를 클릭하세요 (자동으로 매칭됨)<br />
              <strong>3단계:</strong> 모든 매칭이 완료되면 저장하세요
              {participants.officialCouples && participants.officialCouples.length > 0 && (
                <><br /><span className="text-green-700 font-medium">※ 공식 커플로 확정된 출연자는 선택할 수 없습니다</span></>
              )}
            </p>
          </div>
          <p className="text-gray-600">
            총 <span className="font-bold text-pink-600">{Math.min(participants.male.length, participants.female.length)}쌍</span>의 커플을 예측할 수 있습니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 남성 출연자 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
              <span className="mr-2">👨</span>
              남성 출연자
            </h3>
            <div className="space-y-4">
              {participants.male.map((participant) => {
                const matched = getMatchedPair(participant.id)
                const isOfficial = participants.fixedParticipants?.includes(participant.id) || false
                return (
                  <div key={participant.id} className="relative">
                    <ParticipantCard
                      participant={participant}
                      isMatched={isMatched(participant.id)}
                      onMatch={handleUnmatch}
                      onClick={handleParticipantClick}
                      isSelected={selectedMale === participant.id}
                      pairColor={getPairColor(participant.id)}
                      isOfficial={isOfficial}
                    />
                    {matched && (
                      <div className={`mt-2 p-3 rounded-md border-2 ${getPairColor(participant.id)?.bg} ${getPairColor(participant.id)?.border}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${getPairColor(participant.id)?.text}`}>
                            💕 {matched.name}와 매칭됨
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 여성 출연자 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
              <span className="mr-2">👩</span>
              여성 출연자
            </h3>
            <div className="space-y-4">
              {participants.female.map((participant) => {
                const matched = getMatchedPair(participant.id)
                const isOfficial = participants.fixedParticipants?.includes(participant.id) || false
                return (
                  <div key={participant.id} className="relative">
                    <ParticipantCard
                      participant={participant}
                      isMatched={isMatched(participant.id)}
                      onMatch={handleUnmatch}
                      onClick={handleParticipantClick}
                      isSelected={selectedFemale === participant.id}
                      pairColor={getPairColor(participant.id)}
                      isOfficial={isOfficial}
                    />
                    {matched && (
                      <div className={`mt-2 p-3 rounded-md border-2 ${getPairColor(participant.id)?.bg} ${getPairColor(participant.id)?.border}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${getPairColor(participant.id)?.text}`}>
                            💕 {matched.name}와 매칭됨
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 예측 요약 */}
        {predictions.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-md p-6 border border-pink-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                예측 요약
              </h3>
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                {predictions.length}쌍 매칭됨
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {predictions.map((prediction, index) => {
                const male = participants.male.find(p => p.id === prediction.maleId)
                const female = participants.female.find(p => p.id === prediction.femaleId)
                const pairColor = getPairColor(prediction.maleId)
                return (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${pairColor?.bg} ${pairColor?.border}`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          {male?.image_url ? (
                            <img 
                              src={male.image_url} 
                              alt={male.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            male?.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                          } ${male?.image_url ? 'hidden' : ''}`}>
                            {male?.name.charAt(0)}
                          </div>
                        </div>
                        <span className={`text-sm ${pairColor?.text}`}>💕</span>
                        <div className="flex-shrink-0">
                          {female?.image_url ? (
                            <img 
                              src={female.image_url} 
                              alt={female.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            female?.gender === 'F' ? 'bg-pink-500' : 'bg-blue-500'
                          } ${female?.image_url ? 'hidden' : ''}`}>
                            {female?.name.charAt(0)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{male?.name} × {female?.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnmatch(prediction.maleId)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="매칭 해제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm text-center">
                <span className="font-medium">💡 팁:</span> 모든 매칭이 완료되면 저장 버튼을 눌러주세요!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
