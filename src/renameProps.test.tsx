import { createRef, use, type ComponentType, type Ref } from 'react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createSkeleton } from './createSkeleton'
import { renameProps } from './renameProps'
import { createCardBones, deferred } from './test/helpers'

interface BadgeBonesProps {
  loadingLabel: string
  lines: number
  tone?: 'info' | 'warning'
  ref?: Ref<HTMLDivElement>
}

/** Bones fixture declaring skully's reserved `loadingLabel`; reports received props through `spy`. */
function createBadgeBones() {
  const spy = vi.fn<(props: BadgeBonesProps) => void>()

  function BadgeBones(props: BadgeBonesProps) {
    spy(props)
    const { loadingLabel, tone = 'info', ref } = props
    return (
      <div ref={ref} data-testid="bones" data-tone={tone} aria-hidden="true">
        <span data-testid="badge">{loadingLabel}</span>
      </div>
    )
  }

  return { BadgeBones, spy }
}

describe('renameProps', () => {
  it('renders the wrapped component', () => {
    const { CardBones } = createCardBones()
    const Renamed = renameProps(CardBones, { lines: 'rows' })

    render(<Renamed rows={2} />)

    expect(screen.getAllByTestId('bone-line')).toHaveLength(2)
  })

  it('passes a renamed prop under its original name, other props unchanged', () => {
    const { BadgeBones, spy } = createBadgeBones()
    const Renamed = renameProps(BadgeBones, { loadingLabel: 'badge' })

    render(<Renamed badge="NEW" lines={2} tone="warning" />)

    expect(screen.getByTestId('badge').textContent).toBe('NEW')
    expect(spy).toHaveBeenLastCalledWith({ loadingLabel: 'NEW', lines: 2, tone: 'warning' })
  })

  it('handles several renames at once', () => {
    const { BadgeBones, spy } = createBadgeBones()
    const Renamed = renameProps(BadgeBones, { loadingLabel: 'badge', tone: 'intent' })

    render(<Renamed badge="NEW" lines={1} intent="warning" />)

    expect(screen.getByTestId('bones').dataset.tone).toBe('warning')
    expect(spy).toHaveBeenLastCalledWith({ loadingLabel: 'NEW', lines: 1, tone: 'warning' })
  })

  it('passes `ref` through', () => {
    const { BadgeBones } = createBadgeBones()
    const Renamed = renameProps(BadgeBones, { loadingLabel: 'badge' })
    const ref = createRef<HTMLDivElement>()

    render(<Renamed badge="NEW" lines={1} ref={ref} />)

    expect(ref.current).toBe(screen.getByTestId('bones'))
  })

  it('does not mangle props named like Object.prototype keys', () => {
    const received = vi.fn<(props: object) => void>()
    function Bones(props: { loadingLabel: string }) {
      received(props)
      return null
    }
    // Simulates an untyped caller passing extra props the component does not declare.
    const Renamed = renameProps(Bones, { loadingLabel: 'badge' }) as unknown as ComponentType<
      Record<string, unknown>
    >

    render(<Renamed badge="NEW" constructor="c" toString="t" hasOwnProperty="h" />)

    expect(received).toHaveBeenLastCalledWith({
      loadingLabel: 'NEW',
      constructor: 'c',
      toString: 't',
      hasOwnProperty: 'h',
    })
  })

  describe('displayName', () => {
    it('is `Renamed(Name)`', () => {
      function ProfileBones(_: { loadingLabel: string }) {
        return null
      }
      expect(renameProps(ProfileBones, { loadingLabel: 'badge' }).displayName).toBe(
        'Renamed(ProfileBones)',
      )
    })

    it('prefers an explicit displayName', () => {
      function Bones(_: { loadingLabel: string }) {
        return null
      }
      Bones.displayName = 'ProfileBones'
      expect(renameProps(Bones, { loadingLabel: 'badge' }).displayName).toBe(
        'Renamed(ProfileBones)',
      )
    })

    it('is nested inside the createSkeleton names', () => {
      const { BadgeBones } = createBadgeBones()
      const { Skeleton, SuspenseSkeleton } = createSkeleton(
        renameProps(BadgeBones, { loadingLabel: 'badge' }),
      )
      expect(Skeleton.displayName).toBe('Skeleton(Renamed(BadgeBones))')
      expect(SuspenseSkeleton.displayName).toBe('SuspenseSkeleton(Renamed(BadgeBones))')
    })
  })

  describe('with createSkeleton', () => {
    function setup() {
      const { BadgeBones, spy } = createBadgeBones()
      const skeleton = createSkeleton(renameProps(BadgeBones, { loadingLabel: 'badge' }))
      return { ...skeleton, spy }
    }

    it('gives bones their `loadingLabel` from `badge` while skully keeps its own `loadingLabel`', () => {
      const { Skeleton, spy } = setup()

      render(
        <Skeleton isLoading badge="NEW" lines={1} loadingLabel="Loading card">
          <p>Real content</p>
        </Skeleton>,
      )

      expect(screen.getByTestId('badge').textContent).toBe('NEW')
      expect(screen.getByRole('status').textContent).toBe('Loading card')
      expect(screen.queryByText('Real content')).toBeNull()
      expect(spy).toHaveBeenLastCalledWith({ loadingLabel: 'NEW', lines: 1 })
    })

    it('does the same in the SuspenseSkeleton fallback', async () => {
      const { SuspenseSkeleton, spy } = setup()
      const { promise, resolve } = deferred<string>()
      function Reader() {
        return <p>{use(promise)}</p>
      }

      await act(async () => {
        render(
          <SuspenseSkeleton badge="NEW" lines={1} loadingLabel="Loading card">
            <Reader />
          </SuspenseSkeleton>,
        )
      })

      expect(screen.getByTestId('badge').textContent).toBe('NEW')
      expect(screen.getByRole('status').textContent).toBe('Loading card')
      expect(spy).toHaveBeenLastCalledWith({ loadingLabel: 'NEW', lines: 1 })

      await act(async () => resolve('Real content'))

      expect(screen.getByText('Real content')).not.toBeNull()
      expect(screen.queryByTestId('bones')).toBeNull()
      expect(screen.queryByRole('status')).toBeNull()
    })
  })
})
