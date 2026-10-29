import type { Meta, StoryObj } from '@storybook/react-vite'
import { Line } from './Line'
import { Rect } from './Rect'
import styles from './bones.stories.module.css'

const meta = {
  title: 'Skully/Bones/Rect',
  component: Rect,
  parameters: {
    docs: {
      description: {
        component: `
A block placeholder for images, media and cards. By default it is 100% wide and 6em tall.
There are no size props: size it with your own \`className\` (the default styles live in
\`@layer skully\`, so your class always wins). It renders a \`<span aria-hidden="true">\` and
forwards every native \`span\` prop, including \`ref\`.

\`\`\`tsx
import { Rect } from '@gico/skully/bones'
import '@gico/skully/bones.css'
\`\`\`

The shimmer and the anti-flash fade-in are disabled under \`prefers-reduced-motion: reduce\`.
`,
      },
    },
  },
} satisfies Meta<typeof Rect>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className={styles.frame}>
      <Rect {...args} />
    </div>
  ),
}

export const Sizing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Reserve media space with `aspect-ratio` (set `height: auto` so it wins over the default height), or give it a fixed height.',
      },
    },
  },
  render: () => (
    <div className={styles.grid}>
      <div className={styles.cell}>
        <p className={styles.caption}>aspect-ratio: 16 / 9</p>
        <Rect className={styles.video} />
      </div>
      <div className={styles.cell}>
        <p className={styles.caption}>aspect-ratio: 1</p>
        <Rect className={styles.square} />
      </div>
      <div className={styles.cell}>
        <p className={styles.caption}>height: 3em</p>
        <Rect className={styles.banner} />
      </div>
    </div>
  ),
}

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A media card themed by its ancestor: the dark theme rounds every corner via `--sk-radius`, the brand theme squares them and slows the shimmer with `--sk-duration`.',
      },
    },
  },
  render: () => (
    <div className={styles.row}>
      <div className={`${styles.stack} ${styles.themeDark}`}>
        <Rect className={styles.video} />
        <Line className={styles.w60} />
      </div>
      <div className={`${styles.stack} ${styles.themeBrand}`}>
        <Rect className={styles.video} />
        <Line className={styles.w60} />
      </div>
    </div>
  ),
}
