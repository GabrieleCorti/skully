'use client'
import { createSkeleton } from '../index'
import { BadgeCardBones } from './BadgeCardBones'

// BadgeCardBones declares its own `label` (the ribbon text). skully's hidden status text is
// `loadingLabel`, so `label` is an ordinary bones prop and is forwarded as is.
export const { Skeleton: BadgeCardSkeleton, SuspenseSkeleton: BadgeCardSuspense } =
  createSkeleton(BadgeCardBones)
