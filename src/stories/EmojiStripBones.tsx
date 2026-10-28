import type { Ref } from 'react'
import styles from './EmojiStripBones.module.css'

export type EmojiBonesSize = 'sm' | 'md' | 'lg'
export type EmojiBonesSpeed = 'slow' | 'normal' | 'fast'

/** Skull theme with a few fun ones, fitting the library name. */
export const DEFAULT_EMOJI: string[] = ['💀', '✨', '🦴', '💖', '👻', '🌸']

/** Minimum emoji per copy of the sequence, so each track is always wider than its strip. */
const MIN_SEQUENCE_LENGTH = 24

/**
 * Parallel strips per box. Seven covers the rotated box at every size with room to spare
 * (the outer ones are clipped by the box), so the corners are never bare.
 */
const STRIP_COUNT = 7

/** One copy of a strip's sequence, with the emoji order rotated so neighbouring strips differ. */
function buildSequence(emoji: string[], offset: number): string[] {
  const source = emoji.length > 0 ? emoji : DEFAULT_EMOJI
  const shift = offset % source.length
  const rotated = [...source.slice(shift), ...source.slice(0, shift)]
  const repeats = Math.ceil(MIN_SEQUENCE_LENGTH / rotated.length)
  return Array.from({ length: repeats }, () => rotated).flat()
}

export interface EmojiStripBonesProps {
  /** Emoji scrolling along the diagonal strips. Repeated as needed to fill them. */
  emoji?: string[]
  /** Box size. Use the same size on the content so nothing shifts on reveal. */
  size?: EmojiBonesSize
  /** Marquee speed, as a multiplier of `--emoji-bones-duration`. Defaults to `'slow'`. */
  speed?: EmojiBonesSpeed
  ref?: Ref<HTMLDivElement>
}

/**
 * A fully custom bones component: a pink rounded box crossed by parallel diagonal strips
 * of scrolling emoji, alternating direction, with a gap between strips. Decorative only (`aria-hidden`); skully adds the status text.
 */
export function EmojiStripBones({
  emoji = DEFAULT_EMOJI,
  size = 'md',
  speed = 'slow',
  ref,
}: EmojiStripBonesProps) {
  return (
    <div
      ref={ref}
      className={[styles.bones, styles[size], styles[speed]].join(' ')}
      aria-hidden="true"
    >
      {/* One rotated container; the strips inside are plain horizontal bands. */}
      <div className={styles.bands}>
        {Array.from({ length: STRIP_COUNT }, (_, strip) => {
          const sequence = buildSequence(emoji, strip)
          return (
            <div key={strip} className={styles.strip}>
              <div className={styles.track}>
                {/* Two identical copies: translating by -50% loops seamlessly. */}
                {[0, 1].map((copy) => (
                  <div key={copy} className={styles.sequence}>
                    {sequence.map((item, i) => (
                      <span key={i} className={styles.emoji}>
                        {item}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface PinkCardProps {
  title: string
  text: string
  /** Short text or emoji shown in the round badge. */
  badge?: string
  size?: EmojiBonesSize
}

/** The real content the emoji bones stand in for. Same box as the bones for each size. */
export function PinkCard({ title, text, badge = '💀', size = 'md' }: PinkCardProps) {
  return (
    <article className={[styles.card, styles[size]].join(' ')}>
      <div className={styles.header}>
        <span className={styles.badge} aria-hidden="true">
          {badge}
        </span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <p className={styles.text}>{text}</p>
    </article>
  )
}
