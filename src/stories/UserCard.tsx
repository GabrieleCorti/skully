import type { Ref } from 'react'
import { Circle, Line } from '../bones'
import styles from './UserCard.module.css'

export interface User {
  id: number
  name: string
  bio: string
}

export interface UserCardViewProps {
  user: User
  busy?: boolean
  compact?: boolean
}

export function UserCardView({ user, busy = false, compact = false }: UserCardViewProps) {
  const classes = [styles.card, compact && styles.compact, busy && styles.busy]
    .filter(Boolean)
    .join(' ')
  return (
    <article className={classes} aria-busy={busy}>
      <div className={styles.avatar}>{user.name[0]}</div>
      <div className={styles.body}>
        <h3 className={styles.name}>{user.name}</h3>
        <p className={styles.bio}>{user.bio}</p>
      </div>
    </article>
  )
}

export interface UserCardBonesProps {
  /** Number of bio lines to reserve. */
  lines?: number
  compact?: boolean
  ref?: Ref<HTMLDivElement>
}

export function UserCardBones({ lines = 2, compact = false, ref }: UserCardBonesProps) {
  return (
    <div
      ref={ref}
      className={[styles.card, styles.bones, compact && styles.compact].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <Circle className={styles.boneAvatar} />
      <div className={styles.body}>
        {/* Same typography classes as the real <h3> and <p>: N Lines = N lines of text. */}
        <Line className={`${styles.name} ${styles.boneName}`} />
        {Array.from({ length: lines }, (_, i) => (
          <Line key={i} className={`${styles.bio} ${styles.boneBio}`} />
        ))}
      </div>
    </div>
  )
}
