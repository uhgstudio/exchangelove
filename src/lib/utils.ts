import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTimeRemaining(endTime: string | Date) {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return '마감됨'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}일 ${hours}시간 ${minutes}분 남음`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`
  } else {
    return `${minutes}분 남음`
  }
}

export function calculateScore(predictions: any[], officialResults: any[]): number {
  if (!officialResults || officialResults.length === 0) return 0
  
  let correctPairs = 0
  const totalPairs = officialResults.length

  for (const prediction of predictions) {
    const isCorrect = officialResults.some(
      result => 
        result.male_id === prediction.maleId && 
        result.female_id === prediction.femaleId
    )
    if (isCorrect) {
      correctPairs++
    }
  }

  return Math.round((correctPairs / totalPairs) * 100)
}

export function generateRanking(scores: { user_id: string; score: number }[]): { user_id: string; score: number; rank: number }[] {
  const sorted = scores.sort((a, b) => b.score - a.score)
  
  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
}
