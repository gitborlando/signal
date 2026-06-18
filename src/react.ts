import { useCallback, useRef, useSyncExternalStore } from 'react'
import { Signal } from './signal'
import type { Hook } from './types'

export function useSignal<T>(signal: Signal<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => signal.hook(onStoreChange as Hook<T>),
    [signal]
  )

  return useSyncExternalStore(
    subscribe,
    () => signal.value,
    () => signal.value
  )
}

export function useEventSignal(signal: Signal<void>) {
  const last = useRef({})

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      signal.hook(() => {
        last.current = {}
        onStoreChange()
      }),
    [signal]
  )

  return useSyncExternalStore(
    subscribe,
    () => last.current,
    () => last.current
  )
}
