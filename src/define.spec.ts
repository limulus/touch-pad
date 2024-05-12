import { afterEach, beforeEach, describe, expect, it, vi, MockInstance } from 'vitest'

import { TouchPad } from './lib/touch-pad.js'

describe('define', () => {
  let registry: Map<string, CustomElementConstructor>
  let mockCustomElementsDefine: MockInstance

  beforeEach(() => {
    registry = new Map<string, CustomElementConstructor>()
    mockCustomElementsDefine = vi
      .spyOn(customElements, 'define')
      .mockImplementation((name: string, klass: CustomElementConstructor) => {
        registry.set(name, klass)
      })
    vi.spyOn(customElements, 'get').mockImplementation(() => {
      return registry.get('touch-pad')
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.resetModules() // Doesn't currently work in vitest browser mode
  })

  it('should define the "touch-pad" element', async () => {
    await import('./define.js')
    expect(mockCustomElementsDefine).toHaveBeenCalledWith('touch-pad', TouchPad)
  })

  it('should not crash if a "touch-pad" element is already defined', async () => {
    registry.set('touch-pad', class FooBar extends HTMLElement {})
    // @ts-expect-error -- cache busting since vi.resetModules() doesn't work in browser mode
    await import('./define.js?1')
    expect(mockCustomElementsDefine).not.toHaveBeenCalled()
  })
})
