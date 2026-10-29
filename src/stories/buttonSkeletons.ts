'use client'
import { createSkeleton, renameProps } from '../index'
import { ButtonBones } from './ButtonBones'

// ButtonBones declares its own `isLoading` (draws a spinner), which skully reserves.
// renameProps exposes it as `busy` instead. Renaming the prop in the bones, or writing a
// small wrapper, would work just as well.
export const { Skeleton: ButtonSkeleton } = createSkeleton(
  renameProps(ButtonBones, { isLoading: 'busy' }),
)
