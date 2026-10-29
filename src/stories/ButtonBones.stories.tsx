import type { Meta, StoryObj } from '@storybook/react-vite'
import { SaveButton } from './ButtonBones'
import { ButtonSkeleton } from './buttonSkeletons'
import { StatusInspector } from './demos'
import styles from './stories.module.css'

const meta = {
  title: 'Skully/Renaming props',
  component: ButtonSkeleton,
  parameters: {
    controls: { include: ['isLoading', 'busy', 'loadingLabel'] },
    docs: {
      description: {
        component: `
\`isLoading\`, \`always\` and \`loadingLabel\` belong to skully and are never forwarded to the
bones, so bones that declare one of them would silently never receive it. \`createSkeleton\`
turns that silent bug into a compile-time error (\`children\` is allowed):

\`\`\`tsx
createSkeleton(ButtonBones) // ButtonBones has its own \`isLoading\`: it draws a spinner
// skully: Bones declares the reserved prop "isLoading". Rename it, e.g.
// renameProps(Bones, { isLoading: 'newName' }), rename it in Bones, or wrap Bones yourself.
\`\`\`

Any of these fixes works, and none is preferred:

\`\`\`tsx
// 1. renameProps (used on this page; shows up as Renamed(ButtonBones) in DevTools)
createSkeleton(renameProps(ButtonBones, { isLoading: 'busy' }))

// 2. Rename the prop in your bones
interface ButtonBonesProps { busy?: boolean }

// 3. Wrap the bones yourself
function ButtonBonesAdapter({ busy, ...rest }: Omit<ButtonBonesProps, 'isLoading'> & { busy?: boolean }) {
  return <ButtonBones isLoading={busy} {...rest} />
}
\`\`\`

With fix 1, \`<ButtonSkeleton isLoading={isPending} busy />\` uses \`isLoading\` to decide
between bones and children, while \`busy\` reaches \`ButtonBones\` as its own \`isLoading\`.
`,
      },
    },
  },
  args: {
    isLoading: true,
    busy: true,
    loadingLabel: 'Loading action',
  },
  argTypes: {
    isLoading: {
      description: "skully's flag: bones or children. Never forwarded to the bones.",
      control: 'boolean',
      table: { category: 'skully', type: { summary: 'boolean' } },
    },
    loadingLabel: {
      description: 'skully\'s visually hidden `role="status"` text.',
      control: 'text',
      table: { category: 'skully', type: { summary: 'SkeletonLabel' } },
    },
    busy: {
      description:
        'Renamed bones prop: forwarded to `ButtonBones` as its own `isLoading` (draws a spinner).',
      control: 'boolean',
      table: { category: 'Bones props (forwarded)', type: { summary: 'boolean' } },
    },
  },
  render: (args) => (
    <StatusInspector>
      <ButtonSkeleton {...args}>
        <SaveButton>Save</SaveButton>
      </ButtonSkeleton>
    </StatusInspector>
  ),
} satisfies Meta<typeof ButtonSkeleton>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Try:** toggle \`busy\` to switch the bones between spinner and text bar; toggle \`isLoading\`
to swap the bones for the real button.
`,
      },
    },
  },
}

export const BusyVsIdle: Story = {
  name: 'busy vs idle bones',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The same skeleton twice: `busy` reaches the bones as their `isLoading`, while skully's `isLoading` keeps both on the bones.",
      },
    },
  },
  render: () => (
    <div className={styles.grid}>
      <StatusInspector>
        <ButtonSkeleton isLoading busy />
      </StatusInspector>
      <StatusInspector>
        <ButtonSkeleton isLoading busy={false} />
      </StatusInspector>
    </div>
  ),
}
