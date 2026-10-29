import type { Ref } from 'react'
import styles from './ButtonBones.module.css'

export interface ButtonBonesProps {
  /**
   * Draws a spinner instead of the text bar. This is the bones' own `isLoading`, which
   * clashes with skully's reserved `isLoading`.
   */
  isLoading?: boolean
  ref?: Ref<HTMLDivElement>
}

/**
 * Button-shaped bones. Decorative only (`aria-hidden`): skully adds the status text.
 * Because it declares `isLoading`, it can't be passed to `createSkeleton` as is; see
 * `buttonSkeletons.ts`.
 */
export function ButtonBones({ isLoading = false, ref }: ButtonBonesProps) {
  return (
    <div ref={ref} className={[styles.frame, styles.bones].join(' ')} aria-hidden="true">
      <div className={isLoading ? styles.spinner : styles.bar} />
    </div>
  )
}

export interface SaveButtonProps {
  children: string
}

/** The real content the bones stand in for. Same box as the bones. */
export function SaveButton({ children }: SaveButtonProps) {
  return (
    <button type="button" className={[styles.frame, styles.button].join(' ')}>
      {children}
    </button>
  )
}
