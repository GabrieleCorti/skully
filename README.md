# skully

Skeleton loading for React 19, defined once.

[![CI](https://github.com/GabrieleCorti/skully/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrieleCorti/skully/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@gico/skully)](https://www.npmjs.com/package/@gico/skully)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Live Storybook](https://gabrielecorti.github.io/skully/)

Without skully, you write every loading state by hand:

```tsx
function UserPanel() {
  const { data: user } = useUser()
  return user ? <UserCard user={user} /> : <UserCardBones />
}
```

Now do that in 100 places, each with its own styles, its own layout quirks and its own idea of what a refetch should look like.

With skully you define the bones once, and every usage behaves the same way:

```tsx
export const { Skeleton: UserCardSkeleton } = createSkeleton(UserCardBones)

<UserCardSkeleton isLoading={isPending}>
  <UserCard />
</UserCardSkeleton>
```

Every usage also gets:

- No skeleton flash on refetch. By default the skeleton only shows on the first load, and after that the content handles its own refresh state. Pass `always` to show it every time.
- Compile-time checks for reserved props. If your bones declare a prop that skully owns, the code doesn't compile, so the prop can't silently go missing.
- An accessible status label. skully renders a visually hidden `role="status"` element next to the bones. It says "Loading…" by default, and you can translate it.
- A matching `SuspenseSkeleton`, which uses the same bones as a Suspense fallback.

skully is headless. The bones are your own component, and skully adds no layout DOM around them. If you'd rather not write skeleton CSS, the optional [`skully/bones`](#default-bones-skullybones) primitives do it for you.

```sh
npm install @gico/skully
```

skully needs `react@^19` and has no runtime dependencies. TypeScript users need `typescript@>=5.3`. On older versions the `renameProps` types widen to `string`, and every prop fails with an unreadable error.

## Quick start

Write your skeleton UI (the "bones") once, then create its two behaviors:

```tsx
// user-card-skeleton.ts
'use client'
import { createSkeleton } from '@gico/skully'
import { UserCardBones } from './UserCardBones'

export const { Skeleton: UserCardSkeleton, SuspenseSkeleton: UserCardSuspense } =
  createSkeleton(UserCardBones)
```

```tsx
<UserCardSkeleton isLoading={isPending} lines={3}>
  <UserCard />
</UserCardSkeleton>

<UserCardSuspense lines={3}>
  <UserCard />
</UserCardSuspense>
```

The generated components accept every prop of `UserCardBones`, including `ref`, with the same types, and pass them on to the bones.

## Default bones: `skully/bones`

If you don't want to write shimmer CSS, build your bones from these primitives. Load their stylesheet once, for example in your root layout:

```tsx
import '@gico/skully/bones.css'
```

Then lay them out with your own CSS. In this example the bones reuse the real card's stylesheet, so each `Line` has the same typography as the text it stands in for:

```tsx
import { Circle, Line } from '@gico/skully/bones'
import styles from './UserCard.module.css' // the same classes as the real card

export function UserCardBones({ lines = 2 }: UserCardBonesProps) {
  return (
    <div className={styles.card}>
      <Circle className={styles.avatar} />
      <div className={styles.body}>
        {/* Same font-size, line-height and margins as the real <h3> and <p>. */}
        <Line className={styles.name} />
        {Array.from({ length: lines }, (_, i) => (
          <Line key={i} className={styles.bio} />
        ))}
      </div>
    </div>
  )
}
```

| Component | Default size                                        | Shape       |
| --------- | --------------------------------------------------- | ----------- |
| `Line`    | full width × one line box (`1lh`), with a `1em` bar | rounded bar |
| `Circle`  | `2.5em` × `2.5em`                                   | round       |
| `Rect`    | full width × `6em`                                  | rounded     |

- Each one renders a `<span>` with `display: block`, so you can put it inside a `<p>`, a heading or a button.
- They set `aria-hidden="true"` and accept all native props, including `className` and `ref`. There are no size props; you size them with `className`.
- They have no state and ship without `"use client"`, so server components can render them directly, for example in a Next.js `loading.tsx`.

### Sizing a `Line`

A `Line` is exactly one line of text tall. Its height is the line box (`1lh`) of its own typography, and it draws a bar centred inside that box. Three `Line`s therefore take up the same height as the three lines of text they replace, and you don't need to tune any margins.

- For the line box, give the `Line` the same `font-size` and `line-height` as the text it replaces. Reusing the text's class is the easiest way.
- For the width, set `width` in your `className`. The default is `100%`.
- For the bar, set `--sk-line-thickness`. The default is `1em`, and the bar never grows taller than the line box.

Setting `height` on a `Line` changes the line box, not the bar.

### Theming

Set these custom properties on `:root` or on any ancestor:

| Property              | Default               | Purpose                                                   |
| --------------------- | --------------------- | --------------------------------------------------------- |
| `--sk-color`          | 12% of `currentColor` | Base colour                                               |
| `--sk-highlight`      | 5% of `currentColor`  | Shimmer highlight                                         |
| `--sk-radius`         | `4px`                 | Corner radius of the `Line` bar and of `Rect`             |
| `--sk-duration`       | `1.4s`                | Length of one shimmer cycle                               |
| `--sk-delay`          | `150ms`               | Fade-in delay, so fast loads don't flash (layout is kept) |
| `--sk-line-thickness` | `1em`                 | Thickness of the `Line` bar, capped at the line box       |

The default colours are mixed from the text colour (`color-mix(in srgb, currentColor 12%, transparent)`), so the bones match your theme on light and dark backgrounds without any setup. Set `--sk-color` and `--sk-highlight` if you want fixed colours instead.

The styles live in a `@layer skully` cascade layer, so your own classes win regardless of specificity or import order. When the user prefers reduced motion, the shimmer and the fade-in are turned off.

### Why the CSS is a separate import

An explicit import works with server components, every bundler, server rendering and test runners. If the JavaScript imported the stylesheet itself, plain Node server rendering and some test runners would fail. Injecting styles at runtime would leave server-rendered skeletons unstyled until the JavaScript loads. If you forget the import, the primitives render as empty spans, so nothing breaks, but you won't see them.

## Children own their data

skully makes one decision: skeleton or children. It doesn't fetch, store or pass data. The children are the real content, so they read their own data and handle their own loading states.

This matters because the parent creates the JSX children before skully decides anything. If the parent reads the data, strict TypeScript stops you:

```tsx
function UserPanel() {
  const { data: user } = useUser() // User | undefined
  return (
    <UserCardSkeleton isLoading={!user}>
      {/* Type error: 'user' is possibly 'undefined'. */}
      <Profile name={user.name} />
    </UserCardSkeleton>
  )
}
```

`isLoading` is just a boolean, so skully can't narrow `user` for you. Rather than writing `user!.name`, move the data access into the child, where it can handle its own states:

```tsx
function Profile() {
  const { data: user, isFetching } = useUser()
  // The skeleton covers the first load.
  if (!user) return null
  return <h2 className={isFetching ? styles.stale : undefined}>{user.name}</h2>
}

function UserPanel() {
  const { isPending } = useUser()
  return (
    <UserCardSkeleton isLoading={isPending}>
      <Profile />
    </UserCardSkeleton>
  )
}
```

With `SuspenseSkeleton`, a suspending read such as `use()` or `useSuspenseQuery` gives the child data that is never `undefined`.

## `Skeleton`

| Prop           | Type            | Default      |                                                 |
| -------------- | --------------- | ------------ | ----------------------------------------------- |
| `isLoading`    | `boolean`       | required     | Whether the data is still loading.              |
| `always`       | `boolean`       | `false`      | Show the skeleton whenever `isLoading` is true. |
| `loadingLabel` | `SkeletonLabel` | `"Loading…"` | Visually hidden status text.                    |
| `children`     | `ReactNode`     |              | The real content.                               |

### Default vs `always`

By default the skeleton only shows on the first load. After that the children stay on screen and have to handle refetches themselves, for example by dimming or showing a spinner.

Pass `always` to show the skeleton every time `isLoading` is true:

```tsx
<UserCardSkeleton isLoading={isLoading} always>
  <UserCard id={id} />
</UserCardSkeleton>
```

With `always`, pass a flag that means "no data yet", not one that is also true during background refetches, or every refetch brings the skeleton back. For example, with TanStack Query that's `isPending` rather than `isFetching`.

## `SuspenseSkeleton`

`SuspenseSkeleton` is a Suspense boundary whose fallback is your bones plus the hidden label. It has no `isLoading` or `always` prop.

```tsx
function UserCard({ id }: { id: number }) {
  const user = use(fetchUser(id))
  return <Card user={user} />
}

function Profile({ id }: { id: number }) {
  return (
    <UserCardSuspense>
      <UserCard id={id} />
    </UserCardSuspense>
  )
}
```

React decides whether a second suspension shows the fallback again, which works like initial mode versus `always`:

- updates inside a transition (`startTransition`, `useDeferredValue`) keep the current content, like initial mode;
- other updates show the fallback again, like `always`.

## Reserved props

`isLoading`, `always`, `loadingLabel` and `children` belong to skully, and it never passes them on to the bones. Every other prop, including `label`, goes straight through.

So if your bones declared `isLoading`, `always` or `loadingLabel`, they would never receive it, and nothing would tell you. `createSkeleton` turns that into a compile error instead:

```tsx
interface ButtonBonesProps {
  text: string
  isLoading: boolean // draws a spinner inside the button
}

createSkeleton(ButtonBones)
//             ~~~~~~~~~~~
// … is not assignable to parameter of type '… & "skully: Bones declares the reserved
// prop \"isLoading\". Rename it, e.g. renameProps(Bones, { isLoading: 'newName' }),
// rename it in Bones, or wrap Bones yourself."'
```

`children` is allowed, so you can build bones on top of `PropsWithChildren` components. They just never receive skully's children.

There are three ways to fix a clash, and none of them is the preferred one:

1. Use `renameProps`: `createSkeleton(renameProps(ButtonBones, { isLoading: 'busy' }))` (see below).
2. Rename the prop in your bones, for example from `isLoading` to `busy`.
3. Wrap the bones yourself:
   ```tsx
   function ButtonBonesAdapter({
     busy,
     ...rest
   }: Omit<ButtonBonesProps, 'isLoading'> & { busy: boolean }) {
     return <ButtonBones isLoading={busy} {...rest} />
   }
   ```

## `renameProps`

```ts
function renameProps<P, M extends { [K in keyof P]?: string }>(
  Component: ComponentType<P>,
  map: M, // old name → new name
): ComponentType<RenamedProps<P, M>>
```

`renameProps` wraps a component and exposes some of its props under new names:

```tsx
'use client'
import { createSkeleton, renameProps } from '@gico/skully'

export const { Skeleton: ButtonSkeleton } = createSkeleton(
  renameProps(ButtonBones, { isLoading: 'busy' }),
)

<ButtonSkeleton isLoading={isPending} text="Save" busy>
  <SaveButton />
</ButtonSkeleton>
// skully reads isLoading={isPending}; ButtonBones receives text="Save" isLoading={true}.
```

- A renamed prop keeps its type, and stays required or optional. Other props and `ref` pass through unchanged.
- An unknown old name (`{ isLoadin: 'busy' }`) is a type error, and so is a new name that collides with an existing prop (`{ isLoading: 'text' }`).
- Renaming into a reserved name (`{ isLoading: 'always' }`) brings back the reserved-prop error.
- React DevTools shows the wrapper as `Renamed(ButtonBones)`.

## Server components

`Skeleton` uses state, so skully ships as a client module (`"use client"`). Create your skeletons in a `"use client"` file and export each one as its own named constant, as in the quick start. Server components can then render them and pass in server-rendered children.

Don't group them as properties of an object (such as `Skeletons.User`). A server component that reads a property of a client module's export throws.

## Accessibility

While the skeleton is shown, skully renders a visually hidden `<span role="status">` next to the bones. It's the only DOM element skully adds itself.

- The default text is `"Loading…"`.
- Use `loadingLabel="Loading profile"` or `loadingLabel={<Trans id="loading" />}` to change or translate it.
- `loadingLabel={false}` or `loadingLabel={null}` renders no status element. Use it for decorative skeletons, or in areas that already announce that they're loading.

The label's type, `SkeletonLabel`, is any `ReactNode` except `true`, which doesn't mean anything as a label.

When you render bones without a skully wrapper, for example in a Next.js `loading.tsx`, add the same status element yourself with `LoadingStatus`. Its children are the text, and they default to `"Loading…"`:

```tsx
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
```

Hide the bones from screen readers so they only hear the label. The `skully/bones` primitives already set `aria-hidden="true"`, so you only need it on custom bones or on wrapper elements around the primitives.

One known limitation: some screen readers don't announce a status element straight away when it's inserted together with its text. Users can still find it while navigating the page.

## Development

```sh
npm run test          # Vitest, runtime + type-level tests
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint + Prettier check
npm run build         # tsup → dist (ESM + CJS + .d.ts + bones.css)
npm run storybook     # interactive examples
```

## AI disclosure

I wrote the core logic by hand — `createSkeleton.tsx`, `renameProps.tsx`, the hooks and bones. The trickier type-level code in `types.ts`, the tests, stories, code comments, and this README were drafted with AI assistance and reviewed before merging.
