// @vitest-environment jsdom

import { createElement } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { Signal } from '../signal'
import { useEventSignal, useSignal } from '../react'

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

describe('React hooks', () => {
  it('useSignal should return the current signal value and update after dispatch', () => {
    const signal = Signal.create(0)
    const values: number[] = []
    const container = document.createElement('div')
    const root = createRoot(container)

    function Component() {
      const value = useSignal(signal)
      values.push(value)
      return null
    }

    act(() => {
      root.render(createElement(Component))
    })
    expect(values.at(-1)).toBe(0)

    act(() => {
      signal.dispatch(1)
    })
    expect(values.at(-1)).toBe(1)

    act(() => {
      root.unmount()
    })
  })

  it('useEventSignal should update with a new snapshot for each dispatch', () => {
    const signal = Signal.create<void>()
    const snapshots: unknown[] = []
    const container = document.createElement('div')
    const root: Root = createRoot(container)

    function Component() {
      snapshots.push(useEventSignal(signal))
      return null
    }

    act(() => {
      root.render(createElement(Component))
    })
    const firstSnapshot = snapshots.at(-1)

    act(() => {
      signal.dispatch()
    })
    expect(snapshots.at(-1)).not.toBe(firstSnapshot)

    act(() => {
      root.unmount()
    })
  })
})
