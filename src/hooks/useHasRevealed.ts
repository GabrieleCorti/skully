import { useState } from 'react'

/**
 * Whether content has been revealed (`isLoading === false`) at least once in
 * this component's lifetime. Starts as `!isLoading`; never goes back to false.
 */
export function useHasRevealed(isLoading: boolean): boolean {
  const [hasRevealed, setHasRevealed] = useState(!isLoading)
  // React's "adjust state during render" pattern: React discards this render and
  // re-renders immediately, before commit, so no effect and no extra paint.
  if (!isLoading && !hasRevealed) setHasRevealed(true)
  return hasRevealed
}
