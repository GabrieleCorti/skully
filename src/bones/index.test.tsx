import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as bones from './index'
import styles from './skully.module.css'
import indexSource from './index.ts?raw'

describe('skully/bones entry', () => {
  it('exports exactly Line, Circle and Rect', () => {
    expect(Object.keys(bones).sort()).toEqual(['Circle', 'Line', 'Rect'])
  })

  it('stays server-safe: no "use client" directive and no import of the core', () => {
    expect(indexSource).not.toMatch(/^\s*['"]use client['"]/m)
    expect(`'use client'\n${indexSource}`).toMatch(/^\s*['"]use client['"]/m) // the check can fail
    expect(indexSource).not.toMatch(/from ['"]\.\.\/index['"]/)
  })

  it('gives each primitive the shared bone class plus a distinct shape class', () => {
    const { Line, Circle, Rect } = bones
    render(
      <>
        <Line data-testid="line" />
        <Circle data-testid="circle" />
        <Rect data-testid="rect" />
      </>,
    )
    const classes = ['line', 'circle', 'rect'].map((id) => screen.getByTestId(id).className)

    // CSS Modules must resolve to real class names, or these checks are meaningless.
    for (const key of ['bone', 'line', 'circle', 'rect'] as const) {
      expect(styles[key]).toBeTruthy()
    }
    expect(classes[0].split(' ')).toEqual([styles.bone, styles.line])
    expect(classes[1].split(' ')).toEqual([styles.bone, styles.circle])
    expect(classes[2].split(' ')).toEqual([styles.bone, styles.rect])
    expect(new Set(classes).size).toBe(3)
  })
})
