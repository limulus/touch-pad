import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { TouchPadMoveEvent } from './TouchPadMoveEvent.js'
import { TouchPad } from './touch-pad.js'

describe('TouchPad', () => {
  beforeAll(async () => {
    await import('./touch-pad.js')
  })

  let container: HTMLDivElement
  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = /* html */ `
      <touch-pad>
        <canvas width="100" height="100"></canvas>
      </touch-pad>
      <style>
        touch-pad { display: flex }
      </style>
    `
    container.style.width = '100px'
    container.style.height = '100px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('when put into the document', () => {
    it('should emit a "touchpad" event when dragged on', () => {
      const touchPadMoveEvents: TouchPadMoveEvent[] = []
      const touchPad = document.querySelector('touch-pad') as TouchPad
      touchPad.addEventListener('touchpadmove', (event) => {
        touchPadMoveEvents.push(event as TouchPadMoveEvent)
      })

      const canvas = touchPad.querySelector('canvas') as HTMLCanvasElement

      const event = new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true })
      canvas.dispatchEvent(event)

      const event2 = new MouseEvent('mousemove', {
        clientX: 20,
        clientY: 20,
        bubbles: true,
      })
      canvas.dispatchEvent(event2)

      const event3 = new MouseEvent('mouseup', { clientX: 20, clientY: 20, bubbles: true })
      canvas.dispatchEvent(event3)

      expect(touchPadMoveEvents).toHaveLength(1)
      expect(touchPadMoveEvents[0].detail).toEqual({ x: 0.1, y: 0.1 })
      expect(touchPadMoveEvents[0].target).toBe(touchPad)
    })

    it('should stop emitting "touchpadmove" events when the element is removed', () => {
      const touchPadMoveEvents: TouchPadMoveEvent[] = []
      const touchPad = document.querySelector('touch-pad') as TouchPad
      touchPad.addEventListener('touchpadmove', (event) => {
        touchPadMoveEvents.push(event as TouchPadMoveEvent)
      })

      touchPad.remove()

      const canvas = touchPad.querySelector('canvas') as HTMLCanvasElement

      const event = new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true })
      canvas.dispatchEvent(event)

      const event2 = new MouseEvent('mousemove', {
        clientX: 20,
        clientY: 20,
        bubbles: true,
      })
      canvas.dispatchEvent(event2)

      const event3 = new MouseEvent('mouseup', { clientX: 20, clientY: 20, bubbles: true })
      canvas.dispatchEvent(event3)

      expect(touchPadMoveEvents).toHaveLength(0)
    })
  })
})
