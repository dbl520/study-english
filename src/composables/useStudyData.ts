import { computed, ref, watch } from 'vue'

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
}

const STORAGE_KEY = 'study-english-words-v1'

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
    createdAt: new Date().toISOString()
  },
  {
    id: 'w2',
    word: 'meticulous',
    phonetic: '/məˈtɪkjələs/',
    meaning: '一丝不苟的',
    example: 'He keeps meticulous study notes.',
    level: 'hard',
    mastered: false,
    wrongCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'w3',
    word: 'expand',
    phonetic: '/ɪkˈspænd/',
    meaning: '扩展，扩大',
    example: 'Try to expand your vocabulary every day.',
    level: 'easy',
    mastered: true,
    wrongCount: 1,
    createdAt: new Date().toISOString()
  }
]

const safeParse = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw) as WordItem[]
    return Array.isArray(parsed) ? parsed : seed
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

  const addWord = (payload: Omit<WordItem, 'id' | 'createdAt' | 'wrongCount'>) => {
    words.value.unshift({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      wrongCount: 0
    })
  }

  const updateWord = (id: string, patch: Partial<WordItem>) => {
    const idx = words.value.findIndex((w) => w.id === id)
    if (idx >= 0) words.value[idx] = { ...words.value[idx], ...patch }
  }

  const removeWord = (id: string) => {
    words.value = words.value.filter((w) => w.id !== id)
  }

  const importWords = (list: WordItem[]) => {
    words.value = list
  }

  const resetSeed = () => {
    words.value = [...seed]
  }

  return {
    words,
    masteredCount,
    totalCount,
    progress,
    addWord,
    updateWord,
    removeWord,
    importWords,
    resetSeed
  }
}
