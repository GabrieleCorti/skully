import type { ComponentProps } from 'react'
import { cx } from '../utils/cx'
import styles from './skully.module.css'

export type RectProps = ComponentProps<'span'>

/** A block placeholder (images, media, cards): full width, 6em tall. Size it with `className`. */
export function Rect({ className, ...props }: RectProps) {
  return <span aria-hidden="true" {...props} className={cx(styles.bone, styles.rect, className)} />
}
