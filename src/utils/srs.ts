export const calculateNextInterval = (wrongCount: number, mastered: boolean) => {
  if (wrongCount >= 5) return 1
  if (wrongCount >= 3) return 2
  if (wrongCount >= 1) return 4
  return mastered ? 7 : 3
}

export const addDays = (base: Date, days: number) => {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

export const isDue = (iso: string, now = new Date()) => new Date(iso).getTime() <= now.getTime()
