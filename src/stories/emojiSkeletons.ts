'use client'
import { createSkeleton } from '../index'
import { EmojiStripBones } from './EmojiStripBones'

export const { Skeleton: EmojiSkeleton, SuspenseSkeleton: EmojiSuspense } =
  createSkeleton(EmojiStripBones)
