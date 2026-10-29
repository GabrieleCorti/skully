import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Circle } from './Circle'
import { Line } from './Line'
import { Rect } from './Rect'
import styles from './bones.stories.module.css'

const meta = {
  title: 'Skully/Bones/Line',
  component: Line,
  parameters: {
    docs: {
      description: {
        component: `
A text-line placeholder for building bones. A \`Line\` is one line box of its own typography:
a transparent \`span\` that is 100% wide and \`1lh\` tall, with a centred bar (\`1em\` thick by
default) drawn inside it. N \`Line\`s are as tall as the N lines of text they replace, so you don't
have to tune margins. It renders a \`<span aria-hidden="true">\` and forwards every native \`span\` prop,
including \`ref\`.

\`\`\`tsx
import { Line } from '@gico/skully/bones'
import '@gico/skully/bones.css'
\`\`\`

There are no size props; the default styles live in \`@layer skully\`, so your class always wins:

- To match the line box, give the \`Line\` the same \`font-size\` and \`line-height\` as the text it
  replaces, for example by reusing that text's class.
- Set \`width\` in your \`className\` (default \`100%\`).
- Set the bar thickness with \`--sk-line-thickness\` (default \`1em\`, never taller than the line
  box). A \`height\` in your class changes the line box, not the bar.

The bar colour derives from \`currentColor\`, so it follows the text colour on light and dark
backgrounds. The shimmer and the anti-flash fade-in are disabled under
\`prefers-reduced-motion: reduce\`.
`,
      },
    },
  },
} satisfies Meta<typeof Line>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className={styles.frame}>
      <Line {...args} />
    </div>
  ),
}

export const Sizing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Width comes from your class; the height is one line box of the typography the `Line` has, so a heading class (here 24px / 1.3, 50% wide) makes a taller line, and so does a larger `font-size` on an ancestor. The bar is sized separately with `--sk-line-thickness`: `0.5em` gives a thin bar, `100%` fills the whole line box.',
      },
    },
  },
  render: () => (
    <div className={styles.stack}>
      <Line className={styles.title} />
      <Line className={styles.w90} />
      <Line className={styles.w60} />
      <Line className={styles.w40} />
      <p className={styles.caption}>Inside font-size: 24px</p>
      <div className={styles.large}>
        <Line className={styles.w60} />
      </div>
      <p className={styles.caption}>--sk-line-thickness: 0.5em</p>
      <Line className={`${styles.w90} ${styles.thin}`} />
      <p className={styles.caption}>--sk-line-thickness: 100% (fills the line box)</p>
      <Line className={`${styles.w90} ${styles.full}`} />
    </div>
  ),
}

const LINE_COUNT = 3
const sampleText = ['The quick brown fox', 'jumps over the lazy dog', 'and keeps on running']

interface TypographyCase {
  id: string
  label: string
  className: string
  /** Render both blocks as a `<p>` (Lines are block spans, so they are valid inside it). */
  paragraph?: boolean
}

const typographyCases: TypographyCase[] = [
  { id: 't14', label: '14px / 20px', className: styles.t14 },
  { id: 't16', label: '16px / normal', className: styles.t16 },
  { id: 't24', label: '24px / 1.4', className: styles.t24 },
  { id: 'para', label: '<p> at 18px / 1.6', className: styles.para, paragraph: true },
]

function TypographyPair({ id, label, className, paragraph = false }: TypographyCase) {
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => <Line key={i} />)
  return (
    <section aria-label={label}>
      <p className={styles.caption}>{label}</p>
      <div className={styles.pair}>
        <div className={styles.sample}>
          <p className={styles.caption}>{LINE_COUNT} Lines</p>
          {paragraph ? (
            <p data-testid={`lines-${id}`} className={`${className} ${styles.measured}`}>
              {lines}
            </p>
          ) : (
            <div data-testid={`lines-${id}`} className={`${className} ${styles.measured}`}>
              {lines}
            </div>
          )}
        </div>
        <div className={styles.sample}>
          <p className={styles.caption}>{LINE_COUNT} lines of text</p>
          {paragraph ? (
            <p
              data-testid={`text-${id}`}
              className={`${className} ${styles.textLine} ${styles.measured}`}
            >
              {sampleText.map((text, i) => (
                <span key={text}>
                  {i > 0 && <br />}
                  {text}
                </span>
              ))}
            </p>
          ) : (
            <div data-testid={`text-${id}`} className={`${className} ${styles.measured}`}>
              {sampleText.map((text) => (
                <span key={text} className={styles.textLine}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export const LineHeightMatchesText: Story = {
  name: 'Line height matches text',
  parameters: {
    docs: {
      description: {
        story: `
This story checks that a \`Line\` is exactly one line of text tall. For each typography, the left
block holds ${LINE_COUNT} \`Line\`s and the right block ${LINE_COUNT} lines of real text, both with
the same typography class (the last pair is a \`<p>\` whose text lines are separated by \`<br>\`). The
dashed outlines show the two blocks end at the same height.

The \`play\` function measures both blocks with \`getBoundingClientRect()\` and expects equal heights
(±0.5px). It needs real layout, so it runs in the browser: open the story and check the
*Interactions* panel (jsdom-based unit tests cannot measure this).
`,
      },
    },
  },
  render: () => (
    <div className={styles.compare}>
      {typographyCases.map((typography) => (
        <TypographyPair key={typography.id} {...typography} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    // Measure with the final fonts, not a fallback.
    await document.fonts.ready
    for (const { id, label } of typographyCases) {
      await step(
        `${label}: ${LINE_COUNT} Lines are as tall as ${LINE_COUNT} text lines`,
        async () => {
          const linesHeight = canvas.getByTestId(`lines-${id}`).getBoundingClientRect().height
          const textHeight = canvas.getByTestId(`text-${id}`).getBoundingClientRect().height
          await expect(linesHeight).toBeGreaterThan(0)
          await expect(Math.abs(linesHeight - textHeight)).toBeLessThanOrEqual(0.5)
        },
      )
    }
  },
}

export const LightAndDarkBackgrounds: Story = {
  name: 'Light and dark backgrounds',
  parameters: {
    docs: {
      description: {
        story:
          'The three primitives with their default colours (no `--sk-color` / `--sk-highlight` overrides). The defaults are mixed from `currentColor` (12% and 5%), so the same bones read as light grey on a light surface with dark text and as a soft glow on a dark surface with light text.',
      },
    },
  },
  render: () => (
    <div className={styles.row}>
      <div className={styles.surfaceLight}>
        <p className={styles.surfaceLabel}>Light background, dark text</p>
        <div className={styles.surfaceRow}>
          <Circle />
          <div className={styles.surfaceText}>
            <Line className={styles.w60} />
            <Line />
          </div>
        </div>
        <Rect />
      </div>
      <div className={styles.surfaceDark}>
        <p className={styles.surfaceLabel}>Dark background, light text</p>
        <div className={styles.surfaceRow}>
          <Circle />
          <div className={styles.surfaceText}>
            <Line className={styles.w60} />
            <Line />
          </div>
        </div>
        <Rect />
      </div>
    </div>
  ),
}

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'By default the colours follow `currentColor` (see _Light and dark backgrounds_). To use fixed colours instead, an ancestor class sets `--sk-color`, `--sk-highlight`, `--sk-radius` (and optionally `--sk-duration`, `--sk-delay`, `--sk-line-thickness`). Every bone below it picks them up.',
      },
    },
  },
  render: () => (
    <div className={styles.row}>
      <div className={`${styles.stack} ${styles.themeDark}`}>
        <Circle />
        <Line className={styles.w90} />
        <Line className={styles.w60} />
      </div>
      <div className={`${styles.stack} ${styles.themeBrand}`}>
        <Circle />
        <Line className={styles.w90} />
        <Line className={styles.w60} />
      </div>
    </div>
  ),
}
