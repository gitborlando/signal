import { fireEvent, render } from '@testing-library/react'
import { FC } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useHookSignal, useSignal } from '../index'

// 简单计数器组件
const Counter: FC = () => {
  const count = useSignal(0)
  const value = useHookSignal(count)
  return (
    <div>
      <span data-testid='count'>{value}</span>
      <button data-testid='inc' onClick={() => count.dispatch(value + 1)}>
        +
      </button>
    </div>
  )
}

describe('useSignal & useHookSignal', () => {
  it('should create signal and update value in React component', () => {
    const { getByTestId } = render(<Counter />)
    const count = getByTestId('count')
    const inc = getByTestId('inc')
    expect(count.textContent).toBe('0')
    fireEvent.click(inc)
    expect(count.textContent).toBe('1')
    fireEvent.click(inc)
    expect(count.textContent).toBe('2')
  })

  it('should support useHookSignal with callback', () => {
    const spy = vi.fn()
    const CallbackCounter: FC = () => {
      const count = useSignal(0)
      useHookSignal(count, (value, _old, forceUpdate) => {
        spy(value)
        forceUpdate()
      })
      return (
        <button data-testid='inc' onClick={() => count.dispatch(count.value + 1)}>
          {count.value}
        </button>
      )
    }
    const { getByTestId } = render(<CallbackCounter />)
    const btn = getByTestId('inc')
    expect(btn.textContent).toBe('0')
    fireEvent.click(btn)
    expect(btn.textContent).toBe('1')
    expect(spy).toHaveBeenCalledWith(1)
  })
})
