import type { Meta, StoryObj } from '@storybook/react-vite'
import { Circle } from './Circle'
import styles from './bones.stories.module.css'

const meta = {
  title: 'Skully/Bones/Circle',
  component: Circle,
  parameters: {
    docs: {
      description: {
        component: `
A round placeholder for avatars and icons. By default it is 2.5em × 2.5em and never shrinks
in a flex row. There are no size props: size it with your own \`className\` (the default styles
live in \`@layer skully\`, so your class always wins). It is always round, whatever
\`--sk-radius\` says. It renders a \`<span aria-hidden="true">\` and forwards every native \`span\`
prop, including \`ref\`.

\`\`\`tsx
import { Circle } from 'skully/bones'
import 'skully/bones.css'
\`\`\`

The shimmer and the anti-flash fade-in are disabled under \`prefers-reduced-motion: reduce\`.
`,
      },
    },
  },
} satisfies Meta<typeof Circle>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizing: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Small, medium and large avatars, each sized with a plain width/height class.',
      },
    },
  },
  render: () => (
    <div className={styles.row}>
      <Circle className={styles.sm} />
      <Circle className={styles.md} />
      <Circle className={styles.lg} />
    </div>
  ),
}

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'By default the colours follow `currentColor`; here an ancestor sets fixed ones with `--sk-color` / `--sk-highlight`. `--sk-radius` does not affect `Circle`.',
      },
    },
  },
  render: () => (
    <div className={styles.row}>
      <div className={`${styles.row} ${styles.themeDark}`}>
        <Circle className={styles.sm} />
        <Circle className={styles.md} />
      </div>
      <div className={`${styles.row} ${styles.themeBrand}`}>
        <Circle className={styles.sm} />
        <Circle className={styles.md} />
      </div>
    </div>
  ),
}
