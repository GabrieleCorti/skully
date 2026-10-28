import { Suspense, type ComponentType, type CSSProperties } from 'react'
import { useHasRevealed } from './hooks/useHasRevealed'
import { getDisplayName } from './utils/displayName'
import type {
  CheckBones,
  CreateSkeletonResult,
  ReservedProps,
  SkeletonLabel,
  SkeletonProps,
  SuspenseSkeletonProps,
} from './types'

const DEFAULT_LABEL = 'Loading…'

const RESERVED: ReadonlySet<string> = new Set<ReservedProps>([
  'isLoading',
  'always',
  'label',
  'children',
])

// Inline on purpose: the status element must be hidden without shipping a CSS file.
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/**
 * Strips reserved props at runtime too, so they never reach `Bones` even when
 * passed from untyped code (e.g. `isLoading` on a `SuspenseSkeleton`).
 */
function forwardedProps<P>(props: object): P {
  const forwarded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!RESERVED.has(key)) forwarded[key] = value
  }
  // Reserved props win over same-named props declared by `Bones`, so the
  // forwarded object is intentionally narrower than P.
  return forwarded as P
}

function renderBones<P extends object>(
  Bones: ComponentType<P>,
  props: object,
  label: SkeletonLabel,
) {
  return (
    <>
      <Bones {...forwardedProps<P>(props)} />
      {label !== false && label !== null && (
        // eslint-disable-next-line no-restricted-syntax -- the spec requires hiding without a CSS file
        <span role="status" style={visuallyHidden}>
          {label}
        </span>
      )}
    </>
  )
}

/**
 * Defines a skeleton UI once and returns its two behaviors. Call it in a
 * `"use client"` module and export the results as separate named constants.
 *
 * Bones must not declare `isLoading`, `always` or `label`: that is a compile error,
 * because Bones would never receive them. See `renameProps` for one way to fix it.
 */
export function createSkeleton<P extends object>(
  Bones: ComponentType<P> & CheckBones<P>,
): CreateSkeletonResult<P> {
  const bonesName = getDisplayName(Bones)

  function Skeleton(props: SkeletonProps<P>) {
    const { isLoading, always = false, label = DEFAULT_LABEL, children } = props
    const hasRevealed = useHasRevealed(isLoading)
    const showSkeleton = isLoading && (always || !hasRevealed)
    if (!showSkeleton) return children ?? null

    return renderBones(Bones, props, label)
  }
  Skeleton.displayName = `Skeleton(${bonesName})`

  function SuspenseSkeleton(props: SuspenseSkeletonProps<P>) {
    const { label = DEFAULT_LABEL, children } = props
    return <Suspense fallback={renderBones(Bones, props, label)}>{children}</Suspense>
  }
  SuspenseSkeleton.displayName = `SuspenseSkeleton(${bonesName})`

  return { Skeleton, SuspenseSkeleton }
}
