import { createRef, type ComponentProps, type ComponentType, type ReactNode, type Ref } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, type Mock, type MockInstance } from 'vitest'

export interface CardBonesProps {
  lines: number
  variant?: 'compact' | 'wide'
  ref?: Ref<HTMLDivElement>
}

/** Bones fixture that reports the props it received through `spy`. */
export function createCardBones() {
  const spy = vi.fn<(props: CardBonesProps) => void>()

  function CardBones(props: CardBonesProps) {
    spy(props)
    const { lines, variant = 'wide', ref } = props
    return (
      <div ref={ref} data-testid="bones" data-variant={variant} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} data-testid="bone-line" />
        ))}
      </div>
    )
  }

  return { CardBones, spy }
}

/** A promise React's `use()` reads synchronously, without suspending. */
export function fulfilled<T>(value: T): Promise<T> {
  return Object.assign(Promise.resolve(value), { status: 'fulfilled', value })
}

/** A promise that stays pending until `resolve` is called. */
export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

export interface HydrationResult {
  /** Markup produced by `renderToString`. */
  html: string
  /** The server-rendered container, after hydration. */
  container: HTMLDivElement
  onRecoverableError: Mock<(error: unknown) => void>
  consoleError: MockInstance<typeof console.error>
  unmount: () => void
}

/**
 * Renders `ui` on the server, then hydrates the same element on the client,
 * recording hydration errors and console errors along the way.
 * Call `unmount` (and restore mocks) when done.
 */
export async function renderOnServerAndHydrate(ui: ReactNode): Promise<HydrationResult> {
  const html = renderToString(ui)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)

  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const onRecoverableError = vi.fn<(error: unknown) => void>()

  let root: Root | undefined
  await act(async () => {
    root = hydrateRoot(container, ui, { onRecoverableError })
  })

  const unmount = () => {
    act(() => root?.unmount())
    container.remove()
  }
  return { html, container, onRecoverableError, consoleError, unmount }
}

/**
 * Shared behaviour suite for the default bones (`Line`, `Circle`, `Rect`):
 * each is a decorative `<span>` that forwards native props and merges `className`.
 */
export function describeBone(name: string, Bone: ComponentType<ComponentProps<'span'>>) {
  describe(name, () => {
    const renderBone = (props: ComponentProps<'span'> = {}) => {
      render(<Bone data-testid="bone" {...props} />)
      return screen.getByTestId('bone')
    }

    it('renders without crashing', () => {
      expect(renderBone()).toBeTruthy()
    })

    it('is hidden from assistive technology by default', () => {
      expect(renderBone().getAttribute('aria-hidden')).toBe('true')
    })

    it('lets the user override aria-hidden', () => {
      expect(renderBone({ 'aria-hidden': false }).getAttribute('aria-hidden')).toBe('false')
    })

    it('has library classes and no stray falsy values when no className is given', () => {
      const classes = renderBone().className.split(' ')
      expect(classes).toHaveLength(2)
      expect(classes).not.toContain('')
      expect(classes).not.toContain('undefined')
      expect(classes).not.toContain('false')
    })

    it('merges the user className with the library classes', () => {
      const base = renderBone().className.split(' ')
      cleanup()
      const classes = renderBone({ className: 'my-bone' }).className.split(' ')
      expect(classes).toEqual([...base, 'my-bone'])
    })

    it('forwards native span props', () => {
      const onClick = vi.fn()
      const bone = renderBone({ id: 'b1', title: 'Loading', role: 'presentation', onClick })
      expect(bone.id).toBe('b1')
      expect(bone.title).toBe('Loading')
      expect(bone.getAttribute('role')).toBe('presentation')
      fireEvent.click(bone)
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('forwards ref to the span (ref as a prop)', () => {
      const ref = createRef<HTMLSpanElement>()
      const bone = renderBone({ ref })
      expect(ref.current).toBe(bone)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('renders a span that is valid inside a <p>', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        const { container } = render(
          <p>
            <Bone />
          </p>,
        )
        expect(container.querySelector('p > span')).not.toBeNull()
        expect(consoleError).not.toHaveBeenCalled()
        expect(renderToString(<Bone />)).toMatch(/^<span /)
      } finally {
        consoleError.mockRestore()
      }
    })
  })
}
