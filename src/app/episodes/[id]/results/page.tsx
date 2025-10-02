'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Trophy, Users, CheckCircle, XCircle, BarChart3, Loader2 } from 'lucide-react'
import { getEpisode, getEpisodeParticipants, getUserPredictions } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'
import { Episode, Participant, UserPrediction } from '@/types/database'

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [participants, setParticipants] = useState<{ male: Participant[], female: Participant[] }>({ male: [], female: [] })
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 사용자 정보 가져오기
        const userResult = await getCurrentUser()
        if (userResult.error || !userResult.user) {
          router.push('/auth/login')
          return
        }
        setUser(userResult.user)

        // 회차 정보 가져오기
        const episodeId = params.id as string
        const { data: episodeData, error: episodeError } = await getEpisode(episodeId)
        
        if (episodeError || !episodeData) {
          console.error('회차 데이터 로딩 실패:', episodeError)
          return
        }
        setEpisode(episodeData)

        // 출연자 데이터 가져오기
        const { data: participantsData, error: participantsError } = await getEpisodeParticipants(episodeId)
        
        if (participantsError || !participantsData) {
          console.error('출연자 데이터 로딩 실패:', participantsError)
          return
        }
        setParticipants(participantsData)

        // 사용자 예측 데이터 가져오기
        const { data: predictionsData } = await getUserPredictions(userResult.user.id, episodeId)
        if (predictionsData) {
          setUserPredictions(predictionsData)
        }

      } catch (error) {
        console.error('데이터 로딩 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  // 출연자 이름 찾기
  const getParticipantName = (id: string) => {
    const allParticipants = [...participants.male, ...participants.female]
    const participant = allParticipants.find(p => p.id === id)
    return participant?.name || '알 수 없음'
  }

  // 정답 여부 확인 (임시로 랜덤)
  const isCorrect = (pair: any) => {
    // TODO: 실제 정답 데이터와 비교
    return Math.random() > 0.5
  }

  // 통계 계산
  const totalPredictions = userPredictions.length
  const correctPredictions = userPredictions.reduce((count, prediction) => {
    if (prediction.pairs) {
      const correctPairs = prediction.pairs.filter((pair: any) => isCorrect(pair))
      return count + correctPairs.length
    }
    return count
  }, 0)
  const accuracyRate = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결과를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">회차 정보나 예측 데이터가 없습니다.</p>
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
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h1 className="text-2xl font-bold text-gray-900">{episode.number}회차 결과</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{totalPredictions}</div>
                <div className="text-sm text-gray-600">총 예측 수</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{correctPredictions}</div>
                <div className="text-sm text-gray-600">정답 수</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{accuracyRate}%</div>
                <div className="text-sm text-gray-600">정답률</div>
              </div>
            </div>
          </div>
        </div>

        {/* 예측 결과 */}
        {userPredictions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">내 예측 결과</h2>
            <div className="space-y-4">
              {userPredictions.map((prediction, index) => (
                <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      예측 #{index + 1}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(prediction.submitted_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  
                  {prediction.pairs && prediction.pairs.length > 0 ? (
                    <div className="grid gap-3">
                      {prediction.pairs.map((pair: any, pairIndex: number) => {
                        const isCorrectPair = isCorrect(pair)
                        return (
                          <div 
                            key={pairIndex}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isCorrectPair 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                isCorrectPair ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="font-medium text-gray-900">
                                {getParticipantName(pair.maleId)} + {getParticipantName(pair.femaleId)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isCorrectPair ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                isCorrectPair ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {isCorrectPair ? '정답' : '오답'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">예측 데이터가 없습니다.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">예측 결과가 없습니다</h2>
            <p className="text-gray-600 mb-6">이 회차에 대한 예측을 하지 않았습니다.</p>
            <Link 
              href={`/episodes/${episode.id}/predict`}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              예측하러 가기
            </Link>
          </div>
        )}

        {/* 실제 정답 (관리자용) */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">실제 정답</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>참고:</strong> 실제 정답 데이터는 방송 후 관리자가 입력해야 합니다.
              현재는 임시 데이터로 표시되고 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
