import { Suspense, type ComponentType } from 'react'
import { useHasRevealed } from './hooks/useHasRevealed'
import { LoadingStatus } from './LoadingStatus'
import { getDisplayName } from './utils/displayName'
import type {
  CheckBones,
  CreateSkeletonResult,
  ReservedProps,
  SkeletonLabel,
  SkeletonProps,
  SuspenseSkeletonProps,
} from './types'

const RESERVED: ReadonlySet<string> = new Set<ReservedProps>([
  'isLoading',
  'always',
  'loadingLabel',
  'children',
])

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
  loadingLabel: SkeletonLabel,
) {
  return (
    <>
      <Bones {...forwardedProps<P>(props)} />
      {loadingLabel !== false && loadingLabel !== null && (
        <LoadingStatus>{loadingLabel}</LoadingStatus>
      )}
    </>
  )
}

/**
 * Defines a skeleton UI once and returns its two behaviors. Call it in a
 * `"use client"` module and export the results as separate named constants.
 *
 * Bones must not declare `isLoading`, `always` or `loadingLabel`: that is a compile error,
 * because Bones would never receive them. See `renameProps` for one way to fix it.
 */
export function createSkeleton<P extends object>(
  Bones: ComponentType<P> & CheckBones<P>,
): CreateSkeletonResult<P> {
  const bonesName = getDisplayName(Bones)

  function Skeleton(props: SkeletonProps<P>) {
    const { isLoading, always = false, loadingLabel, children } = props
    const hasRevealed = useHasRevealed(isLoading)
    const showSkeleton = isLoading && (always || !hasRevealed)
    if (!showSkeleton) return children ?? null

    return renderBones(Bones, props, loadingLabel)
  }
  Skeleton.displayName = `Skeleton(${bonesName})`

  function SuspenseSkeleton(props: SuspenseSkeletonProps<P>) {
    const { loadingLabel, children } = props
    return <Suspense fallback={renderBones(Bones, props, loadingLabel)}>{children}</Suspense>
  }
  SuspenseSkeleton.displayName = `SuspenseSkeleton(${bonesName})`

  return { Skeleton, SuspenseSkeleton }
}
