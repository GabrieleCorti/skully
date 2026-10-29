import type { ComponentProps, ComponentType, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'
import { createSkeleton } from './createSkeleton'
import { renameProps, type RenamedProps } from './renameProps'
import type { SkeletonLabel } from './types'

interface BadgeBonesProps {
  loadingLabel: string
  tone?: 'info' | 'warning'
  lines: number
  ref?: Ref<HTMLDivElement>
}

function BadgeBones(_: BadgeBonesProps) {
  return null
}

describe('renameProps types', () => {
  it('renames a required prop, keeping its type and other props', () => {
    const Renamed = renameProps(BadgeBones, { loadingLabel: 'badge' })
    expectTypeOf(Renamed).toEqualTypeOf<
      ComponentType<{
        badge: string
        tone?: 'info' | 'warning'
        lines: number
        ref?: Ref<HTMLDivElement>
      }>
    >()

    type Props = ComponentProps<typeof Renamed>
    expectTypeOf<Props>().not.toHaveProperty('loadingLabel')
    expectTypeOf<Props['badge']>().toEqualTypeOf<string>()
    expectTypeOf<Props['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()

    void (<Renamed badge="NEW" lines={2} />)
    // @ts-expect-error `badge` is required, like `loadingLabel` was
    void (<Renamed lines={2} />)
    // @ts-expect-error the old name is gone
    void (<Renamed badge="NEW" loadingLabel="NEW" lines={2} />)
    // @ts-expect-error `badge` keeps the string type
    void (<Renamed badge={1} lines={2} />)
  })

  it('keeps optionality of a renamed optional prop', () => {
    const Renamed = renameProps(BadgeBones, { tone: 'intent' })
    type Props = ComponentProps<typeof Renamed>
    expectTypeOf<Props>().toEqualTypeOf<{
      loadingLabel: string
      intent?: 'info' | 'warning'
      lines: number
      ref?: Ref<HTMLDivElement>
    }>()

    void (<Renamed loadingLabel="NEW" lines={2} />)
    void (<Renamed loadingLabel="NEW" lines={2} intent="info" />)
    // @ts-expect-error `intent` keeps the union type
    void (<Renamed loadingLabel="NEW" lines={2} intent="danger" />)
  })

  it('renames several props at once', () => {
    expectTypeOf<
      RenamedProps<BadgeBonesProps, { loadingLabel: 'badge'; lines: 'rows' }>
    >().toEqualTypeOf<{
      badge: string
      tone?: 'info' | 'warning'
      rows: number
      ref?: Ref<HTMLDivElement>
    }>()
  })

  it('rejects unknown old names', () => {
    // @ts-expect-error `lable` is not a prop of BadgeBones
    renameProps(BadgeBones, { lable: 'badge' })
  })

  it('rejects new names that collide with an existing prop', () => {
    // @ts-expect-error `lines` already exists
    renameProps(BadgeBones, { loadingLabel: 'lines' })
    // @ts-expect-error `ref` already exists
    renameProps(BadgeBones, { loadingLabel: 'ref' })
  })
})

describe('renameProps with createSkeleton', () => {
  it('resolves a reserved-prop clash', () => {
    // @ts-expect-error BadgeBones declares the reserved `loadingLabel`
    createSkeleton(BadgeBones)

    const { Skeleton, SuspenseSkeleton } = createSkeleton(
      renameProps(BadgeBones, { loadingLabel: 'badge' }),
    )

    void (<Skeleton isLoading badge="NEW" lines={2} loadingLabel="Loading badge" />)
    void (<SuspenseSkeleton badge="NEW" lines={2} loadingLabel={false} />)
    // @ts-expect-error `badge` is required
    void (<Skeleton isLoading lines={2} />)

    type Props = ComponentProps<typeof Skeleton>
    expectTypeOf<Props['badge']>().toEqualTypeOf<string>()
    expectTypeOf<Props['loadingLabel']>().toEqualTypeOf<SkeletonLabel | undefined>()
    expectTypeOf<Props['children']>().toEqualTypeOf<ReactNode | undefined>()
  })

  it('errors again when renaming into a reserved name', () => {
    // @ts-expect-error `always` is reserved too
    createSkeleton(renameProps(BadgeBones, { loadingLabel: 'always' }))
    // @ts-expect-error `isLoading` is reserved too
    createSkeleton(renameProps(BadgeBones, { tone: 'isLoading' }))
  })

  it('keeps the clash error when a different prop is renamed', () => {
    // @ts-expect-error `loadingLabel` is still declared
    createSkeleton(renameProps(BadgeBones, { tone: 'intent' }))
  })
})
