import type { ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'
import { createSkeleton } from './createSkeleton'
import type {
  CheckBones,
  CreateSkeletonResult,
  ForwardedProps,
  ReservedPropError,
  SkeletonLabel,
  SkeletonProps,
  SuspenseSkeletonProps,
} from './types'

interface CardBonesProps {
  name: string
  lines?: number
  ref?: Ref<HTMLDivElement>
}

function CardBones(_: CardBonesProps) {
  return null
}

// Bones that also declare props whose names are reserved by the library.
interface ClashingBonesProps {
  width: number
  loadingLabel: string
  isLoading: string
  always: number
  children: () => void
}

function ClashingBones(_: ClashingBonesProps) {
  return null
}

const { Skeleton, SuspenseSkeleton } = createSkeleton(CardBones)

// `createSkeleton(ClashingBones)` is a compile error (see "Bones declaring reserved props").
// This is what an untyped (JS) caller gets anyway: the reserved props on the generated
// components must still carry the library's types, whatever Bones declares.
declare const Clashing: CreateSkeletonResult<ClashingBonesProps>

describe('forwarded props', () => {
  it('keeps required/optional exactly as in Bones', () => {
    expectTypeOf<ForwardedProps<CardBonesProps>>().toEqualTypeOf<{
      name: string
      lines?: number
      ref?: Ref<HTMLDivElement>
    }>()

    void (<Skeleton isLoading name="Ada" />)
    void (<Skeleton isLoading name="Ada" lines={3} />)
    void (<SuspenseSkeleton name="Ada" />)

    // @ts-expect-error `name` is required on Bones
    void (<Skeleton isLoading />)
    // @ts-expect-error `name` is required on Bones
    void (<SuspenseSkeleton />)
    // @ts-expect-error `lines` must be a number
    void (<Skeleton isLoading name="Ada" lines="3" />)
    // @ts-expect-error unknown props are rejected
    void (<Skeleton isLoading name="Ada" color="red" />)
  })

  it('accepts and types `ref` declared on Bones', () => {
    expectTypeOf<SkeletonProps<CardBonesProps>['ref']>().toEqualTypeOf<
      Ref<HTMLDivElement> | undefined
    >()
    expectTypeOf<SuspenseSkeletonProps<CardBonesProps>['ref']>().toEqualTypeOf<
      Ref<HTMLDivElement> | undefined
    >()
    const ref = { current: null as HTMLDivElement | null }
    void (<Skeleton isLoading name="Ada" ref={ref} />)
    void (<SuspenseSkeleton name="Ada" ref={ref} />)

    const spanRef = { current: null as HTMLSpanElement | null }
    // @ts-expect-error the ref element type must match Bones' ref
    void (<Skeleton isLoading name="Ada" ref={spanRef} />)
  })

  it('rejects `ref` when Bones does not declare one', () => {
    const NoRef = createSkeleton((_: { name: string }) => null)
    const ref = { current: null as HTMLDivElement | null }
    // @ts-expect-error Bones has no `ref` prop
    void (<NoRef.Skeleton isLoading name="Ada" ref={ref} />)
    // @ts-expect-error Bones has no `ref` prop
    void (<NoRef.SuspenseSkeleton name="Ada" ref={ref} />)
  })

  it('infers Bones props from the component', () => {
    expectTypeOf(createSkeleton(CardBones)).toEqualTypeOf<CreateSkeletonResult<CardBonesProps>>()
  })
})

describe('reserved props', () => {
  it('are removed from forwarded props', () => {
    expectTypeOf<keyof ForwardedProps<ClashingBonesProps>>().toEqualTypeOf<'width'>()
  })

  it('have the library types on Skeleton', () => {
    type Props = SkeletonProps<ClashingBonesProps>
    expectTypeOf<Props['isLoading']>().toEqualTypeOf<boolean>()
    expectTypeOf<Props['always']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Props['loadingLabel']>().toEqualTypeOf<SkeletonLabel | undefined>()
    expectTypeOf<Props['children']>().toEqualTypeOf<ReactNode | undefined>()

    void (
      <Clashing.Skeleton isLoading width={1} loadingLabel={false} always>
        <p>content</p>
      </Clashing.Skeleton>
    )
    void (<Clashing.Skeleton isLoading width={1} loadingLabel="Loading profile" />)
    // @ts-expect-error the library's `isLoading` wins over Bones' string type
    void (<Clashing.Skeleton isLoading="yes" width={1} />)
    // @ts-expect-error the library's `always` wins over Bones' number type
    void (<Clashing.Skeleton isLoading width={1} always={1} />)
    // @ts-expect-error the library's `children` wins over Bones' function type
    void (<Clashing.Skeleton isLoading width={1} children={() => {}} />)
  })

  it('accept `loadingLabel` as a string, a node, false or null', () => {
    expectTypeOf<SkeletonLabel>().toEqualTypeOf<Exclude<ReactNode, true>>()

    void (<Skeleton isLoading name="Ada" loadingLabel="Loading profile" />)
    void (<Skeleton isLoading name="Ada" loadingLabel={<b>Loading</b>} />)
    void (<Skeleton isLoading name="Ada" loadingLabel={false} />)
    void (<Skeleton isLoading name="Ada" loadingLabel={null} />)
    void (<SuspenseSkeleton name="Ada" loadingLabel={false} />)
    void (<SuspenseSkeleton name="Ada" loadingLabel={null} />)
    // @ts-expect-error `true` is not a valid loadingLabel
    void (<Skeleton isLoading name="Ada" loadingLabel={true} />)
    // @ts-expect-error `true` is not a valid loadingLabel
    void (<SuspenseSkeleton name="Ada" loadingLabel={true} />)
    // @ts-expect-error objects are not renderable labels
    void (<Skeleton isLoading name="Ada" loadingLabel={{ text: 'Loading' }} />)
  })

  it('have the library types on SuspenseSkeleton', () => {
    type Props = SuspenseSkeletonProps<ClashingBonesProps>
    expectTypeOf<Props['loadingLabel']>().toEqualTypeOf<SkeletonLabel | undefined>()
    expectTypeOf<Props['children']>().toEqualTypeOf<ReactNode | undefined>()

    void (<Clashing.SuspenseSkeleton width={1} loadingLabel={<b>Loading</b>} />)
  })

  it('requires `isLoading` on Skeleton', () => {
    // @ts-expect-error `isLoading` is required
    void (<Skeleton name="Ada" />)
  })

  it('rejects `isLoading` and `always` on SuspenseSkeleton', () => {
    // @ts-expect-error not a SuspenseSkeleton prop
    void (<SuspenseSkeleton name="Ada" isLoading />)
    // @ts-expect-error not a SuspenseSkeleton prop
    void (<SuspenseSkeleton name="Ada" always />)
    // @ts-expect-error not a SuspenseSkeleton prop, even when Bones declares it
    void (<Clashing.SuspenseSkeleton width={1} isLoading="yes" />)
  })
})

describe('Bones declaring reserved props', () => {
  it('is a compile error for `isLoading`, `always` and `loadingLabel`, required or optional', () => {
    // @ts-expect-error `isLoading` is reserved
    createSkeleton((_: { width: number; isLoading: boolean }) => null)
    // @ts-expect-error `isLoading` is reserved, even when optional
    createSkeleton((_: { width: number; isLoading?: boolean }) => null)
    // @ts-expect-error `always` is reserved
    createSkeleton((_: { width: number; always: boolean }) => null)
    // @ts-expect-error `always` is reserved, even when optional
    createSkeleton((_: { width: number; always?: boolean }) => null)
    // @ts-expect-error `loadingLabel` is reserved
    createSkeleton((_: { width: number; loadingLabel: string }) => null)
    // @ts-expect-error `loadingLabel` is reserved, even when optional
    createSkeleton((_: { width: number; loadingLabel?: string }) => null)
    // @ts-expect-error several reserved props at once
    createSkeleton(ClashingBones)
  })

  it('reports the clashing prop in the error message', () => {
    expectTypeOf<CheckBones<{ width: number; loadingLabel?: string }>>().toEqualTypeOf<
      ReservedPropError<'loadingLabel'>
    >()
    expectTypeOf<
      ReservedPropError<'loadingLabel'>
    >().toEqualTypeOf<'skully: Bones declares the reserved prop "loadingLabel". Rename it, e.g. renameProps(Bones, { loadingLabel: \'newName\' }), rename it in Bones, or wrap Bones yourself.'>()
    // With several clashes, there is exactly one message per clashing prop.
    type TwoClashes = CheckBones<{ isLoading: string; always?: number }>
    expectTypeOf<TwoClashes>().toEqualTypeOf<
      ReservedPropError<'isLoading'> | ReservedPropError<'always'>
    >()
    // No message mixes up two prop names.
    expectTypeOf<'skully: Bones declares the reserved prop "isLoading". Rename it, e.g. renameProps(Bones, { always: \'newName\' }), rename it in Bones, or wrap Bones yourself.'>().not.toExtend<TwoClashes>()
  })

  it('allows `children`, required or optional', () => {
    expectTypeOf<CheckBones<{ width: number; children: ReactNode }>>().toEqualTypeOf<unknown>()
    createSkeleton((_: { width: number; children: ReactNode }) => null)
    createSkeleton((_: { width: number; children?: ReactNode }) => null)
  })

  it('allows `label`, which is not reserved, and keeps its Bones type', () => {
    expectTypeOf<CheckBones<{ label: string }>>().toEqualTypeOf<unknown>()
    expectTypeOf<SkeletonProps<{ label: string }>['label']>().toEqualTypeOf<string>()
    const Button = createSkeleton((_: { label: string }) => null)

    void (<Button.Skeleton isLoading label="Save" loadingLabel="Saving" />)
    void (<Button.SuspenseSkeleton label="Save" />)
    // @ts-expect-error `label` is required on Bones
    void (<Button.Skeleton isLoading />)
    // @ts-expect-error `label` keeps Bones' string type
    void (<Button.Skeleton isLoading label={1} />)
  })

  it('allows bones without reserved props', () => {
    expectTypeOf<CheckBones<CardBonesProps>>().toEqualTypeOf<unknown>()
    expectTypeOf<CheckBones<object>>().toEqualTypeOf<unknown>()
    createSkeleton(CardBones)
    createSkeleton(() => null)
  })
})
