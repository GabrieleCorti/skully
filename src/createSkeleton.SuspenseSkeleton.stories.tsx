import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DeferredValueDemo,
  ForeverSuspended,
  ReloadDemo,
  StatusInspector,
  TransitionDemo,
} from './stories/demos'
import { UserCardSuspense } from './stories/skeletons'

const meta = {
  title: 'Skully/SuspenseSkeleton',
  component: UserCardSuspense,
  parameters: {
    docs: {
      description: {
        component: `
\`SuspenseSkeleton\` is the Suspense half of \`createSkeleton(Bones)\`: a \`<Suspense>\` boundary
whose fallback is your bones plus the visually hidden status label. It has no \`isLoading\` or
\`always\`: React decides whether the fallback shows.

\`\`\`tsx
function UserCard({ id }: { id: number }) {
  const user = use(fetchUser(id)) // suspends until the user has loaded
  return <Card user={user} />
}

<UserCardSuspense lines={3}>
  <UserCard id={id} />
</UserCardSuspense>
\`\`\`

When content re-suspends, React's rules are the Suspense equivalent of the two \`Skeleton\` modes:

- updates inside a transition (\`startTransition\`, \`useDeferredValue\`) keep the current
  content, like the default mode;
- plain updates show the fallback again, like \`always\`.
`,
      },
    },
  },
  args: {
    loadingLabel: 'Loading…',
    lines: 2,
    compact: false,
  },
  argTypes: {
    loadingLabel: {
      description:
        'Visually hidden text of the `role="status"` element rendered with the fallback. Accepts any node except `true`; `false` or `null` renders no status element.',
      control: 'text',
      table: {
        category: 'skully',
        type: { summary: 'SkeletonLabel', detail: 'ReactNode (except true)' },
        defaultValue: { summary: '"Loading…"' },
      },
    },
    children: {
      description:
        'Content that may suspend (e.g. reads data with `use()`). Shown once everything inside has resolved.',
      control: false,
      table: { category: 'skully', type: { summary: 'ReactNode' } },
    },
    lines: {
      description: 'Bones prop (from `UserCardBones`): number of bio lines to reserve.',
      control: { type: 'range', min: 1, max: 6 },
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    compact: {
      description: 'Bones prop (from `UserCardBones`): narrower card.',
      control: 'boolean',
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    ref: {
      description: 'Bones prop: forwarded to the bones root element while the fallback is shown.',
      control: false,
      table: { category: 'Bones props (forwarded)', type: { summary: 'Ref<HTMLDivElement>' } },
    },
  },
} satisfies Meta<typeof UserCardSuspense>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
The card reads its user with \`use()\`. On mount it suspends, so the boundary shows the bones
(with \`lines\`/\`compact\` forwarded) until the 1.2s fake request resolves.

**Try:** press *Reload*. It starts a new request with a plain state update, so React shows the
fallback again. Change \`loadingLabel\` and reload to see the announced text change.
`,
      },
    },
  },
  render: ({ loadingLabel, lines, compact }) => (
    <ReloadDemo loadingLabel={loadingLabel} lines={lines} compact={compact} />
  ),
}

export const Fallback: Story = {
  name: 'Fallback (suspended forever)',
  parameters: {
    docs: {
      description: {
        story:
          'A child that never resolves, so the fallback stays on screen: bones plus the hidden `role="status"` label. Use it to inspect the fallback or for visual regression snapshots.',
      },
    },
  },
  render: (args) => (
    <StatusInspector>
      <UserCardSuspense {...args}>
        <ForeverSuspended />
      </UserCardSuspense>
    </StatusInspector>
  ),
}

export const TransitionVsPlainUpdate: Story = {
  name: 'Transition vs plain update',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
The same state change (switching to the next user, which suspends) done two ways.

**Try:**
- *Next user (plain update)*: the fallback replaces the card until the new user loads.
- *Next user (startTransition)*: the current card stays while \`isPending\` from
  \`useTransition\` is true, then switches directly to the new user.
`,
      },
    },
  },
  render: () => <TransitionDemo />,
}

export const DeferredValue: Story = {
  name: 'useDeferredValue keeps content',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
\`useDeferredValue\` is the other way to get transition semantics. The card renders the
deferred request, so a click never shows the fallback: the old card stays (dimmed here, using
\`deferred !== request\`) until the new one is ready. Only the very first load shows the bones.
`,
      },
    },
  },
  render: () => <DeferredValueDemo />,
}
