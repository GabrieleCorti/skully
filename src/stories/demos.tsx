import {
  createContext,
  use,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import type { SkeletonLabel } from '../index'
import { DELAY, USERS, fetchUser, nextUserId, useUserQuery, type UserQuery } from './fakeApi'
import { UserCardSkeleton, UserCardSuspense } from './skeletons'
import { UserCardView } from './UserCard'
import styles from './stories.module.css'

// ---------------------------------------------------------------------------
// Accessibility inspector
// ---------------------------------------------------------------------------

export interface StatusInspectorProps {
  children: ReactNode
}

/**
 * Shows what a screen reader would find: the text of the visually hidden
 * `role="status"` element skully renders next to the bones, or its absence.
 */
export function StatusInspector({ children }: StatusInspectorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const read = () => {
      const element = node.querySelector('[role="status"]')
      setStatus(element ? (element.textContent ?? '') : null)
    }
    const observer = new MutationObserver(read)
    observer.observe(node, { childList: true, subtree: true, characterData: true })
    const frame = requestAnimationFrame(read)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className={styles.column}>
      <div ref={containerRef}>{children}</div>
      <p className={styles.inspector}>
        <span className={styles.inspectorKey}>role=&quot;status&quot;</span>{' '}
        {status === null ? (
          <em>not rendered</em>
        ) : (
          <>
            announces <strong>&quot;{status}&quot;</strong>
          </>
        )}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Initial vs always, driven by a raw `isLoading` flag
// ---------------------------------------------------------------------------

interface ModeColumnProps {
  always: boolean
  isLoading: boolean
  title: string
  hint: string
}

function ModeColumn({ always, isLoading, title, hint }: ModeColumnProps) {
  return (
    <section className={styles.column}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.hint}>{hint}</p>
      <UserCardSkeleton isLoading={isLoading} always={always}>
        {/* The content owns its refetch state: here it dims itself while loading. */}
        <UserCardView user={USERS[0]} busy={isLoading} />
      </UserCardSkeleton>
    </section>
  )
}

/** Two skeletons sharing one `isLoading` flag, one per mode. */
export function ModesDemo() {
  const [isLoading, setIsLoading] = useState(true)
  const [instance, setInstance] = useState(0)

  const simulateLoad = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), DELAY)
  }

  return (
    <div className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setIsLoading((value) => !value)}>
          Toggle isLoading
        </button>
        <button type="button" onClick={simulateLoad}>
          Simulate a {DELAY / 1000}s load
        </button>
        <button type="button" onClick={() => setInstance((n) => n + 1)}>
          Remount
        </button>
        <span className={styles.badge} data-active={isLoading}>
          isLoading = {String(isLoading)}
        </span>
      </div>
      <div className={styles.grid} key={instance}>
        <ModeColumn
          always={false}
          isLoading={isLoading}
          title="Default (initial) mode"
          hint="Skeleton until content has been shown once. Later loads keep the card; the card dims itself."
        />
        <ModeColumn
          always
          isLoading={isLoading}
          title="always"
          hint="Skeleton every time isLoading is true, even after content has been shown."
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Query-driven demo: the child reads its own data
// ---------------------------------------------------------------------------

const UserQueryContext = createContext<UserQuery | null>(null)

/** Reads the query itself instead of receiving `user` as a prop from the parent. */
function ConnectedUserCard() {
  const query = use(UserQueryContext)
  if (!query?.data) return null
  // The child owns its refetch state.
  return <UserCardView user={query.data} busy={query.isFetching} />
}

export interface QueryDemoProps {
  /** Passed to the skeleton's `always` prop. */
  always: boolean
  /** Which query flag drives `isLoading`. */
  signal: 'isPending' | 'isFetching'
  title: string
  hint: string
}

export function QueryDemo({ always, signal, title, hint }: QueryDemoProps) {
  const [userId, setUserId] = useState(1)
  const [refetchToken, setRefetchToken] = useState(0)
  const query = useUserQuery(userId, refetchToken)

  return (
    <section className={styles.column}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.hint}>{hint}</p>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setRefetchToken((t) => t + 1)}>
          Refetch
        </button>
        <button type="button" onClick={() => setUserId(nextUserId)}>
          Next user
        </button>
      </div>
      <div className={styles.toolbar}>
        <span className={styles.badge} data-active={query.isPending}>
          isPending = {String(query.isPending)}
        </span>
        <span className={styles.badge} data-active={query.isFetching}>
          isFetching = {String(query.isFetching)}
        </span>
      </div>
      <UserQueryContext value={query}>
        <UserCardSkeleton isLoading={query[signal]} always={always}>
          <ConnectedUserCard />
        </UserCardSkeleton>
      </UserQueryContext>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Ref forwarding
// ---------------------------------------------------------------------------

export interface RefForwardingDemoProps {
  lines?: number
  compact?: boolean
}

/** Passes a callback ref to the skeleton and reports the element it lands on. */
export function RefForwardingDemo({ lines, compact }: RefForwardingDemoProps) {
  const [measured, setMeasured] = useState('not attached yet')
  const measure = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setMeasured(
        `<${node.tagName.toLowerCase()} aria-hidden="${node.getAttribute('aria-hidden')}"> ` +
          `${node.offsetWidth} × ${node.offsetHeight}px`,
      )
    }
  }, [])

  return (
    <div className={styles.column}>
      <UserCardSkeleton
        key={`${lines}-${compact}`}
        isLoading
        ref={measure}
        lines={lines}
        compact={compact}
      >
        <UserCardView user={USERS[0]} compact={compact} />
      </UserCardSkeleton>
      <p className={styles.inspector}>
        <span className={styles.inspectorKey}>ref.current</span> <code>{measured}</code>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Suspense demos
// ---------------------------------------------------------------------------

export interface SuspendingUserCardProps {
  userId: number
  nonce: number
  compact?: boolean
}

/** Reads its data with `use()`, so it suspends until the user has loaded. */
export function SuspendingUserCard({ userId, nonce, compact }: SuspendingUserCardProps) {
  const user = use(fetchUser(userId, nonce))
  return <UserCardView user={user} compact={compact} />
}

const neverResolves = new Promise<never>(() => {})

/** Suspends forever, so the fallback stays on screen. */
export function ForeverSuspended() {
  use(neverResolves)
  return null
}

export function TransitionDemo() {
  const [userId, setUserId] = useState(1)
  const [nonce, setNonce] = useState(0)
  const [isPending, startTransition] = useTransition()

  const next = () => {
    setUserId(nextUserId)
    setNonce((n) => n + 1)
  }

  return (
    <section className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={next}>
          Next user (plain update)
        </button>
        <button type="button" onClick={() => startTransition(next)}>
          Next user (startTransition)
        </button>
        <span className={styles.badge} data-active={isPending}>
          isPending = {String(isPending)}
        </span>
      </div>
      <UserCardSuspense>
        <SuspendingUserCard userId={userId} nonce={nonce} />
      </UserCardSuspense>
    </section>
  )
}

interface UserRequest {
  userId: number
  nonce: number
}

export function DeferredValueDemo() {
  const [request, setRequest] = useState<UserRequest>({ userId: 1, nonce: 0 })
  const deferred = useDeferredValue(request)
  const isStale = deferred !== request

  const next = () =>
    setRequest(({ userId, nonce }) => ({ userId: nextUserId(userId), nonce: nonce + 1 }))

  return (
    <section className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={next}>
          Next user
        </button>
        <span className={styles.badge} data-active={isStale}>
          requested #{request.userId}, showing #{deferred.userId}
        </span>
      </div>
      <div className={isStale ? styles.stale : undefined}>
        <UserCardSuspense>
          <SuspendingUserCard userId={deferred.userId} nonce={deferred.nonce} />
        </UserCardSuspense>
      </div>
    </section>
  )
}

export interface ReloadDemoProps {
  label?: SkeletonLabel
  lines?: number
  compact?: boolean
}

/** Suspends on mount; Reload starts a new request with a plain (non-transition) update. */
export function ReloadDemo({ label, lines, compact }: ReloadDemoProps) {
  const [nonce, setNonce] = useState(0)
  return (
    <section className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setNonce((n) => n + 1)}>
          Reload (plain update)
        </button>
      </div>
      <StatusInspector>
        <UserCardSuspense label={label} lines={lines} compact={compact}>
          <SuspendingUserCard userId={1} nonce={nonce} compact={compact} />
        </UserCardSuspense>
      </StatusInspector>
    </section>
  )
}
