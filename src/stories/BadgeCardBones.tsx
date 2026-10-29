import type { Ref } from 'react'
import styles from './BadgeCardBones.module.css'

export interface BadgeCardBonesProps {
  /**
   * Text of the visible ribbon in the card's corner, e.g. "NEW". Not reserved by skully
   * (its hidden status text is `loadingLabel`), so it is forwarded like any other prop.
   */
  label: string
  /** Number of text lines to reserve. */
  lines?: number
  ref?: Ref<HTMLDivElement>
}

/**
 * Card bones with a visible ribbon showing `label`. Decorative only (`aria-hidden`):
 * skully adds the status text. See `badgeSkeletons.ts`.
 */
export function BadgeCardBones({ label, lines = 2, ref }: BadgeCardBonesProps) {
  return (
    <div ref={ref} className={[styles.frame, styles.bones].join(' ')} aria-hidden="true">
      <span className={styles.ribbon}>{label}</span>
      <div className={styles.header}>
        <div className={[styles.bone, styles.boneIcon].join(' ')} />
        <div className={[styles.bone, styles.boneTitle].join(' ')} />
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={[styles.bone, styles.boneLine].join(' ')} />
      ))}
    </div>
  )
}

export interface BadgeCardProps {
  title: string
  text: string
  /** Ribbon text, the same value the bones show. */
  badge: string
}

/** The real content the bones stand in for. Same box as the bones. */
export function BadgeCard({ title, text, badge }: BadgeCardProps) {
  return (
    <article className={[styles.frame, styles.card].join(' ')}>
      <span className={styles.ribbon}>{badge}</span>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          💀
        </span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <p className={styles.text}>{text}</p>
    </article>
  )
}
