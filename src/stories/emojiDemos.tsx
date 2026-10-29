import { use, useEffect, useState } from 'react'
import type { SkeletonLabel } from '../index'
import { StatusInspector } from './demos'
import { EmojiSkeleton, EmojiSuspense } from './emojiSkeletons'
import {
  PinkCard,
  type EmojiBonesSize,
  type EmojiBonesSpeed,
  type EmojiStripBonesProps,
} from './EmojiStripBones'
import { fetchUser } from './fakeApi'
import styles from './stories.module.css'
import emojiStyles from './emojiDemos.module.css'

/** Long enough to enjoy the strip. */
export const EMOJI_DELAY = 2400

export const SKULLY_CARD = {
  title: 'Skully says hi',
  text: 'Your content is here. The emoji strip had exactly the same size, so nothing moved when it was swapped in.',
}

// ---------------------------------------------------------------------------
// Loading -> content with a fake delay
// ---------------------------------------------------------------------------

export interface EmojiBonesDemoProps {
  emoji?: string[]
  size?: EmojiBonesSize
  speed?: EmojiBonesSpeed
  loadingLabel?: SkeletonLabel
}

function TimedPinkCard({ emoji, size, speed, loadingLabel }: EmojiBonesDemoProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), EMOJI_DELAY)
    return () => clearTimeout(timer)
  }, [])

  return (
    <EmojiSkeleton
      isLoading={isLoading}
      loadingLabel={loadingLabel}
      emoji={emoji}
      size={size}
      speed={speed}
    >
      <PinkCard {...SKULLY_CARD} size={size} />
    </EmojiSkeleton>
  )
}

/** Mounts a skeleton that finishes "loading" after a fake delay; Remount starts over. */
export function EmojiLoadDemo(props: EmojiBonesDemoProps) {
  const [instance, setInstance] = useState(0)
  return (
    <section className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setInstance((n) => n + 1)}>
          Remount
        </button>
        <span className={styles.badge}>fake delay {EMOJI_DELAY / 1000}s</span>
      </div>
      <StatusInspector key={instance}>
        <TimedPinkCard {...props} />
      </StatusInspector>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SuspenseSkeleton with the emoji bones
// ---------------------------------------------------------------------------

interface SuspendingPinkCardProps {
  nonce: number
  size?: EmojiBonesSize
}

/** Reads its data with `use()`, so it suspends until the fake request resolves. */
function SuspendingPinkCard({ nonce, size }: SuspendingPinkCardProps) {
  const user = use(fetchUser(1, nonce))
  return <PinkCard title={user.name} text={user.bio} badge={user.name[0]} size={size} />
}

/** Offset so these requests never share a cached promise with the other stories. */
const NONCE_OFFSET = 10_000

export function EmojiSuspenseDemo({ emoji, size, speed, loadingLabel }: EmojiBonesDemoProps) {
  const [nonce, setNonce] = useState(NONCE_OFFSET)
  return (
    <section className={styles.column}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setNonce((n) => n + 1)}>
          Reload (plain update)
        </button>
      </div>
      <StatusInspector>
        <EmojiSuspense loadingLabel={loadingLabel} emoji={emoji} size={size} speed={speed}>
          <SuspendingPinkCard nonce={nonce} size={size} />
        </EmojiSuspense>
      </StatusInspector>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Variations: different forwarded props, same skeleton component
// ---------------------------------------------------------------------------

interface EmojiVariation {
  title: string
  code: string
  props: EmojiStripBonesProps
}

const VARIATIONS: EmojiVariation[] = [
  {
    title: 'Defaults',
    code: '<EmojiSkeleton isLoading />',
    props: {},
  },
  {
    title: 'Small and fast',
    code: `<EmojiSkeleton isLoading size="sm" speed="fast" emoji={['🦴', '🐶', '🍖']} />`,
    props: { size: 'sm', speed: 'fast', emoji: ['🦴', '🐶', '🍖'] },
  },
  {
    title: 'Large and normal speed',
    code: `<EmojiSkeleton isLoading size="lg" speed="normal" emoji={['🌸', '💗', '🎀', '🍓', '🦩']} />`,
    props: { size: 'lg', speed: 'normal', emoji: ['🌸', '💗', '🎀', '🍓', '🦩'] },
  },
]

export function EmojiVariationsDemo() {
  return (
    <div className={styles.grid}>
      {VARIATIONS.map(({ title, code, props }) => (
        <section key={title} className={emojiStyles.variation}>
          <h3 className={styles.title}>{title}</h3>
          <EmojiSkeleton isLoading {...props} />
          <p className={emojiStyles.code}>{code}</p>
        </section>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Theming through CSS custom properties
// ---------------------------------------------------------------------------

interface EmojiTheme {
  title: string
  className?: string
  emoji?: string[]
}

const THEMES: EmojiTheme[] = [
  { title: 'Default pink' },
  { title: 'Mint', className: emojiStyles.mintTheme, emoji: ['🍀', '🌿', '🐢', '💚'] },
  { title: 'Midnight', className: emojiStyles.midnightTheme, emoji: ['💀', '🌙', '⭐', '🦇'] },
]

export function EmojiThemesDemo() {
  return (
    <div className={styles.grid}>
      {THEMES.map(({ title, className, emoji }) => (
        <section
          key={title}
          className={[emojiStyles.variation, className].filter(Boolean).join(' ')}
        >
          <h3 className={styles.title}>{title}</h3>
          <EmojiSkeleton isLoading emoji={emoji} />
        </section>
      ))}
    </div>
  )
}
