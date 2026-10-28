import type { ComponentProps } from 'react'
import { cx } from '../utils/cx'
import styles from './skully.module.css'

export type CircleProps = ComponentProps<'span'>

/** A round placeholder (avatars, icons): 2.5em by default. Size it with `className`. */
export function Circle({ className, ...props }: CircleProps) {
  return (
    <span aria-hidden="true" {...props} className={cx(styles.bone, styles.circle, className)} />
  )
}
