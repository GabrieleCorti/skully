import type { Meta, StoryObj } from '@storybook/react-vite'
import { BadgeCard } from './BadgeCardBones'
import { BadgeCardSkeleton } from './badgeSkeletons'
import { StatusInspector } from './demos'
import styles from './stories.module.css'

const meta = {
  title: 'Skully/Forwarding props',
  component: BadgeCardSkeleton,
  parameters: {
    controls: { include: ['isLoading', 'loadingLabel', 'label'] },
    docs: {
      description: {
        component: `
Only \`isLoading\`, \`always\`, \`loadingLabel\` and \`children\` belong to skully. Every other
prop, including one called \`label\`, goes straight to the bones:

\`\`\`tsx
// BadgeCardBones has its own \`label\`: the ribbon text
createSkeleton(BadgeCardBones)

<BadgeCardSkeleton isLoading label="NEW" loadingLabel="Loading card" />
\`\`\`

"NEW" is drawn in the bones' ribbon, while "Loading card" is skully's hidden status text.

Bones that declare one of skully's reserved props need a rename instead; see
[Skully / Renaming props](?path=/docs/skully-renaming-props--docs).
`,
      },
    },
  },
  args: {
    isLoading: true,
    loadingLabel: 'Loading card',
    label: 'NEW',
  },
  argTypes: {
    isLoading: {
      description: 'Whether the data the children need is still loading.',
      control: 'boolean',
      table: { category: 'skully', type: { summary: 'boolean' } },
    },
    loadingLabel: {
      description: 'skully\'s visually hidden `role="status"` text. Never forwarded to the bones.',
      control: 'text',
      table: { category: 'skully', type: { summary: 'SkeletonLabel' } },
    },
    label: {
      description: "The bones' own prop: forwarded to `BadgeCardBones` (the visible ribbon text).",
      control: 'text',
      table: { category: 'Bones props (forwarded)', type: { summary: 'string' } },
    },
  },
  render: (args) => (
    <StatusInspector>
      <BadgeCardSkeleton {...args}>
        <BadgeCard
          title="Forwarded props"
          text="The real content, with its own ribbon drawn from the same label value."
          badge={args.label}
        />
      </BadgeCardSkeleton>
    </StatusInspector>
  ),
} satisfies Meta<typeof BadgeCardSkeleton>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Try:** change \`label\` and watch the ribbon; change \`loadingLabel\` and watch the dashed box
(what screen readers hear). Turn \`isLoading\` off to see the real card in the same space.
`,
      },
    },
  },
}

export const LabelVsLoadingLabel: Story = {
  name: 'label vs loadingLabel',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The same skeleton twice: `label` reaches the bones and is visible, `loadingLabel` stays with skully and is only announced.',
      },
    },
  },
  render: () => (
    <div className={styles.grid}>
      <StatusInspector>
        <BadgeCardSkeleton isLoading label="NEW" loadingLabel="Loading card" />
      </StatusInspector>
      <StatusInspector>
        <BadgeCardSkeleton isLoading label="SALE" loadingLabel="Loading offer" />
      </StatusInspector>
    </div>
  ),
}
