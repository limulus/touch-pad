import { describe, expect, it, beforeEach, afterEach } from 'vitest'

import { TouchPadEventProcessor } from './TouchPadEventProcessor.js'
import { TouchPadMoveEvent } from './TouchPadMoveEvent.js'

describe('TouchPad', () => {
  let target: HTMLDivElement
  let targetChild: HTMLDivElement
  let touchPad: TouchPadEventProcessor

  beforeEach(() => {
    target = document.createElement('div')
    target.appendChild((targetChild = document.createElement('div')))
    target.style.position = 'absolute'
    target.style.top = '20px'
    target.style.left = '20px'
    target.style.width = '100px'
    target.style.height = '100px'
    document.body.appendChild(target)
    touchPad = new TouchPadEventProcessor(target)
    touchPad.listen()
  })

  afterEach(() => {
    target.remove()
    touchPad.unlisten()
  })

  describe('when attached element is clicked and dragged on', () => {
    it('should emit events with every movement of the mouse', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const rect = target.getBoundingClientRect()
      targetChild.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + rect.left,
          clientY: 10 + rect.top,
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 30 + rect.left,
          clientY: 30 + rect.top,
          bubbles: true,
        })
      )

      expect(events.length).toBe(3)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: 20 / 100, y: 20 / 100 })
    })

    it('should continue moving when mouse leaves the element', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const rect = target.getBoundingClientRect()
      target.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + rect.left,
          clientY: 10 + rect.top,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mouseleave', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          bubbles: true,
        })
      )
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 2, clientY: 2 }))
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 2, clientY: 2 }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5 }))

      expect(events.length).toBe(4)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: -10 / 100, y: -10 / 100 })
      expect(events[3].detail).toEqual({ x: -(20 - 2) / 100, y: -(20 - 2) / 100 })
    })
  })

  describe('when attached element is touched and dragged on', () => {
    it('should emit events with every movement of the touch', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const identifier = genId()

      targetChild.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [createTouch(identifier, targetChild, 0, 0)],
          changedTouches: [createTouch(identifier, targetChild, 0, 0)],
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [createTouch(identifier, targetChild, 10, 10)],
          changedTouches: [createTouch(identifier, targetChild, 10, 10)],
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [createTouch(identifier, targetChild, 20, 20)],
          changedTouches: [createTouch(identifier, targetChild, 20, 20)],
          bubbles: true,
        })
      )
      targetChild.dispatchEvent(
        new TouchEvent('touchend', {
          touches: [createTouch(identifier, targetChild, 20, 20)],
          changedTouches: [createTouch(identifier, targetChild, 20, 20)],
          bubbles: true,
        })
      )

      expect(events.length).toBe(3)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: 20 / 100, y: 20 / 100 })
    })

    it('should only respond to the touch that started on the element', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const touch1 = genId()
      const touch2 = genId()

      target.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [createTouch(touch1, target, 0, 0), createTouch(touch2, target, 5, 5)],
          changedTouches: [
            createTouch(touch1, target, 0, 0),
            createTouch(touch2, target, 5, 5),
          ],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            createTouch(touch1, target, 10, 10),
            createTouch(touch2, target, 15, 15),
          ],
          changedTouches: [
            createTouch(touch1, target, 10, 10),
            createTouch(touch2, target, 15, 15),
          ],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 15, 15),
          ],
          changedTouches: [createTouch(touch1, target, 20, 20)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 25, 25),
          ],
          changedTouches: [createTouch(touch2, target, 25, 25)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchend', {
          touches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 25, 25),
          ],
          changedTouches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 25, 25),
          ],
        })
      )

      expect(events.length).toBe(3)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: 20 / 100, y: 20 / 100 })
    })

    it('should not change which touch it is following when another touch is started', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const touch1 = genId()
      const touch2 = genId()

      target.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [createTouch(touch1, target, 0, 0)],
          changedTouches: [createTouch(touch1, target, 0, 0)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [createTouch(touch1, target, 10, 10)],
          changedTouches: [createTouch(touch1, target, 10, 10)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [createTouch(touch1, target, 10, 10), createTouch(touch2, target, 5, 5)],
          changedTouches: [createTouch(touch2, target, 5, 5)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 15, 15),
          ],
          changedTouches: [createTouch(touch1, target, 20, 20)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchend', {
          touches: [
            createTouch(touch1, target, 20, 20),
            createTouch(touch2, target, 15, 15),
          ],
          changedTouches: [createTouch(touch1, target, 20, 20)],
        })
      )

      expect(events.length).toBe(3)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: 20 / 100, y: 20 / 100 })
    })

    it('should not stop following initial touch when another touch is ended', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const touch1 = genId()
      const touch2 = genId()

      target.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [createTouch(touch1, target, 0, 0), createTouch(touch2, target, 5, 5)],
          changedTouches: [
            createTouch(touch1, target, 0, 0),
            createTouch(touch2, target, 5, 5),
          ],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [createTouch(touch1, target, 10, 10), createTouch(touch2, target, 5, 5)],
          changedTouches: [createTouch(touch1, target, 10, 10)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchend', {
          touches: [createTouch(touch1, target, 10, 10), createTouch(touch2, target, 5, 5)],
          changedTouches: [createTouch(touch2, target, 5, 5)],
        })
      )
      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [createTouch(touch1, target, 20, 20)],
          changedTouches: [createTouch(touch1, target, 20, 20)],
        })
      )

      expect(events.length).toBe(3)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
      expect(events[2].detail).toEqual({ x: 20 / 100, y: 20 / 100 })
    })
  })

  it('should not trigger mouse events when attached element has not been clicked', () => {
    const events: TouchPadMoveEvent[] = []
    target.addEventListener('touchpadmove', (event) => {
      events.push(event as TouchPadMoveEvent)
    })

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20 }))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 20, clientY: 20 }))

    target.dispatchEvent(
      new MouseEvent('mouseup', {
        clientX: 0,
        clientY: 0,
        bubbles: true,
      })
    )
    target.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 10,
        clientY: 10,
        bubbles: true,
      })
    )

    expect(events.length).toBe(0)
  })

  describe('when attached element is right clicked', () => {
    it('should not emit events', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const rect = target.getBoundingClientRect()
      target.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          button: 2,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + rect.left,
          clientY: 10 + rect.top,
          button: 2,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          button: 2,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          button: 2,
          bubbles: true,
        })
      )

      expect(events.length).toBe(0)
    })
  })

  describe('when the source element is inside a shadow root', () => {
    beforeEach(() => {
      target.remove()
      const container = document.createElement('custom-element')
      document.body.appendChild(container)
      container.attachShadow({ mode: 'open' })
      container.shadowRoot!.appendChild(target)
    })

    it('should emit events beyond the shadow root', () => {
      const events: TouchPadMoveEvent[] = []
      document.body.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const rect = target.getBoundingClientRect()
      targetChild.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          bubbles: true,
          composed: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + rect.left,
          clientY: 10 + rect.top,
          bubbles: true,
          composed: true,
        })
      )
      targetChild.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          bubbles: true,
        })
      )

      expect(events.length).toBe(2)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
    })
  })

  describe('unlisten()', () => {
    it('should cause it to stop emitting events', () => {
      const events: TouchPadMoveEvent[] = []
      target.addEventListener('touchpadmove', (event) => {
        events.push(event as TouchPadMoveEvent)
      })

      const rect = target.getBoundingClientRect()
      target.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 0 + rect.left,
          clientY: 0 + rect.top,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + rect.left,
          clientY: 10 + rect.top,
          bubbles: true,
        })
      )
      touchPad.unlisten()
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          bubbles: true,
        })
      )
      target.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 20 + rect.left,
          clientY: 20 + rect.top,
          bubbles: true,
        })
      )

      expect(events.length).toBe(2)
      expect(events[0].detail).toEqual({ x: 0, y: 0 })
      expect(events[1].detail).toEqual({ x: 10 / 100, y: 10 / 100 })
    })
  })
})

const genId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

const createTouch = (identifier: number, target: HTMLElement, x: number, y: number) => {
  const rect = (target as HTMLElement).getBoundingClientRect()
  return new Touch({
    identifier,
    target,
    clientX: x + rect.left,
    clientY: y + rect.top,
  })
}
