import type { ComponentType } from 'react'
import { getDisplayName } from './utils/displayName'

/** Old prop name → new prop name. */
export type RenameMap<P> = { readonly [K in keyof P]?: string }

/** `P` with the keys in `M` renamed. Types and required/optional modifiers are kept. */
export type RenamedProps<P, M> = {
  [K in keyof P as K extends keyof M ? (M[K] extends string ? M[K] : K) : K]: P[K]
}

/**
 * Rejects new names that collide with an existing prop. The message lives in an object
 * brand, because intersecting two string literals would collapse to `never` and hide it.
 * Unknown old names are already rejected by `RenameMap<P>`.
 */
type CheckRenameTargets<P, M> = {
  [K in keyof M]: M[K] extends keyof P
    ? M[K] & {
        'skully error': `cannot rename "${K & string}" to "${M[K] & string}": the component already has a "${M[K] & string}" prop.`
      }
    : M[K]
}

/**
 * Wraps a component so some of its props are exposed under new names. Useful when
 * a bones component declares a prop that skully reserves:
 *
 * ```tsx
 * createSkeleton(renameProps(ButtonBones, { isLoading: 'busy' }))
 * // <ButtonSkeleton isLoading={isPending} busy /> → ButtonBones receives isLoading={true}
 * ```
 */
export function renameProps<P extends object, const M extends RenameMap<P>>(
  Component: ComponentType<P>,
  map: M & CheckRenameTargets<P, M>,
): ComponentType<RenamedProps<P, M>> {
  // New name → original name. A Map, so names like "constructor" can't hit the prototype.
  const originalNames = new Map<string, string>()
  for (const [from, to] of Object.entries(map)) originalNames.set(to as string, from)

  function Renamed(props: RenamedProps<P, M>) {
    const original: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      original[originalNames.get(key) ?? key] = value
    }
    // The keys were translated back, so this is the component's own props shape.
    return <Component {...(original as P)} />
  }
  Renamed.displayName = `Renamed(${getDisplayName(Component)})`

  return Renamed
}
