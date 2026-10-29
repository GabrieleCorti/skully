import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusInspector } from './demos'
import {
  EmojiLoadDemo,
  EmojiSuspenseDemo,
  EmojiThemesDemo,
  EmojiVariationsDemo,
  SKULLY_CARD,
} from './emojiDemos'
import { EmojiSkeleton } from './emojiSkeletons'
import { DEFAULT_EMOJI, PinkCard } from './EmojiStripBones'

const meta = {
  title: 'Skully/Custom bones',
  component: EmojiSkeleton,
  parameters: {
    docs: {
      description: {
        component: `
skully is headless: it ships no skeleton UI. Any component can be the bones, and
\`createSkeleton\` types and forwards its props for you. This page uses a deliberately
un-skeleton-like one: a pink box crossed by parallel diagonal strips of scrolling emoji. Neighbouring
strips scroll in opposite directions, with a gap between them that shows the pink box.

\`\`\`tsx
interface EmojiStripBonesProps {
  emoji?: string[]
  size?: 'sm' | 'md' | 'lg'
  speed?: 'slow' | 'normal' | 'fast'
  ref?: Ref<HTMLDivElement>
}

function EmojiStripBones({ emoji, size, speed, ref }: EmojiStripBonesProps) {
  return <div ref={ref} aria-hidden="true">{/* pink box + alternating diagonal marquees */}</div>
}
\`\`\`

\`\`\`tsx
'use client'
export const { Skeleton: EmojiSkeleton, SuspenseSkeleton: EmojiSuspense } =
  createSkeleton(EmojiStripBones)

<EmojiSkeleton isLoading={isLoading} size="lg" speed="fast" emoji={['💀', '🦴']}>
  <PinkCard size="lg" … />
</EmojiSkeleton>
\`\`\`

- \`emoji\`, \`size\`, \`speed\` and \`ref\` are typed from \`EmojiStripBonesProps\` and forwarded
  untouched; a typo or a wrong value is a type error. The reserved props \`isLoading\`, \`always\`,
  \`loadingLabel\` and \`children\` are skully's and never reach the bones.
- The bones are decorative (\`aria-hidden\`); skully adds the visually hidden
  \`role="status"\` label next to them.
- Bones and content share the same size classes, so nothing shifts when the content appears.
- Colours, speed and spacing are themable with CSS custom properties: \`--emoji-bones-bg\`,
  \`--emoji-bones-strip\`, \`--emoji-bones-duration\` and \`--emoji-bones-gap\` (space between
  strips; defaults to 10px / 12px / 14px for \`sm\` / \`md\` / \`lg\`).
- Each strip loops without a visible jump (two copies of its sequence, translated by -50%). Even strips run
  the same animation in reverse, and each strip starts at a different offset with a different
  emoji order, so neighbours never look identical.
`,
      },
    },
  },
  args: {
    isLoading: true,
    always: false,
    loadingLabel: 'Loading…',
    emoji: DEFAULT_EMOJI,
    size: 'md',
    speed: 'slow',
  },
  argTypes: {
    isLoading: {
      description:
        'Whether the data the children need is still loading. In the default mode it only matters until content has been shown once.',
      control: 'boolean',
      table: { category: 'skully', type: { summary: 'boolean' } },
      type: { name: 'boolean', required: true },
    },
    always: {
      description:
        'Show the skeleton every time `isLoading` is true, not only before the first content.',
      control: 'boolean',
      table: {
        category: 'skully',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loadingLabel: {
      description:
        'Visually hidden text of the `role="status"` element rendered next to the bones. `false` or `null` renders no status element.',
      control: 'text',
      table: {
        category: 'skully',
        type: { summary: 'SkeletonLabel', detail: 'ReactNode (except true)' },
        defaultValue: { summary: '"Loading…"' },
      },
    },
    children: {
      description: 'The real content, shown instead of the bones once loaded.',
      control: false,
      table: { category: 'skully', type: { summary: 'ReactNode' } },
    },
    emoji: {
      description:
        'Bones prop (from `EmojiStripBones`): emoji scrolling along the strips, repeated as needed to fill them. Each strip rotates the order so neighbours differ.',
      control: 'object',
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: 'string[]' },
        defaultValue: { summary: JSON.stringify(DEFAULT_EMOJI) },
      },
    },
    size: {
      description:
        'Bones prop: box size. The examples pass the same size to the content so nothing shifts on reveal.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    speed: {
      description: 'Bones prop: marquee speed, as a multiplier of `--emoji-bones-duration`.',
      control: 'inline-radio',
      options: ['slow', 'normal', 'fast'],
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: "'slow' | 'normal' | 'fast'" },
        defaultValue: { summary: "'slow'" },
      },
    },
    ref: {
      description: 'Bones prop: forwarded to the pink box while the skeleton is shown.',
      control: false,
      table: { category: 'Bones props (forwarded)', type: { summary: 'Ref<HTMLDivElement>' } },
    },
  },
  render: ({ size, ...args }) => (
    <StatusInspector>
      <EmojiSkeleton {...args} size={size}>
        <PinkCard {...SKULLY_CARD} size={size} />
      </EmojiSkeleton>
    </StatusInspector>
  ),
} satisfies Meta<typeof EmojiSkeleton>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Every prop is wired to the controls: skully's (\`isLoading\`, \`always\`, \`loadingLabel\`) and the bones'
(\`emoji\`, \`size\`, \`speed\`).

**Try:** edit the \`emoji\` array, switch \`size\` and \`speed\`. The strips update live because
the props are forwarded to \`EmojiStripBones\`. Then turn \`isLoading\` off: the pink card takes
exactly the same space.
`,
      },
    },
  },
}

export const LoadingToContent: Story = {
  name: 'Loading → content',
  parameters: {
    controls: { include: ['loadingLabel', 'emoji', 'size', 'speed'] },
    docs: {
      description: {
        story: `
A component that finishes "loading" after a fake 2.4s delay. The emoji strips show in the
meantime, then the real card takes their place.

**Try:** press *Remount* to watch it again, or change \`size\` and remount. Bones and card stay the
same size, so the layout doesn't shift.
`,
      },
    },
  },
  render: ({ loadingLabel, emoji, size, speed }) => (
    <EmojiLoadDemo loadingLabel={loadingLabel} emoji={emoji} size={size} speed={speed} />
  ),
}

export const WithSuspense: Story = {
  name: 'SuspenseSkeleton',
  parameters: {
    controls: { include: ['loadingLabel', 'emoji', 'size', 'speed'] },
    docs: {
      description: {
        story: `
The same bones as a Suspense fallback: \`EmojiSuspense\` came out of the same
\`createSkeleton(EmojiStripBones)\` call. The card reads a user with \`use()\` and suspends for
1.2s; the bones props are forwarded to the fallback.

**Try:** press *Reload*. It starts a new request with a plain state update, so React shows the
emoji fallback again.
`,
      },
    },
  },
  render: ({ loadingLabel, emoji, size, speed }) => (
    <EmojiSuspenseDemo loadingLabel={loadingLabel} emoji={emoji} size={size} speed={speed} />
  ),
}

export const EmojiVariations: Story = {
  name: 'Emoji variations',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
One skeleton component, three sets of forwarded props. Each box is \`EmojiSkeleton\` with
\`isLoading\` and different \`emoji\`, \`size\` and \`speed\`, with no wrapper or extra config.
`,
      },
    },
  },
  render: () => <EmojiVariationsDemo />,
}

export const Theming: Story = {
  name: 'Theming with CSS variables',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
The bones read \`--emoji-bones-bg\`, \`--emoji-bones-strip\`, \`--emoji-bones-duration\` and
\`--emoji-bones-gap\`, so any ancestor can restyle them from CSS. \`speed\` still applies on top: it
multiplies the duration. The background colour shows through the gaps between strips.

\`\`\`css
.mintTheme {
  --emoji-bones-bg: #c9f5e2;
  --emoji-bones-strip: #17b085;
  --emoji-bones-duration: 7s;
  --emoji-bones-gap: 18px; /* roomier strips */
}
\`\`\`
`,
      },
    },
  },
  render: () => <EmojiThemesDemo />,
}

export const ReducedMotion: Story = {
  name: 'Reduced motion',
  args: { isLoading: true },
  parameters: {
    controls: { include: ['emoji', 'size'] },
    docs: {
      description: {
        story: `
Under \`prefers-reduced-motion: reduce\` the strips stop scrolling and the fade-in is skipped: the
pink box and the diagonal strips stay, as a still image. Nothing else changes, and the status
label is still announced.

> If the strips don't move in any story, your OS is probably asking for reduced motion. On
> Windows, turning off *Settings → Accessibility → Visual effects → Animation effects* makes
> browsers report \`prefers-reduced-motion: reduce\`, so the strips stand still. Turn it back on to
> see the motion. The same applies to *Reduce motion* on macOS (*System Settings →
> Accessibility → Display*).

**Try:** turn reduced motion on in your OS accessibility settings (or emulate
\`prefers-reduced-motion\` in your browser's dev tools, under *Rendering*) and look at this story.
`,
      },
    },
  },
}
