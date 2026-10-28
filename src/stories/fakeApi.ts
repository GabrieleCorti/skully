import { useEffect, useState } from 'react'
import type { User } from './UserCard'

export const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', bio: 'Wrote the first published algorithm for a machine.' },
  { id: 2, name: 'Grace Hopper', bio: 'Built the first compiler and popularised the word “bug”.' },
  { id: 3, name: 'Alan Turing', bio: 'Formalised computation and broke Enigma.' },
]

export const DELAY = 1200

export const nextUserId = (id: number) => (id % USERS.length) + 1

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const promises = new Map<string, Promise<User>>()

/** Cached fetch for `use()`. A new `nonce` forces a fresh request (and a new suspension). */
export function fetchUser(id: number, nonce = 0): Promise<User> {
  const key = `${id}:${nonce}`
  let promise = promises.get(key)
  if (!promise) {
    promise = wait(DELAY).then(() => USERS[id - 1])
    promises.set(key, promise)
  }
  return promise
}

export interface UserQuery {
  /** Last loaded user; may belong to a previous id while the next one loads. */
  data: User | undefined
  /** No data for the current id yet (like TanStack Query's `isPending` per key). */
  isPending: boolean
  /** Any request in flight, including background refetches. */
  isFetching: boolean
}

/** Minimal TanStack-Query-like hook that keeps previous data between ids. */
export function useUserQuery(id: number, refetchToken: number): UserQuery {
  // A request is in flight until the result for the current id + token has landed.
  const requestKey = `${id}:${refetchToken}`
  const [state, setState] = useState<{ data?: User; loadedKey?: string }>({})

  useEffect(() => {
    let cancelled = false
    wait(DELAY).then(() => {
      if (!cancelled) setState({ data: USERS[id - 1], loadedKey: requestKey })
    })
    return () => {
      cancelled = true
    }
  }, [id, requestKey])

  return {
    data: state.data,
    isPending: state.data?.id !== id,
    isFetching: state.loadedKey !== requestKey,
  }
}
