import type { Meta, StoryObj } from '@storybook/react-vite'
import { USERS } from './stories/fakeApi'
import { ModesDemo, QueryDemo, RefForwardingDemo, StatusInspector } from './stories/demos'
import { UserCardSkeleton } from './stories/skeletons'
import { UserCardView } from './stories/UserCard'

const meta = {
  title: 'Skully/Skeleton',
  component: UserCardSkeleton,
  parameters: {
    docs: {
      description: {
        component: `
\`Skeleton\` is the flag-driven half of \`createSkeleton(Bones)\`. It makes exactly one decision:
render the bones (your skeleton UI) or render its children (the real content). It adds no layout DOM
of its own.

In these examples the bones are \`UserCardBones\` (built from the \`Circle\` and \`Line\` primitives of
\`skully/bones\`), and the skeleton was created once:

\`\`\`tsx
'use client'
export const { Skeleton: UserCardSkeleton, SuspenseSkeleton: UserCardSuspense } =
  createSkeleton(UserCardBones)
\`\`\`

- In the default ("initial") mode, the skeleton is shown only until content has been shown once in
  this instance's lifetime. After that the children always render and handle refetches themselves.
- With \`always\`, the skeleton is shown whenever \`isLoading\` is true. Pair it with a precise
  "no data for this item yet" signal such as TanStack Query's \`isPending\`.
- Every prop of the bones (\`lines\`, \`compact\`, \`ref\` here) is accepted and forwarded; the
  reserved props \`isLoading\`, \`always\`, \`label\` and \`children\` never are.
- While the skeleton is shown, a visually hidden \`<span role="status">\` carries the \`label\`.
  The dashed box under some examples shows what that element announces.
`,
      },
    },
  },
  args: {
    isLoading: true,
    always: false,
    label: 'Loading…',
    lines: 2,
    compact: false,
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
        'Show the skeleton every time `isLoading` is true, not only before the first content. Use with a precise signal (`isPending`), not `isFetching`.',
      control: 'boolean',
      table: {
        category: 'skully',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      description:
        'Visually hidden text of the `role="status"` element rendered next to the bones. Accepts any node except `true` (e.g. a translation component); `false` or `null` renders no status element.',
      control: 'text',
      table: {
        category: 'skully',
        type: { summary: 'SkeletonLabel', detail: 'ReactNode (except true)' },
        defaultValue: { summary: '"Loading…"' },
      },
    },
    children: {
      description:
        'The real content. It should read its own data (hook, query, `use()`), because JSX children are evaluated before the skeleton decides.',
      control: false,
      table: { category: 'skully', type: { summary: 'ReactNode' } },
    },
    lines: {
      description:
        'Bones prop (from `UserCardBones`): number of bio lines to reserve. It is forwarded untouched, so try changing it while the skeleton is shown.',
      control: { type: 'range', min: 1, max: 6 },
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    compact: {
      description:
        'Bones prop (from `UserCardBones`): narrower card. The example also passes it to the content so both sizes match and nothing shifts.',
      control: 'boolean',
      table: {
        category: 'Bones props (forwarded)',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    ref: {
      description:
        'Bones prop: forwarded to the bones root element while the skeleton is shown. See the "Ref forwarding" story.',
      control: false,
      table: { category: 'Bones props (forwarded)', type: { summary: 'Ref<HTMLDivElement>' } },
    },
  },
  render: ({ compact, ...args }) => (
    <StatusInspector>
      <UserCardSkeleton {...args} compact={compact}>
        <UserCardView user={USERS[0]} compact={compact} />
      </UserCardSkeleton>
    </StatusInspector>
  ),
} satisfies Meta<typeof UserCardSkeleton>

// Storybook's CSF format requires the meta as default export.
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Every prop is wired to the controls.

**Try:** turn \`isLoading\` off (content appears), then on again. In the default mode the content
stays, because the instance has already shown content once. Now enable \`always\` and toggle
\`isLoading\` again: the skeleton comes back every time.
`,
      },
    },
  },
}

export const Loading: Story = {
  args: { isLoading: true },
  parameters: {
    docs: {
      description: {
        story:
          'Mounted with `isLoading={true}`: the bones are rendered, plus the hidden status element announcing "Loading…". Change `lines` or `compact` to see bones props being forwarded.',
      },
    },
  },
}

export const Loaded: Story = {
  args: { isLoading: false },
  parameters: {
    docs: {
      description: {
        story:
          'Mounted with `isLoading={false}`: the children are rendered as-is. skully adds no wrapper element and no status element.',
      },
    },
  },
}

export const InitialVsAlways: Story = {
  name: 'Initial vs always (behavior table)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
This is the behavior table as a live demo. Both skeletons receive the same \`isLoading\` flag;
only \`always\` differs.

**Try:** press *Toggle isLoading* to show the content in both. Toggle again: the default mode
keeps the card (which dims itself, since the content owns its refetch state), and \`always\` shows
the skeleton. *Remount* creates new instances, so both start over.
`,
      },
    },
  },
  render: () => <ModesDemo />,
}

export const InitialModeWithQuery: Story = {
  name: 'Initial mode: refetch and next user',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
A realistic setup: a TanStack-Query-like hook drives \`isLoading={isPending}\` and the card reads
the query itself (children read their own data).

**Try:** wait for the first load (skeleton). Then press *Refetch* or *Next user*: the previous card
stays on screen and dims itself while \`isFetching\` is true. This instance never shows the skeleton
again, because the skeleton is only for "nothing to show yet".
`,
      },
    },
  },
  render: () => (
    <QueryDemo
      always={false}
      signal="isPending"
      title="Default mode, isLoading={isPending}"
      hint="Skeleton on first load only. Refetch and Next user keep the previous card, dimmed."
    />
  ),
}

export const AlwaysModeWithQuery: Story = {
  name: 'always: refetch and next user',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
Same query, now with \`always\`. \`isPending\` means "no data for this user yet", so:

- *Next user* → \`isPending\` is true → the skeleton comes back (identity change).
- *Refetch* → only \`isFetching\` is true → the card stays, dimmed.

This is the recommended way to use \`always\`: skeleton for a new item, in-place feedback for a
refresh. If focus is inside the content when it's swapped for the skeleton, focus is lost.
`,
      },
    },
  },
  render: () => (
    <QueryDemo
      always
      signal="isPending"
      title="always, isLoading={isPending}"
      hint="Next user shows the skeleton (no data for that user yet). Refetch keeps the card."
    />
  ),
}

export const AlwaysWithIsFetchingPitfall: Story = {
  name: 'Pitfall: always with isFetching',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `
What not to do: drive \`always\` with \`isFetching\` (or SWR's \`isValidating\`), a flag that is
also true during background refetches.

**Try:** press *Refetch*: the card you were reading is replaced by the skeleton on every refresh,
even though its data was perfectly good. Compare with the previous story.
`,
      },
    },
  },
  render: () => (
    <QueryDemo
      always
      signal="isFetching"
      title="always, isLoading={isFetching}"
      hint="Every refetch flashes the skeleton. Use isPending instead."
    />
  ),
}

export const CustomLabel: Story = {
  args: { label: 'Loading user profile' },
  parameters: {
    docs: {
      description: {
        story:
          'A more specific status text. It is visually hidden: the dashed box shows what assistive technology finds in the `role="status"` element.',
      },
    },
  },
}

export const TranslatedLabelNode: Story = {
  name: 'Label as a node (translation)',
  args: { label: <span lang="it">Caricamento del profilo…</span> },
  parameters: {
    controls: { exclude: ['label'] },
    docs: {
      description: {
        story:
          '`label` accepts any `ReactNode`, so you can pass a translation component such as `<Trans id="loading" />`. Here a `<span lang="it">` stands in for one.',
      },
    },
  },
}

export const NoLabel: Story = {
  name: 'No label (decorative)',
  args: { label: false },
  parameters: {
    controls: { exclude: ['label'] },
    docs: {
      description: {
        story:
          '`label={false}` (or `label={null}`) renders no status element at all. Use it for decorative skeletons, or for areas whose loading state is already announced elsewhere (e.g. a page-level status).',
      },
    },
  },
}

export const RefForwarding: Story = {
  args: { lines: 3 },
  parameters: {
    controls: { include: ['lines', 'compact'] },
    docs: {
      description: {
        story: `
\`ref\` is an ordinary bones prop (React 19 passes refs as props), so it is typed from
\`UserCardBonesProps\` and forwarded to the bones' root element while the skeleton is shown.

**Try:** change \`lines\` or \`compact\`; the measured size of the element behind the ref updates.
`,
      },
    },
  },
  render: ({ lines, compact }) => <RefForwardingDemo lines={lines} compact={compact} />,
}
