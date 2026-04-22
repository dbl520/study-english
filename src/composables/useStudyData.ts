import { computed, ref, watch } from 'vue'
import { addDays, calculateNextInterval, isDue } from '../utils/srs'

export interface WordItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: 'easy' | 'medium' | 'hard'
  mastered: boolean
  wrongCount: number
  createdAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
}

const STORAGE_KEY = 'study-english-words-v2'

const nowIso = () => new Date().toISOString()

const seed: WordItem[] = [
  {
    id: 'w1',
    word: 'resilient',
    phonetic: '/rɪˈzɪliənt/',
    meaning: '有韧性的，能快速恢复的',
    example: 'She is resilient after setbacks.',
    level: 'medium',
    mastered: false,
    wrongCount: 0,
    createdAt: nowIso(),
    nextReviewAt: addDays(new Date(), 2).toISOString()
  },
  {
    id: 'w2',
    word: 'meticulous',
    phonetic: '/məˈtɪkjələs/',
    meaning: '一丝不苟的',
    example: 'He keeps meticulous study notes.',
    level: 'hard',
    mastered: false,
    wrongCount: 2,
    createdAt: nowIso(),
    nextReviewAt: addDays(new Date(), 1).toISOString()
  },
  {
    id: 'w3',
    word: 'expand',
    phonetic: '/ɪkˈspænd/',
    meaning: '扩展，扩大',
    example: 'Try to expand your vocabulary every day.',
    level: 'easy',
    mastered: true,
    wrongCount: 0,
    createdAt: nowIso(),
    nextReviewAt: addDays(new Date(), 5).toISOString()
  }
]

const normalizeWord = (item: WordItem): WordItem => ({
  ...item,
  nextReviewAt: item.nextReviewAt ?? addDays(new Date(), 1).toISOString()
})

const safeParse = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw) as WordItem[]
    if (!Array.isArray(parsed)) return seed
    return parsed.map(normalizeWord)
  } catch {
    return seed
  }
}

const words = ref<WordItem[]>(safeParse())

watch(
  words,
  (v) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  },
  { deep: true }
)

export const useStudyData = () => {
  const masteredCount = computed(() => words.value.filter((item) => item.mastered).length)
  const totalCount = computed(() => words.value.length)
  const progress = computed(() => {
    if (!totalCount.value) return 0
    return Math.round((masteredCount.value / totalCount.value) * 100)
  })

  const dueWords = computed(() =>
    words.value.filter((item) => (item.nextReviewAt ? isDue(item.nextReviewAt) : false))
  )

  const addWord = (
    payload: Omit<WordItem, 'id' | 'createdAt' | 'wrongCount' | 'nextReviewAt'>
  ) => {
    words.value.unshift({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      wrongCount: 0,
      nextReviewAt: addDays(new Date(), 1).toISOString()
    })
  }

  const updateWord = (id: string, patch: Partial<WordItem>) => {
    const idx = words.value.findIndex((w) => w.id === id)
    if (idx >= 0) words.value[idx] = { ...words.value[idx], ...patch }
  }

  const recordPracticeResult = (id: string, isCorrect: boolean) => {
    const idx = words.value.findIndex((w) => w.id === id)
    if (idx < 0) return

    const current = words.value[idx]
    const wrongCount = isCorrect ? Math.max(0, current.wrongCount - 1) : current.wrongCount + 1
    const mastered = isCorrect && wrongCount === 0
    const interval = calculateNextInterval(wrongCount, mastered)

    words.value[idx] = {
      ...current,
      wrongCount,
      mastered,
      lastReviewedAt: nowIso(),
      nextReviewAt: addDays(new Date(), interval).toISOString()
    }
  }

  const removeWord = (id: string) => {
    words.value = words.value.filter((w) => w.id !== id)
  }

  const importWords = (list: WordItem[]) => {
    words.value = list.map(normalizeWord)
  }

  const resetSeed = () => {
    words.value = [...seed]
  }

  return {
    words,
    dueWords,
    masteredCount,
    totalCount,
    progress,
    addWord,
    updateWord,
    recordPracticeResult,
    removeWord,
    importWords,
    resetSeed
  }
}
