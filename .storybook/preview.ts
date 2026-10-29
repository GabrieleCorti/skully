import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    options: {
      storySort: {
        order: [
          'Skully',
          [
            'Introduction',
            'Skeleton',
            'SuspenseSkeleton',
            'Custom bones',
            'Forwarding props',
            'Renaming props',
            'LoadingStatus',
            'Bones',
            ['Overview', 'Line', 'Circle', 'Rect'],
          ],
        ],
      },
    },
  },
}

// Storybook requires a default export for its preview config.
export default preview
