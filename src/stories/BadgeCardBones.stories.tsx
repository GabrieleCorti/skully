import type { Meta, StoryObj } from '@storybook/react-vite'
import { BadgeCard } from './BadgeCardBones'
import { BadgeCardSkeleton } from './badgeSkeletons'
import { StatusInspector } from './demos'
import styles from './stories.module.css'

const meta = {
  title: 'Skully/Renaming props',
  component: BadgeCardSkeleton,
  parameters: {
    controls: { include: ['isLoading', 'label', 'badge'] },
    docs: {
      description: {
        component: `
\`isLoading\`, \`always\` and \`label\` belong to skully and are never forwarded to the bones, so
bones that declare one of them would silently never receive it. \`createSkeleton\` turns that
silent bug into a compile-time error (\`children\` is allowed):

\`\`\`tsx
createSkeleton(BadgeCardBones) // BadgeCardBones has its own \`label\`: the ribbon text
// skully: Bones declares the reserved prop "label". Rename it, e.g.
// renameProps(Bones, { label: 'newName' }), rename it in Bones, or wrap Bones yourself.
\`\`\`

Any of these fixes works, and none is preferred:

\`\`\`tsx
// 1. renameProps (used on this page; shows up as Renamed(BadgeCardBones) in DevTools)
createSkeleton(renameProps(BadgeCardBones, { label: 'badge' }))

// 2. Rename the prop in your bones
interface BadgeCardBonesProps { badge: string }

// 3. Wrap the bones yourself
function BadgeCardBonesAdapter({ badge, ...rest }: Omit<BadgeCardBonesProps, 'label'> & { badge: string }) {
  return <BadgeCardBones label={badge} {...rest} />
}
\`\`\`

With fix 1, \`<BadgeCardSkeleton badge="NEW" label="Loading card" />\` draws "NEW" in the bones'
ribbon, while "Loading card" is skully's hidden status text.
`,
      },
    },
  },
  args: {
    isLoading: true,
    label: 'Loading card',
    badge: 'NEW',
  },
  argTypes: {
    isLoading: {
      description: 'Whether the data the children need is still loading.',
      control: 'boolean',
      table: { category: 'skully', type: { summary: 'boolean' } },
    },
    label: {
      description:
        'skully\'s visually hidden `role="status"` text. This is not the bones\' `label`, which is exposed as `badge`.',
      control: 'text',
      table: { category: 'skully', type: { summary: 'SkeletonLabel' } },
    },
    badge: {
      description:
        'Renamed bones prop: forwarded to `BadgeCardBones` as its own `label` (the visible ribbon text).',
      control: 'text',
      table: { category: 'Bones props (forwarded)', type: { summary: 'string' } },
    },
  },
  render: (args) => (
    <StatusInspector>
      <BadgeCardSkeleton {...args}>
        <BadgeCard
          title="Renamed props"
          text="The real content, with its own ribbon drawn from the same badge value."
          badge={args.badge}
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
**Try:** change \`badge\` and watch the ribbon; change \`label\` and watch the dashed box (what
screen readers hear). Turn \`isLoading\` off to see the real card in the same space.
`,
      },
    },
  },
}

export const BadgeVsStatusLabel: Story = {
  name: 'Badge vs status label',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The same skeleton twice: `badge` reaches the bones and is visible, `label` stays with skully and is only announced.',
      },
    },
  },
  render: () => (
    <div className={styles.grid}>
      <StatusInspector>
        <BadgeCardSkeleton isLoading badge="NEW" label="Loading card" />
      </StatusInspector>
      <StatusInspector>
        <BadgeCardSkeleton isLoading badge="SALE" label="Loading offer" />
      </StatusInspector>
    </div>
  ),
}
