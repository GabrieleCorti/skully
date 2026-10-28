import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'
import { getDisplayName } from './displayName'

describe('getDisplayName', () => {
  it('prefers displayName over name', () => {
    expect(getDisplayName({ displayName: 'Shown', name: 'Fn' })).toBe('Shown')
  })

  it('falls back to name', () => {
    expect(getDisplayName({ name: 'Fn' })).toBe('Fn')
  })

  it('accepts a bare function component', () => {
    function UserCard() {
      return null
    }
    expect(getDisplayName(UserCard)).toBe('UserCard')
  })

  it('accepts a component typed as ComponentType', () => {
    function UserCard() {
      return null
    }
    const Component: ComponentType = UserCard
    expect(getDisplayName(Component)).toBe('UserCard')
  })

  it('falls back to "Component" when both are empty', () => {
    expect(getDisplayName({ displayName: '', name: '' })).toBe('Component')
    // An anonymous function has an empty `name`.
    const anonymous = [() => null][0]
    expect(anonymous.name).toBe('')
    expect(getDisplayName(anonymous)).toBe('Component')
  })
})
