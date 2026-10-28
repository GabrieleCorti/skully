import type { ComponentType, ReactNode } from 'react'

/** Prop names owned by skully. They are never forwarded to the bones component. */
export type ReservedProps = 'isLoading' | 'always' | 'label' | 'children'

/**
 * Visually hidden status text shown with the skeleton. `false` or `null` renders
 * no status element. `true` is excluded: it has no meaning as a label.
 */
export type SkeletonLabel = Exclude<ReactNode, true>

/** The bones component's props, minus the reserved ones. */
export type ForwardedProps<P> = Omit<P, ReservedProps>

/**
 * Reserved props a bones component must not declare: it would never receive them.
 * `children` is allowed, so bones can be built on `PropsWithChildren` primitives.
 */
type ClashingProps<P> = Extract<keyof P, Exclude<ReservedProps, 'children'>>

// Distributes over K, so two clashing props give two messages, not every mixed combination.
export type ReservedPropError<K extends PropertyKey> = K extends PropertyKey
  ? `skully: Bones declares the reserved prop "${K & string}". Rename it, e.g. renameProps(Bones, { ${K & string}: 'newName' }), rename it in Bones, or wrap Bones yourself.`
  : never

/** `unknown` for valid bones props; an error message type when a reserved prop is declared. */
export type CheckBones<P> = [ClashingProps<P>] extends [never]
  ? unknown
  : ReservedPropError<ClashingProps<P>>

// Intersections with a generic Omit can't be expressed as interfaces, hence `type`.
export type SkeletonProps<P> = ForwardedProps<P> & {
  /** Whether the data the children need is still loading. */
  isLoading: boolean
  /**
   * Show the skeleton whenever `isLoading` is true, not only before content
   * has been shown once. Defaults to `false`.
   */
  always?: boolean
  /** Visually hidden status text. `false` or `null` renders no status element. Defaults to `"Loading…"`. */
  label?: SkeletonLabel
  children?: ReactNode
}

export type SuspenseSkeletonProps<P> = ForwardedProps<P> & {
  /** Visually hidden status text. `false` or `null` renders no status element. Defaults to `"Loading…"`. */
  label?: SkeletonLabel
  children?: ReactNode
}

export interface CreateSkeletonResult<P> {
  Skeleton: ComponentType<SkeletonProps<P>>
  SuspenseSkeleton: ComponentType<SuspenseSkeletonProps<P>>
}
