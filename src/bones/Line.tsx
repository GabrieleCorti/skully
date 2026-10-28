import type { ComponentProps } from 'react'
import { cx } from '../utils/cx'
import styles from './skully.module.css'

export type LineProps = ComponentProps<'span'>

/**
 * A text-line placeholder: full width and one line box (`1lh`) tall, with a centred 1em bar.
 * Give it the same typography as the text it replaces; set `width` with `className` and the bar
 * with `--sk-line-thickness`.
 */
export function Line({ className, ...props }: LineProps) {
  return <span aria-hidden="true" {...props} className={cx(styles.bone, styles.line, className)} />
}
