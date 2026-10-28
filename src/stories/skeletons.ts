'use client'
import { createSkeleton } from '../index'
import { UserCardBones } from './UserCard'

export const { Skeleton: UserCardSkeleton, SuspenseSkeleton: UserCardSuspense } =
  createSkeleton(UserCardBones)
