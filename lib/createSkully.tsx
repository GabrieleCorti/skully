import type { DynamicObject, ItemKeys } from "./utils";

export interface WithSkeletonProps {
  show?: boolean;
}

export function createSkully<T>(SkeletonComponent: React.FC<T>) {
  return function WithSkeleton<N extends number = 1>({
    children,
    show,
    count,
    ...rest
  }: React.PropsWithChildren<
    WithSkeletonProps &
      DynamicObject<N, React.ComponentProps<typeof SkeletonComponent>>
  >) {
    if (show) {
      return (
        <>
          {Array(count)
            .fill(null)
            .map((_, i) => {
              const propsArray = rest as DynamicObject<N, React.ComponentProps<typeof SkeletonComponent>>
              const props = propsArray[`item${i}` as ItemKeys<N>];
              return <SkeletonComponent key={i} {...props} />
            })}
        </>
      );
    }
    return children;
  };
}
