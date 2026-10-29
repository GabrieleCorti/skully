import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingStatus } from './LoadingStatus'

describe('LoadingStatus', () => {
  it('renders a status element with the default text', () => {
    render(<LoadingStatus />)
    expect(screen.getByRole('status').textContent).toBe('Loading…')
  })

  it('renders custom children', () => {
    render(
      <LoadingStatus>
        <em>Loading profile</em>
      </LoadingStatus>,
    )
    expect(screen.getByRole('status').textContent).toBe('Loading profile')
  })

  it('is visually hidden', () => {
    render(<LoadingStatus />)
    const { style } = screen.getByRole('status')
    expect(style.position).toBe('absolute')
    expect(style.overflow).toBe('hidden')
    expect(style.clip).toBe('rect(0px, 0px, 0px, 0px)')
  })
})
