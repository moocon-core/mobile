import { useEffect, useState } from 'react'
import { useNavigation } from 'expo-router'

/** False until this screen's push animation ends, so heavy sections mount after the slide instead of stalling it. */
export function useAfterTransition(fallbackMs = 600): boolean {
  const navigation = useNavigation()
  const [done, setDone] = useState(false)
  useEffect(() => {
    // The fallback covers deep links and platforms that never emit transitionEnd.
    const timer = setTimeout(() => setDone(true), fallbackMs)
    const unsubscribe = navigation.addListener('transitionEnd' as never, () => setDone(true))
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [navigation, fallbackMs])
  return done
}
