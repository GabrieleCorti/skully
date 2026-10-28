import { StrictMode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHasRevealed } from './useHasRevealed'

const renderUseHasRevealed = (isLoading: boolean, options?: { wrapper: typeof StrictMode }) =>
  renderHook(({ isLoading }) => useHasRevealed(isLoading), {
    initialProps: { isLoading },
    ...options,
  })

describe('useHasRevealed', () => {
  it('is false when mounted loading', () => {
    const { result } = renderUseHasRevealed(true)
    expect(result.current).toBe(false)
  })

  it('is true when mounted not loading', () => {
    const { result } = renderUseHasRevealed(false)
    expect(result.current).toBe(true)
  })

  it('becomes true when loading finishes', () => {
    const { result, rerender } = renderUseHasRevealed(true)
    rerender({ isLoading: false })
    expect(result.current).toBe(true)
  })

  it('stays true when loading starts again', () => {
    const { result, rerender } = renderUseHasRevealed(true)
    rerender({ isLoading: false })
    rerender({ isLoading: true })
    expect(result.current).toBe(true)
  })

  it('stays false while loading never finishes', () => {
    const { result, rerender } = renderUseHasRevealed(true)
    rerender({ isLoading: true })
    rerender({ isLoading: true })
    expect(result.current).toBe(false)
  })

  it('never goes back to false across repeated loading cycles', () => {
    const { result, rerender } = renderUseHasRevealed(false)
    for (const isLoading of [true, false, true, true, false, true]) {
      rerender({ isLoading })
      expect(result.current).toBe(true)
    }
  })

  it('stays true across repeated renders while not loading', () => {
    const { result, rerender } = renderUseHasRevealed(true)
    rerender({ isLoading: false })
    rerender({ isLoading: false })
    expect(result.current).toBe(true)
  })

  it('starts over in a new instance', () => {
    const first = renderUseHasRevealed(false)
    first.rerender({ isLoading: true })
    expect(first.result.current).toBe(true)

    const second = renderUseHasRevealed(true)
    expect(second.result.current).toBe(false)
  })

  it('behaves the same under StrictMode', () => {
    const { result, rerender } = renderUseHasRevealed(true, { wrapper: StrictMode })
    expect(result.current).toBe(false)
    rerender({ isLoading: false })
    rerender({ isLoading: true })
    expect(result.current).toBe(true)
  })

  it('is true under StrictMode when mounted not loading', () => {
    const { result, rerender } = renderUseHasRevealed(false, { wrapper: StrictMode })
    expect(result.current).toBe(true)
    rerender({ isLoading: true })
    expect(result.current).toBe(true)
  })
})
