<template>
  <div class="min-h-screen bg-[#edf1f4] text-[#111827] p-8">
    <div class="mx-auto max-w-[1320px] rounded-[26px] bg-[#eef2f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(15,23,42,0.08)] p-6 md:p-8">
      <header class="flex items-center justify-between border-b border-[#d7dde5] pb-5">
        <h1 class="text-5xl font-800 tracking-tight">
          Grammar Physics Sandbox <span class="text-[#6b7280]">V2.0</span>
        </h1>
        <el-button class="!h-14 !rounded-2xl !border-none !bg-[#0f2747] !px-8 !text-xl !text-white shadow-[0_8px_20px_rgba(15,39,71,0.45)]" @click="exploreMode = !exploreMode">
          <span class="i-mdi-star-outline mr-2 text-2xl" />
          {{ exploreMode ? '退出探索模式' : '开启探索模式' }}
        </el-button>
      </header>

      <main class="mt-6 grid grid-cols-[220px_1fr] gap-10">
        <aside class="rounded-2xl border border-[#d8dee6] bg-[#f4f6f8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <h3 class="text-3xl font-700">信号词藏匿区</h3>
          <div class="mt-4 h-[1px] bg-[#d3d8de]" />
          <div class="mt-6 space-y-4">
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

        <section>
          <div class="grid grid-cols-3 gap-6 px-8">
            <div>
              <p class="label">主语 (Subject)</p>
              <div class="word-card">
                <p class="en">{{ subject.en }}</p>
                <p class="zh">{{ subject.zh }}</p>
              </div>
            </div>
            <div>
              <p class="label">动词形式 (Verb)</p>
              <div class="word-card">
                <p class="en text-[#ca7a1e]">{{ conjugation.en }}</p>
                <p class="zh">{{ conjugation.zh }}</p>
              </div>
            </div>
            <div>
              <p class="label">宾语 (Object)</p>
              <div class="word-card">
                <p class="en">{{ object.en }}</p>
                <p class="zh">{{ object.zh }}</p>
              </div>
            </div>
          </div>

          <div
            class="relative mt-8 rounded-3xl border border-dashed border-[#ced6df] p-10"
            @dragover.prevent
            @drop="handleDropSignal"
          >
            <h4 class="text-center text-4xl font-700">时间轴（拖拽到此）</h4>
            <div class="mx-auto mt-8 w-[90%]">
              <div class="timeline-shell">
                <div class="timeline-arrow" />
                <div class="timeline-point timeline-now" :style="{ left: `${sliderToPercent(timeValue)}%` }" />
                <div class="timeline-point timeline-target" :style="{ left: `${selectedTimeMarker}%` }" />
              </div>
              <el-slider v-model="timeValue" :min="0" :max="100" :show-tooltip="false" class="!mt-[-28px]" />
              <div class="mt-2 grid grid-cols-3 text-3xl">
                <div>
                  <p>PAST</p>
                  <p class="text-[#6b7280]">(过去)</p>
                </div>
                <div class="text-center">
                  <p>NOW</p>
                </div>
                <div class="text-right text-[#7e4ab4]">
                  <p>FUTURE</p>
                  <p class="text-[#7e4ab4]">(将来的)</p>
                </div>
              </div>
            </div>

            <el-card v-if="showHint" class="!absolute right-8 top-4 !border-none !rounded-2xl !shadow-xl">
              <p class="text-xl leading-8">恭喜你发现了隐藏时态！<br />（{{ conjugation.zh }}）</p>
            </el-card>
          </div>

          <div class="mt-8 rounded-3xl border border-[#e1e6ec] bg-[#f2f5f8] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <div class="grid grid-cols-2 gap-10">
              <div>
                <p class="text-4xl font-700">时间（Time）：</p>
                <div class="mt-4 flex gap-4">
                  <button v-for="item in timeOptions" :key="item.value" class="pill" :class="selectedTime === item.value ? 'pill-time-active' : 'pill-default'" @click="selectedTime = item.value">
                    {{ item.label }}
                  </button>
                </div>
              </div>
              <div>
                <p class="text-4xl font-700">状态（State）：</p>
                <div class="mt-4 flex gap-4">
                  <button v-for="item in stateOptions" :key="item.value" class="pill" :class="selectedState === item.value ? item.activeClass : 'pill-default'" @click="selectedState = item.value">
                    {{ item.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <el-card class="mt-6 !rounded-2xl !border-none !bg-white/80">
            <p class="text-2xl"><strong>生成句子：</strong>{{ sentence.en }}</p>
            <p class="text-xl text-[#6b7280] mt-2"><strong>中文：</strong>{{ sentence.zh }}</p>
          </el-card>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type TimeType = 'past' | 'now' | 'future'
type StateType = 'simple' | 'progressive' | 'perfect'

const exploreMode = ref(false)
const selectedTime = ref<TimeType>('future')
const selectedState = ref<StateType>('simple')
const timeValue = ref(50)

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
</script>

<style scoped>
.label {
  @apply mb-3 text-center text-4xl font-650;
}

.word-card {
  @apply rounded-2xl border border-[#dee4eb] bg-[#f8fafb] py-6 text-center shadow-[0_6px_16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)];
}

.word-card .en {
  @apply text-6xl font-650 leading-none;
}

.word-card .zh {
  @apply mt-4 text-4xl text-[#4b5563];
}

.chip,
.pill {
  @apply border border-[#d7dde5] bg-[#f5f7fa] text-3xl rounded-full px-5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_10px_rgba(15,23,42,0.07)] transition;
}

.chip-active {
  @apply bg-[#ea5a55] text-white shadow-[0_8px_16px_rgba(234,90,85,0.35)];
}

.chip-default {
  @apply text-[#1f2937];
}

.timeline-shell {
  @apply relative h-14 rounded-full bg-gradient-to-r from-[#dce3ea] to-[#c9d4e2] px-8 shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)];
}

.timeline-arrow {
  @apply absolute right-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[18px] border-l-[26px] border-y-transparent border-l-[#aeb9c8];
}

.timeline-point {
  @apply absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full;
}

.timeline-now {
  @apply bg-white shadow-lg;
}

.timeline-target {
  @apply bg-[#8a4eff] shadow-[0_0_0_8px_rgba(138,78,255,0.15)];
}

.pill {
  @apply min-w-32 rounded-2xl px-8 py-3 text-4xl;
}

.pill-default {
  @apply text-[#111827];
}

.pill-time-active {
  @apply bg-[#2f88ff] text-white shadow-[0_10px_22px_rgba(47,136,255,0.45)];
}

.pill-state-simple {
  @apply bg-[#8a4eff] text-white shadow-[0_10px_22px_rgba(138,78,255,0.45)];
}

.pill-state-progressive {
  @apply bg-[#1d9a72] text-white shadow-[0_10px_22px_rgba(29,154,114,0.45)];
}

.pill-state-perfect {
  @apply bg-[#f59e0b] text-white shadow-[0_10px_22px_rgba(245,158,11,0.45)];
}
</style>
