'use client'
import { createSkeleton, renameProps } from '../index'
import { BadgeCardBones } from './BadgeCardBones'

// BadgeCardBones declares its own `label` (the ribbon text), which skully reserves for the
// hidden status text. renameProps exposes it as `badge` instead. Renaming the prop in the
// bones, or writing a small wrapper, would work just as well.
export const { Skeleton: BadgeCardSkeleton, SuspenseSkeleton: BadgeCardSuspense } = createSkeleton(
  renameProps(BadgeCardBones, { label: 'badge' }),
)
