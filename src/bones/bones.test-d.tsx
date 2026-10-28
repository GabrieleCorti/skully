import { createRef } from 'react'
import { describe, expectTypeOf, it } from 'vitest'
import { Circle, Line, Rect, type CircleProps, type LineProps, type RectProps } from './index'

describe('bones prop types', () => {
  it('accept className, ref and native span props', () => {
    expectTypeOf<LineProps['className']>().toEqualTypeOf<string | undefined>()
    const ref = createRef<HTMLSpanElement>()
    void (<Line className="w-1/2" ref={ref} id="l" title="t" onClick={() => {}} />)
    void (<Circle className="avatar" ref={ref} aria-hidden={false} data-testid="c" />)
    void (<Rect className="media" ref={ref} role="presentation" />)
    expectTypeOf<CircleProps>().toEqualTypeOf<LineProps>()
    expectTypeOf<RectProps>().toEqualTypeOf<LineProps>()
  })

  it('reject unknown props', () => {
    // @ts-expect-error unknown prop
    void (<Line variant="wide" />)
    // @ts-expect-error unknown prop
    void (<Circle size={40} />)
    // @ts-expect-error unknown prop
    void (<Rect lines={3} />)
  })
})
