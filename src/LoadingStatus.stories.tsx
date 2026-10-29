import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingStatus } from './LoadingStatus'
import { StatusInspector } from './stories/demos'
import { UserCardBones } from './stories/UserCard'

const meta = {
  title: 'Skully/LoadingStatus',
  component: LoadingStatus,
  parameters: {
    docs: {
      description: {
        component: `
The visually hidden \`<span role="status">\` that \`Skeleton\` and \`SuspenseSkeleton\` render next
to the bones, on its own. Use it when bones are rendered outside the skully components, e.g. in a
Next.js \`loading.tsx\`:

\`\`\`tsx
// app/profile/loading.tsx
import { LoadingStatus } from '@gico/skully'

export default function Loading() {
  return (
    <>
      <UserCardBones />
      <LoadingStatus>Loading profile</LoadingStatus>
    </>
  )
}
\`\`\`

\`children\` defaults to \`"Loading…"\`. The element is invisible: the dashed box shows what it
announces.
`,
      },
    },
  },
  argTypes: {
    children: {
      description: 'Visually hidden status text.',
      control: 'text',
      table: { type: { summary: 'ReactNode' }, defaultValue: { summary: '"Loading…"' } },
    },
  },
  render: (args) => (
    <StatusInspector>
      <LoadingStatus {...args} />
    </StatusInspector>
  ),
} satisfies Meta<typeof LoadingStatus>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomText: Story = {
  args: { children: 'Loading profile' },
}

export const WithBones: Story = {
  name: 'With bones (loading.tsx)',
  args: { children: 'Loading profile' },
  parameters: {
    docs: {
      description: {
        story:
          'Bones rendered directly, without a skully wrapper, paired with `LoadingStatus`: the same output as `<UserCardSkeleton isLoading loadingLabel="Loading profile" />`.',
      },
    },
  },
  render: (args) => (
    <StatusInspector>
      <UserCardBones />
      <LoadingStatus {...args} />
    </StatusInspector>
  ),
}
