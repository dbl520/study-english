<template>
  <div class="min-h-screen bg-[#edf1f4] text-[#111827] p-8">
    <div
      class="mx-auto max-w-[1320px] rounded-[26px] bg-[#eef2f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(15,23,42,0.08)] p-6 md:p-8"
    >
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7dde5] pb-5">
        <h1 class="text-4xl md:text-5xl font-800 tracking-tight">Study English Assistant</h1>
        <el-button
          class="!h-12 !rounded-2xl !border-none !bg-[#0f2747] !px-6 !text-lg !text-white"
          @click="exploreMode = !exploreMode"
        >
          {{ exploreMode ? '退出探索模式' : '开启探索模式' }}
        </el-button>
      </header>

      <main class="mt-6 space-y-6">
        <section class="rounded-3xl border border-[#d8dee6] bg-[#f4f6f8] p-6">
          <h2 class="text-2xl font-700">P1 · 语法时态沙盒</h2>
          <div class="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside class="rounded-2xl border border-[#d8dee6] bg-white p-4">
              <h3 class="text-xl font-700">信号词藏匿区</h3>
              <div class="mt-4 space-y-3">
                <button
                  v-for="signal in hiddenSignals"
                  :key="signal.word"
                  class="chip"
                  :class="signal.time === selectedTime ? 'chip-active' : 'chip-default'"
                  draggable="true"
                  @click="selectSignal(signal)"
                  @dragstart="draggingSignal = signal"
                >
                  {{ signal.word }}
                </button>
              </div>
            </aside>

            <div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="word-card">
                  <p class="label">主语</p>
                  <p class="en">{{ subject.en }}</p>
                  <p class="zh">{{ subject.zh }}</p>
                </div>
                <div class="word-card">
                  <p class="label">动词</p>
                  <p class="en text-[#ca7a1e]">{{ conjugation.en }}</p>
                  <p class="zh">{{ conjugation.zh }}</p>
                </div>
                <div class="word-card">
                  <p class="label">宾语</p>
                  <p class="en">{{ object.en }}</p>
                  <p class="zh">{{ object.zh }}</p>
                </div>
              </div>

              <div
                class="relative mt-6 rounded-3xl border border-dashed border-[#ced6df] p-6"
                @dragover.prevent
                @drop="handleDropSignal"
              >
                <h4 class="text-center text-2xl font-700">时间轴（拖拽到此）</h4>
                <div class="mx-auto mt-6 w-[92%]">
                  <div class="timeline-shell">
                    <div class="timeline-point timeline-now" :style="{ left: `${sliderToPercent(timeValue)}%` }" />
                    <div class="timeline-point timeline-target" :style="{ left: `${selectedTimeMarker}%` }" />
                  </div>
                  <el-slider v-model="timeValue" :min="0" :max="100" :show-tooltip="false" class="!mt-[-28px]" />
                </div>
                <el-alert
                  v-if="showHint"
                  type="success"
                  :closable="false"
                  class="!mt-4"
                  title="你发现了隐藏时态变化！"
                />
              </div>

              <div class="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <p class="font-700">时间（Time）</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      v-for="item in timeOptions"
                      :key="item.value"
                      class="pill"
                      :class="selectedTime === item.value ? 'pill-time-active' : 'pill-default'"
                      @click="selectedTime = item.value"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="font-700">状态（State）</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      v-for="item in stateOptions"
                      :key="item.value"
                      class="pill"
                      :class="selectedState === item.value ? item.activeClass : 'pill-default'"
                      @click="selectedState = item.value"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
              </div>

              <el-card class="mt-5 !rounded-2xl !border-none">
                <p><strong>生成句子：</strong>{{ sentence.en }}</p>
                <p class="text-[#6b7280] mt-1"><strong>中文：</strong>{{ sentence.zh }}</p>
              </el-card>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-[#d8dee6] bg-white p-6">
          <h2 class="text-2xl font-700">P1 · 练习模式（选择 / 填空 / 纠错）</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            <el-tag effect="dark">当前词：{{ activeWord.word }}</el-tag>
            <el-tag>错题次数：{{ activeWord.wrongCount }}</el-tag>
            <el-tag type="success">下次复习：{{ formatDate(activeWord.nextReviewAt) }}</el-tag>
          </div>

          <el-tabs v-model="activePractice" class="mt-4">
            <el-tab-pane label="选择题" name="choice">
              <p class="mb-3">选择句子的正确时态：</p>
              <p class="font-700 mb-3">{{ choiceQuestion.sentence }}</p>
              <div class="grid gap-2 md:grid-cols-3">
                <el-button
                  v-for="option in choiceQuestion.options"
                  :key="option"
                  @click="submitChoice(option)"
                >
                  {{ option }}
                </el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="填空题" name="blank">
              <p class="mb-2">根据提示填写动词正确形式：</p>
              <p class="font-700">{{ blankQuestion.prompt }}</p>
              <el-input v-model="blankAnswer" class="mt-3" placeholder="请输入答案" />
              <el-button class="mt-3" type="primary" @click="submitBlank">提交填空</el-button>
            </el-tab-pane>

            <el-tab-pane label="纠错题" name="fix">
              <p class="mb-2">找出错误并输入修正后的句子：</p>
              <p class="font-700">{{ fixQuestion.wrongSentence }}</p>
              <el-input
                v-model="fixAnswer"
                class="mt-3"
                placeholder="请输入修正后的完整句子"
              />
              <el-button class="mt-3" type="warning" @click="submitFix">提交纠错</el-button>
            </el-tab-pane>
          </el-tabs>

          <el-alert
            v-if="feedback"
            class="mt-4"
            :title="feedback"
            :type="feedbackType"
            :closable="false"
          />
        </section>

        <section class="grid gap-4 lg:grid-cols-2">
          <el-card>
            <template #header>
              <div class="font-700">P1 · 错题本</div>
            </template>
            <div class="space-y-2 max-h-[280px] overflow-auto">
              <p v-if="wrongBook.length === 0" class="text-[#6b7280]">暂无错题，继续保持！</p>
              <div
                v-for="item in wrongBook"
                :key="item.id"
                class="rounded-xl border border-[#e5e7eb] p-3"
              >
                <p class="font-700">{{ item.word }} <span class="text-sm text-[#6b7280]">{{ item.phonetic }}</span></p>
                <p class="text-sm">{{ item.meaning }}</p>
                <p class="text-sm text-[#ef4444]">错误次数：{{ item.wrongCount }}</p>
              </div>
            </div>
          </el-card>

          <el-card>
            <template #header>
              <div class="font-700">P1 · SRS 复习看板</div>
            </template>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="metric">
                <p class="value">{{ totalCount }}</p>
                <p>总词数</p>
              </div>
              <div class="metric">
                <p class="value">{{ masteredCount }}</p>
                <p>已掌握</p>
              </div>
              <div class="metric">
                <p class="value">{{ progress }}%</p>
                <p>进度</p>
              </div>
            </div>

            <el-divider />

            <p class="font-700">今日待复习：{{ dueWords.length }}</p>
            <ul class="mt-2 list-disc pl-5 text-sm text-[#4b5563]">
              <li v-for="item in dueWords.slice(0, 5)" :key="item.id">
                {{ item.word }}（{{ formatDate(item.nextReviewAt) }}）
              </li>
            </ul>
          </el-card>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStudyData } from './composables/useStudyData'

type TimeType = 'past' | 'now' | 'future'
type StateType = 'simple' | 'progressive' | 'perfect'
type PracticeTab = 'choice' | 'blank' | 'fix'

const exploreMode = ref(false)
const selectedTime = ref<TimeType>('future')
const selectedState = ref<StateType>('simple')
const timeValue = ref(50)
const activePractice = ref<PracticeTab>('choice')

const subject = { en: 'She', zh: '她' }
const object = { en: 'her homework.', zh: '她的作业。' }

const hiddenSignals = [
  { word: 'yesterday', time: 'past' as const },
  { word: 'next week', time: 'future' as const },
  { word: 'now', time: 'now' as const }
]

const timeOptions = [
  { label: '过去', value: 'past' as const },
  { label: '现在', value: 'now' as const },
  { label: '将来', value: 'future' as const }
]

const stateOptions = [
  { label: '一般', value: 'simple' as const, activeClass: 'pill-state-simple' },
  { label: '进行', value: 'progressive' as const, activeClass: 'pill-state-progressive' },
  { label: '完成', value: 'perfect' as const, activeClass: 'pill-state-perfect' }
]

const selectedTimeMarker = computed(() => {
  if (selectedTime.value === 'past') return 16
  if (selectedTime.value === 'now') return 50
  return 86
})

const sliderToPercent = (value: number) => 8 + (value / 100) * 84
const draggingSignal = ref<{ word: string; time: TimeType } | null>(null)

const selectSignal = (signal: { word: string; time: TimeType }) => {
  selectedTime.value = signal.time
}

const handleDropSignal = () => {
  if (!draggingSignal.value) return
  selectedTime.value = draggingSignal.value.time
  draggingSignal.value = null
}

const tenseMap: Record<TimeType, Record<StateType, { en: string; zh: string }>> = {
  past: {
    simple: { en: 'finished', zh: '完成了' },
    progressive: { en: 'was finishing', zh: '那时正在完成' },
    perfect: { en: 'had finished', zh: '那时已经完成' }
  },
  now: {
    simple: { en: 'finishes', zh: '完成' },
    progressive: { en: 'is finishing', zh: '正在完成' },
    perfect: { en: 'has finished', zh: '已经完成' }
  },
  future: {
    simple: { en: 'will finish', zh: '将要完成' },
    progressive: { en: 'will be finishing', zh: '将正在完成' },
    perfect: { en: 'will have finished', zh: '将已经完成' }
  }
}

const conjugation = computed(() => tenseMap[selectedTime.value][selectedState.value])
const sentence = computed(() => ({
  en: `${subject.en} ${conjugation.value.en} ${object.en}`,
  zh: `${subject.zh}${conjugation.value.zh}${object.zh}`
}))
const showHint = computed(() => exploreMode.value && selectedState.value !== 'simple')

const { words, dueWords, masteredCount, totalCount, progress, recordPracticeResult } = useStudyData()

const activeWordIndex = ref(0)
const activeWord = computed(() => words.value[activeWordIndex.value % words.value.length])
const wrongBook = computed(() => words.value.filter((item) => item.wrongCount > 0))

const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const choiceQuestion = computed(() => ({
  sentence: 'By next week, she ___ her homework.',
  answer: 'Future Perfect',
  options: ['Past Simple', 'Present Progressive', 'Future Perfect']
}))

const blankQuestion = computed(() => ({
  prompt: 'She has ____ (finish) her homework.',
  answer: 'finished'
}))

const fixQuestion = computed(() => ({
  wrongSentence: 'She have finished her homework yesterday.',
  answer: 'She finished her homework yesterday.'
}))

const stepToNextWord = () => {
  activeWordIndex.value = (activeWordIndex.value + 1) % words.value.length
}

const handleResult = (isCorrect: boolean, successMsg: string, failMsg: string) => {
  recordPracticeResult(activeWord.value.id, isCorrect)
  feedbackType.value = isCorrect ? 'success' : 'error'
  feedback.value = isCorrect ? successMsg : failMsg
  ElMessage[isCorrect ? 'success' : 'error'](feedback.value)
  stepToNextWord()
}

const submitChoice = (option: string) => {
  handleResult(
    option === choiceQuestion.value.answer,
    '选择题回答正确，已更新复习计划。',
    '选择题回答错误，已加入/更新错题本。'
  )
}

const blankAnswer = ref('')
const submitBlank = () => {
  const isCorrect =
    blankAnswer.value.trim().toLowerCase() === blankQuestion.value.answer.toLowerCase()
  handleResult(isCorrect, '填空正确，继续保持。', '填空错误，建议复习完成时。')
  blankAnswer.value = ''
}

const fixAnswer = ref('')
const submitFix = () => {
  const normalized = fixAnswer.value.trim().toLowerCase().replace(/\s+/g, ' ')
  const answer = fixQuestion.value.answer.toLowerCase().replace(/\s+/g, ' ')
  handleResult(normalized === answer, '纠错正确，语感很好！', '纠错不正确，再观察时态线索。')
  fixAnswer.value = ''
}

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.label {
  @apply text-center text-sm font-650 text-[#6b7280];
}

.word-card {
  @apply rounded-2xl border border-[#dee4eb] bg-[#f8fafb] py-4 text-center;
}

.word-card .en {
  @apply mt-2 text-3xl font-650;
}

.word-card .zh {
  @apply mt-2 text-lg text-[#4b5563];
}

.chip,
.pill {
  @apply border border-[#d7dde5] bg-[#f5f7fa] rounded-full px-4 py-2 transition;
}

.chip-active {
  @apply bg-[#ea5a55] text-white;
}

.chip-default {
  @apply text-[#1f2937];
}

.timeline-shell {
  @apply relative h-10 rounded-full bg-gradient-to-r from-[#dce3ea] to-[#c9d4e2] px-8;
}

.timeline-point {
  @apply absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full;
}

.timeline-now {
  @apply bg-white shadow-lg;
}

.timeline-target {
  @apply bg-[#8a4eff] shadow-[0_0_0_8px_rgba(138,78,255,0.15)];
}

.pill-default {
  @apply text-[#111827];
}

.pill-time-active {
  @apply bg-[#2f88ff] text-white;
}

.pill-state-simple {
  @apply bg-[#8a4eff] text-white;
}

.pill-state-progressive {
  @apply bg-[#1d9a72] text-white;
}

.pill-state-perfect {
  @apply bg-[#f59e0b] text-white;
}

.metric {
  @apply rounded-xl bg-[#f3f4f6] py-3;
}

.metric .value {
  @apply text-2xl font-700;
}
</style>
