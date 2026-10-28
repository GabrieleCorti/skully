import { StrictMode, createRef, startTransition, use, useState, type ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSkeleton } from './createSkeleton'
import { createCardBones, deferred, fulfilled, renderOnServerAndHydrate } from './test/helpers'

function Content() {
  return <p>Real content</p>
}

function Reader({ promise }: { promise: Promise<string> }) {
  return <p>{use(promise)}</p>
}

function setup() {
  const { CardBones, spy } = createCardBones()
  const { Skeleton, SuspenseSkeleton } = createSkeleton(CardBones)
  return { Skeleton, SuspenseSkeleton, spy }
}

const bones = () => screen.queryByTestId('bones')
const content = () => screen.queryByText('Real content')
const status = () => screen.queryByRole('status')

/** Asserts the skeleton (bones) is shown and the real content is not. */
function expectSkeleton() {
  expect(bones()).not.toBeNull()
  expect(content()).toBeNull()
}

/** Asserts the real content is shown and the skeleton (bones + status) is not. */
function expectContent() {
  expect(content()).not.toBeNull()
  expect(bones()).toBeNull()
  expect(status()).toBeNull()
}

describe('Skeleton', () => {
  it('renders bones and does not render children when mounted loading', () => {
    const { Skeleton } = setup()
    const Child = vi.fn(Content)

    render(
      <Skeleton isLoading lines={2}>
        <Child />
      </Skeleton>,
    )

    expectSkeleton()
    expect(screen.getAllByTestId('bone-line')).toHaveLength(2)
    expect(Child).not.toHaveBeenCalled()
  })

  it('renders children and never renders bones when mounted not loading', () => {
    const { Skeleton, spy } = setup()

    render(
      <Skeleton isLoading={false} lines={2}>
        <Content />
      </Skeleton>,
    )

    expectContent()
    expect(spy).not.toHaveBeenCalled()
  })

  it('renders nothing when not loading and there are no children', () => {
    const { Skeleton } = setup()
    const { container } = render(<Skeleton isLoading={false} lines={1} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders children as-is, adding no DOM of its own', () => {
    const { Skeleton } = setup()
    const children = (
      <>
        Some text
        <p>One</p>
        <>
          <p>Two</p>
          <p>Three</p>
        </>
      </>
    )

    const expected = render(children).container.innerHTML
    const { container } = render(
      <Skeleton isLoading={false} lines={1}>
        {children}
      </Skeleton>,
    )

    expect(container.innerHTML).toBe(expected)
  })

  it('switches to children when loading finishes', () => {
    const { Skeleton } = setup()
    const ui = (isLoading: boolean) => (
      <Skeleton isLoading={isLoading} lines={1}>
        <Content />
      </Skeleton>
    )
    const { rerender } = render(ui(true))
    expectSkeleton()

    rerender(ui(false))
    expectContent()
  })

  describe('default (initial) mode', () => {
    it('keeps children when loading starts after mounting not loading', () => {
      const { Skeleton, spy } = setup()
      const ui = (isLoading: boolean) => (
        <Skeleton isLoading={isLoading} lines={1}>
          <Content />
        </Skeleton>
      )
      const { rerender } = render(ui(false))

      rerender(ui(true))

      expectContent()
      expect(spy).not.toHaveBeenCalled()
    })

    it('keeps children on every refetch after an initial load', () => {
      const { Skeleton } = setup()
      const ui = (isLoading: boolean) => (
        <Skeleton isLoading={isLoading} lines={1}>
          <Content />
        </Skeleton>
      )
      const { rerender } = render(ui(true))

      for (const isLoading of [false, true, false, true]) {
        rerender(ui(isLoading))
        expectContent()
      }
    })
  })

  describe('`always`', () => {
    it('shows bones whenever loading, including after content was shown', () => {
      const { Skeleton } = setup()
      const ui = (isLoading: boolean) => (
        <Skeleton isLoading={isLoading} always lines={1}>
          <Content />
        </Skeleton>
      )
      const { rerender } = render(ui(true))
      expectSkeleton()

      rerender(ui(false))
      expectContent()

      rerender(ui(true))
      expectSkeleton()

      rerender(ui(false))
      expectContent()
    })

    it('renders children when mounted not loading', () => {
      const { Skeleton } = setup()
      render(
        <Skeleton isLoading={false} always lines={1}>
          <Content />
        </Skeleton>,
      )
      expectContent()
    })
  })

  describe('toggling `always` at runtime', () => {
    const renderToggle = () => {
      const { Skeleton } = setup()
      const ui = (isLoading: boolean, always: boolean) => (
        <Skeleton isLoading={isLoading} always={always} lines={1}>
          <Content />
        </Skeleton>
      )
      return { ui, ...render(ui(true, false)) }
    }

    it('falls back to initial mode using the reveal tracked while `always` was on', () => {
      const { ui, rerender } = renderToggle()

      rerender(ui(false, true))
      rerender(ui(true, true))
      expectSkeleton()

      rerender(ui(true, false))
      expectContent()
    })

    it('tracks a reveal that happened only while `always` was on', () => {
      const { ui, rerender } = renderToggle()

      rerender(ui(true, true))
      rerender(ui(false, true))
      rerender(ui(true, false))

      expectContent()
    })

    it('keeps bones when content was never revealed', () => {
      const { ui, rerender } = renderToggle()

      rerender(ui(true, true))
      rerender(ui(true, false))

      expectSkeleton()
    })

    it('shows bones while loading when `always` is turned on after a reveal', () => {
      const { ui, rerender } = renderToggle()

      rerender(ui(false, false))
      rerender(ui(true, false))
      expectContent()

      rerender(ui(true, true))
      expectSkeleton()
    })
  })

  describe('props', () => {
    it('forwards props to bones and never forwards reserved props', () => {
      const { Skeleton, spy } = setup()

      render(
        <Skeleton isLoading always label="Fetching" lines={3} variant="compact">
          <Content />
        </Skeleton>,
      )

      expect(screen.getAllByTestId('bone-line')).toHaveLength(3)
      expect(bones()?.dataset.variant).toBe('compact')
      // Exact equality: no `isLoading`, `always`, `label` or `children` reach Bones.
      expect(spy).toHaveBeenCalled()
      for (const [props] of spy.mock.calls) {
        expect(props).toEqual({ lines: 3, variant: 'compact' })
      }
    })

    it('never forwards reserved props even when Bones declares them', () => {
      const received = vi.fn<(props: object) => void>()
      function ClashingBones(props: { width: number; label: string; children: string }) {
        received(props)
        return <div data-testid="bones" />
      }
      // Declaring reserved props is a compile error; the cast simulates an untyped (JS)
      // caller, for whom the runtime stripping is the only safety net.
      const { Skeleton } = createSkeleton(
        ClashingBones as unknown as ComponentType<{ width: number }>,
      )

      render(
        <Skeleton isLoading label="Library label" width={10}>
          <Content />
        </Skeleton>,
      )

      expect(screen.getByRole('status').textContent).toBe('Library label')
      expect(received).toHaveBeenCalled()
      for (const [props] of received.mock.calls) {
        expect(props).toEqual({ width: 10 })
      }
    })

    it('forwards `ref` to bones and releases it when children replace them', () => {
      const { Skeleton } = setup()
      const ref = createRef<HTMLDivElement>()
      const ui = (isLoading: boolean) => (
        <Skeleton isLoading={isLoading} lines={1} ref={ref}>
          <Content />
        </Skeleton>
      )
      const { rerender } = render(ui(true))

      expect(ref.current).not.toBeNull()
      expect(ref.current).toBe(bones())

      rerender(ui(false))
      expect(ref.current).toBeNull()
    })
  })

  it('starts over when remounted', () => {
    const { Skeleton } = setup()
    const ui = (isLoading: boolean, key: string) => (
      <Skeleton key={key} isLoading={isLoading} lines={1}>
        <Content />
      </Skeleton>
    )
    const { rerender } = render(ui(false, 'a'))

    rerender(ui(true, 'a'))
    expectContent()

    rerender(ui(true, 'b'))
    expectSkeleton()
  })

  describe('StrictMode', () => {
    it('behaves the same in default mode', () => {
      const { Skeleton } = setup()
      const ui = (isLoading: boolean) => (
        <StrictMode>
          <Skeleton isLoading={isLoading} lines={1}>
            <Content />
          </Skeleton>
        </StrictMode>
      )
      const { rerender } = render(ui(true))
      expectSkeleton()

      rerender(ui(false))
      expectContent()

      rerender(ui(true))
      expectContent()
    })

    it('behaves the same with `always`', () => {
      const { Skeleton } = setup()
      const ui = (isLoading: boolean) => (
        <StrictMode>
          <Skeleton isLoading={isLoading} always lines={1}>
            <Content />
          </Skeleton>
        </StrictMode>
      )
      const { rerender } = render(ui(false))
      expectContent()

      rerender(ui(true))
      expectSkeleton()
    })
  })

  describe('SSR', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([
      { isLoading: true, always: false },
      { isLoading: false, always: false },
      { isLoading: true, always: true },
      { isLoading: false, always: true },
    ])(
      'hydrates without mismatch (isLoading: $isLoading, always: $always)',
      async ({ isLoading, always }) => {
        const { Skeleton } = setup()
        const { html, container, onRecoverableError, consoleError, unmount } =
          await renderOnServerAndHydrate(
            <Skeleton isLoading={isLoading} always={always} lines={2}>
              <Content />
            </Skeleton>,
          )

        expect(onRecoverableError).not.toHaveBeenCalled()
        expect(consoleError).not.toHaveBeenCalled()
        expect(container.innerHTML).toBe(html)

        const view = within(container)
        expect(view.queryByTestId('bones') !== null).toBe(isLoading)
        expect(view.queryByRole('status') !== null).toBe(isLoading)
        expect(view.queryByText('Real content') !== null).toBe(!isLoading)
        unmount()
      },
    )
  })
})

describe('label', () => {
  it('renders a default visually hidden status only while the skeleton is shown', () => {
    const { Skeleton } = setup()
    const { rerender } = render(
      <Skeleton isLoading lines={1}>
        <Content />
      </Skeleton>,
    )

    expect(screen.getByRole('status').textContent).toBe('Loading…')

    rerender(
      <Skeleton isLoading={false} lines={1}>
        <Content />
      </Skeleton>,
    )
    expect(status()).toBeNull()
  })

  it('hides the status visually without a stylesheet', () => {
    const { Skeleton } = setup()
    render(<Skeleton isLoading lines={1} />)

    const { style } = screen.getByRole('status')
    expect(style.position).toBe('absolute')
    expect(style.width).toBe('1px')
    expect(style.height).toBe('1px')
    expect(style.margin).toBe('-1px')
    expect(style.overflow).toBe('hidden')
    expect(style.clip).toBe('rect(0px, 0px, 0px, 0px)')
    expect(style.whiteSpace).toBe('nowrap')
  })

  it('renders a custom string', () => {
    const { Skeleton } = setup()
    render(<Skeleton isLoading lines={1} label="Loading profile" />)
    expect(screen.getByRole('status').textContent).toBe('Loading profile')
  })

  it('renders a custom node', () => {
    const { Skeleton } = setup()
    render(<Skeleton isLoading lines={1} label={<em>Caricamento…</em>} />)
    const label = within(screen.getByRole('status')).getByText('Caricamento…')
    expect(label.tagName).toBe('EM')
  })

  it('renders no status element with `label={false}`', () => {
    const { Skeleton } = setup()
    const { container } = render(<Skeleton isLoading lines={1} label={false} />)
    expect(bones()).not.toBeNull()
    expect(status()).toBeNull()
    expect(container.childElementCount).toBe(1)
  })

  it('renders no status element with `label={null}`', () => {
    const { Skeleton } = setup()
    const { container } = render(<Skeleton isLoading lines={1} label={null} />)
    expect(bones()).not.toBeNull()
    expect(status()).toBeNull()
    expect(container.childElementCount).toBe(1)
  })

  it('renders the default status with `label={undefined}`', () => {
    const { Skeleton } = setup()
    render(<Skeleton isLoading lines={1} label={undefined} />)
    expect(screen.getByRole('status').textContent).toBe('Loading…')
  })

  it('places the status next to the bones without a wrapper', () => {
    const { Skeleton } = setup()
    const { container } = render(<Skeleton isLoading lines={1} />)
    expect(Array.from(container.children)).toEqual([bones(), screen.getByRole('status')])
  })

  it('is not rendered when children are kept during a refetch in default mode', () => {
    const { Skeleton } = setup()
    const ui = (isLoading: boolean) => (
      <Skeleton isLoading={isLoading} lines={1}>
        <Content />
      </Skeleton>
    )
    const { rerender } = render(ui(true))
    rerender(ui(false))
    rerender(ui(true))

    expect(status()).toBeNull()
  })

  it('follows the skeleton when `always` shows it again', () => {
    const { Skeleton } = setup()
    const ui = (isLoading: boolean) => (
      <Skeleton isLoading={isLoading} always lines={1} label="Refreshing">
        <Content />
      </Skeleton>
    )
    const { rerender } = render(ui(true))
    expect(screen.getByRole('status').textContent).toBe('Refreshing')

    rerender(ui(false))
    expect(status()).toBeNull()

    rerender(ui(true))
    expect(screen.getByRole('status').textContent).toBe('Refreshing')

    rerender(ui(false))
    expect(status()).toBeNull()
  })
})

describe('SuspenseSkeleton', () => {
  it('shows bones and label while a child suspends, then the children', async () => {
    const { SuspenseSkeleton } = setup()
    const { promise, resolve } = deferred<string>()

    await act(async () => {
      render(
        <SuspenseSkeleton lines={2}>
          <Reader promise={promise} />
        </SuspenseSkeleton>,
      )
    })

    expect(screen.getAllByTestId('bone-line')).toHaveLength(2)
    expect(screen.getByRole('status').textContent).toBe('Loading…')

    await act(async () => resolve('Resolved content'))

    expect(screen.getByText('Resolved content')).not.toBeNull()
    expect(bones()).toBeNull()
    expect(status()).toBeNull()
  })

  it('renders children directly when nothing suspends', () => {
    const { SuspenseSkeleton, spy } = setup()
    render(
      <SuspenseSkeleton lines={1}>
        <Content />
      </SuspenseSkeleton>,
    )
    expectContent()
    expect(spy).not.toHaveBeenCalled()
  })

  it('renders the fallback status next to the bones without a wrapper', async () => {
    const { SuspenseSkeleton } = setup()

    const { container } = await act(async () =>
      render(
        <SuspenseSkeleton lines={1} label="Loading profile">
          <Reader promise={deferred<string>().promise} />
        </SuspenseSkeleton>,
      ),
    )

    const statusElement = screen.getByRole('status')
    expect(statusElement.textContent).toBe('Loading profile')
    expect(Array.from(container.children)).toEqual([bones(), statusElement])
  })

  it.each([false, null] as const)(
    'renders no fallback status element with `label={%s}`',
    async (label) => {
      const { SuspenseSkeleton } = setup()

      const { container } = await act(async () =>
        render(
          <SuspenseSkeleton lines={1} label={label}>
            <Reader promise={deferred<string>().promise} />
          </SuspenseSkeleton>,
        ),
      )

      expectSkeleton()
      expect(status()).toBeNull()
      expect(Array.from(container.children)).toEqual([bones()])
    },
  )

  it('renders the default fallback status with `label={undefined}`', async () => {
    const { SuspenseSkeleton } = setup()

    await act(async () =>
      render(
        <SuspenseSkeleton lines={1} label={undefined}>
          <Reader promise={deferred<string>().promise} />
        </SuspenseSkeleton>,
      ),
    )

    expectSkeleton()
    expect(screen.getByRole('status').textContent).toBe('Loading…')
  })

  it('forwards props to bones and never forwards reserved props', async () => {
    const { SuspenseSkeleton, spy } = setup()
    // Untyped callers could still pass Skeleton-only props at runtime.
    const Untyped = SuspenseSkeleton as ComponentType<Record<string, unknown>>

    await act(async () => {
      render(
        <Untyped isLoading always label={false} lines={4} variant="compact">
          <Reader promise={deferred<string>().promise} />
        </Untyped>,
      )
    })

    expect(screen.getAllByTestId('bone-line')).toHaveLength(4)
    expect(status()).toBeNull()
    expect(spy).toHaveBeenCalled()
    for (const [props] of spy.mock.calls) {
      expect(props).toEqual({ lines: 4, variant: 'compact' })
    }
  })

  it('forwards `ref` to the fallback bones', async () => {
    const { SuspenseSkeleton } = setup()
    const ref = createRef<HTMLDivElement>()

    await act(async () => {
      render(
        <SuspenseSkeleton lines={1} ref={ref}>
          <Reader promise={deferred<string>().promise} />
        </SuspenseSkeleton>,
      )
    })

    expect(ref.current).not.toBeNull()
    expect(ref.current).toBe(bones())
  })

  it('server-renders the fallback for a suspending child', () => {
    const { SuspenseSkeleton } = setup()
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <SuspenseSkeleton lines={2}>
        <Reader promise={deferred<string>().promise} />
      </SuspenseSkeleton>,
    )

    const view = within(container)
    expect(view.getAllByTestId('bone-line')).toHaveLength(2)
    expect(view.getByRole('status').textContent).toBe('Loading…')
  })

  it('hydrates server-rendered children without mismatch', async () => {
    const { SuspenseSkeleton } = setup()
    const { html, container, onRecoverableError, consoleError, unmount } =
      await renderOnServerAndHydrate(
        <SuspenseSkeleton lines={1}>
          <Reader promise={fulfilled('Server content')} />
        </SuspenseSkeleton>,
      )

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()
    expect(container.innerHTML).toBe(html)
    expect(within(container).getByText('Server content')).not.toBeNull()
    unmount()
    vi.restoreAllMocks()
  })

  describe('re-suspension', () => {
    function renderSwitcher(next: Promise<string>) {
      const { SuspenseSkeleton } = setup()

      function Switcher() {
        const [promise, setPromise] = useState(() => fulfilled('First item'))
        return (
          <>
            <button onClick={() => setPromise(next)}>Plain</button>
            <button onClick={() => startTransition(() => setPromise(next))}>Transition</button>
            <SuspenseSkeleton lines={1}>
              <Reader promise={promise} />
            </SuspenseSkeleton>
          </>
        )
      }

      render(<Switcher />)
      expect(screen.getByText('First item')).not.toBeNull()
    }

    const click = (name: string) =>
      act(async () => fireEvent.click(screen.getByRole('button', { name })))

    it('keeps previous content for updates in a transition', async () => {
      const next = deferred<string>()
      renderSwitcher(next.promise)

      await click('Transition')

      expect(screen.getByText('First item').style.display).not.toBe('none')
      expect(bones()).toBeNull()
      expect(status()).toBeNull()

      await act(async () => next.resolve('Second item'))
      expect(screen.getByText('Second item')).not.toBeNull()
      expect(screen.queryByText('First item')).toBeNull()
    })

    it('shows the fallback again for non-transition updates', async () => {
      const next = deferred<string>()
      renderSwitcher(next.promise)

      await click('Plain')

      expect(bones()).not.toBeNull()
      expect(screen.getByRole('status').textContent).toBe('Loading…')
      // React keeps the previous tree mounted but hides it while the fallback shows.
      expect(screen.getByText('First item').style.display).toBe('none')

      await act(async () => next.resolve('Second item'))
      expect(screen.getByText('Second item')).not.toBeNull()
      expect(bones()).toBeNull()
      expect(status()).toBeNull()
    })
  })
})

describe('displayName', () => {
  it('uses the bones component name', () => {
    function UserCardBones() {
      return null
    }
    const { Skeleton, SuspenseSkeleton } = createSkeleton(UserCardBones)
    expect(Skeleton.displayName).toBe('Skeleton(UserCardBones)')
    expect(SuspenseSkeleton.displayName).toBe('SuspenseSkeleton(UserCardBones)')
  })

  it('prefers an explicit displayName', () => {
    function Bones() {
      return null
    }
    Bones.displayName = 'ProfileBones'
    const { Skeleton, SuspenseSkeleton } = createSkeleton(Bones)
    expect(Skeleton.displayName).toBe('Skeleton(ProfileBones)')
    expect(SuspenseSkeleton.displayName).toBe('SuspenseSkeleton(ProfileBones)')
  })

  it("falls back to 'Component' for anonymous bones", () => {
    // Functions created inside an array literal get no inferred name.
    const [AnonymousBones] = [() => null]
    expect(AnonymousBones.name).toBe('')

    const { Skeleton, SuspenseSkeleton } = createSkeleton(AnonymousBones)
    expect(Skeleton.displayName).toBe('Skeleton(Component)')
    expect(SuspenseSkeleton.displayName).toBe('SuspenseSkeleton(Component)')
  })
})
