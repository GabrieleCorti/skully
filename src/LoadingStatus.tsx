import type { CSSProperties, ReactNode } from 'react'

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

export interface LoadingStatusProps {
  /** Visually hidden status text. Defaults to `"Loading…"`. */
  children?: ReactNode
}

/**
 * The visually hidden `role="status"` element skully renders next to the bones.
 * Use it for bones rendered outside `Skeleton`, e.g. in a Next.js `loading.tsx`.
 */
export function LoadingStatus({ children = 'Loading…' }: LoadingStatusProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- the spec requires hiding without a CSS file
    <span role="status" style={visuallyHidden}>
      {children}
    </span>
  )
}
