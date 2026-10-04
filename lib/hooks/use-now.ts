import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let now = Math.floor(Date.now() / 1000)
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  now = Math.floor(Date.now() / 1000)
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    tick()
    timer = setInterval(tick, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

const idle = () => () => {}
const getNow = () => now

/** Unix seconds from one app-wide 1s clock; `active: false` freezes the value and stops re-rendering. */
export function useNowSeconds(active = true): number {
  return useSyncExternalStore(active ? subscribe : idle, getNow)
}
