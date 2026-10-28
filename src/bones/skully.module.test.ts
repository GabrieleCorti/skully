import { describe, expect, it } from 'vitest'
import rawCss from './skully.module.css?raw'

// Contract checks on the stylesheet source. jsdom does no layout, so these assert
// on meaningful tokens in the CSS rather than computed styles.
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, '')

/** Returns the body of the block opened by the first match of `prelude`, braces balanced. */
function blockBody(source: string, prelude: RegExp): { body: string; start: number; end: number } {
  const match = prelude.exec(source)
  if (!match) throw new Error(`No block matching ${prelude}`)
  const open = source.indexOf('{', match.index + match[0].length - 1)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) {
      return { body: source.slice(open + 1, i), start: match.index, end: i + 1 }
    }
  }
  throw new Error(`Unbalanced block for ${prelude}`)
}

/** Declaration bodies of every innermost rule whose selector list includes `selector`. */
function rulesFor(source: string, selector: string): string[] {
  const bodies: string[] = []
  for (const [, prelude, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = prelude.split(',').map((s) => s.trim())
    if (selectors.includes(selector)) bodies.push(body)
  }
  return bodies
}

const layer = blockBody(css, /@layer\s+skully\s*\{/)

describe('skully.module.css contract', () => {
  it('puts every rule inside @layer skully', () => {
    const outside = css.slice(0, layer.start) + css.slice(layer.end)
    expect(outside.trim()).toBe('')
    expect(layer.body).toMatch(/\.bone\s*\{/)
  })

  it('sizes .line to one line box with 1lh', () => {
    const [line] = rulesFor(layer.body, '.line')
    expect(line).toBeDefined()
    expect(line).toMatch(/height\s*:\s*1lh\s*;/)
  })

  it('draws the Line bar with .line::before, sized by --sk-line-thickness', () => {
    const before = rulesFor(layer.body, '.line::before')
    expect(before.length).toBeGreaterThan(0)
    expect(before.join('\n')).toMatch(/content\s*:/)
    expect(before.join('\n')).toMatch(/var\(\s*--sk-line-thickness\b/)
  })

  it('derives default colours from currentColor and keeps them overridable', () => {
    expect(layer.body).toMatch(/var\(\s*--sk-color\s*,\s*color-mix\([^)]*currentColor[^)]*\)/)
    expect(layer.body).toMatch(/var\(\s*--sk-highlight\s*,\s*color-mix\([^)]*currentColor[^)]*\)/)
  })

  it('paints circle, rect and the line bar (not the line box) with the shimmer', () => {
    for (const selector of ['.circle', '.rect', '.line::before']) {
      expect(
        rulesFor(layer.body, selector).some((body) => /animation\s*:[^;]*shimmer/.test(body)),
        selector,
      ).toBe(true)
    }
    expect(rulesFor(layer.body, '.line').join('\n')).not.toMatch(/background|animation/)
  })

  it('disables animation on every painted surface under reduced motion', () => {
    const media = blockBody(
      layer.body,
      /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/,
    )
    for (const selector of ['.circle', '.rect', '.line::before']) {
      expect(
        rulesFor(media.body, selector).some((body) => /animation\s*:\s*none\b/.test(body)),
        selector,
      ).toBe(true)
    }
  })
})
