import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c')
  })

  it('skips false, null, undefined and empty strings', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns an empty string when nothing is truthy', () => {
    expect(cx()).toBe('')
    expect(cx(false, null, undefined, '')).toBe('')
  })
})
