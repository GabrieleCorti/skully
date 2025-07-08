export type Enumerate<N extends number, Acc extends number[] = []> =
  Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

export type ItemKeys<N extends number> = `item${Enumerate<N>}`;

export type DynamicObject<N extends number, T> = {
  count: N;
} & {
  [K in ItemKeys<N>]: T;
};