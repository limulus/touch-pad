import { TouchPadMoveEvent } from './TouchPadMoveEvent'

/**
 * Event processor for touchpad-like input. The user can click (or touch) and drag on the
 * given element to emit events with the coordinates of the pointer relative to the element
 * and its size.
 */
export class TouchPadEventProcessor implements EventListenerObject {
  private readonly source: HTMLElement
  private readonly target: EventTarget
  private observedTouchId: number | null = null

  constructor(source: HTMLElement, target: EventTarget = source) {
    this.source = source
    this.target = target
  }

  handleEvent(event: MouseEvent | TouchEvent) {
    if (event.target === this.source) {
      if (event instanceof MouseEvent && event.type === 'mousedown') {
        if (event.button !== 0) return
        this.source.ownerDocument!.addEventListener('mousemove', this)
        this.source.ownerDocument!.addEventListener('mouseup', this)
      } else if (
        self.TouchEvent &&
        event instanceof TouchEvent &&
        event.type === 'touchstart' &&
        this.observedTouchId === null
      ) {
        this.observedTouchId = event.changedTouches[0].identifier
        this.source.addEventListener('touchmove', this)
        this.source.addEventListener('touchend', this)
      }
    }

    switch (event.type) {
      case 'touchstart':
      case 'touchmove':
        this.#emitEventFromTouch(event as TouchEvent)
        break
      case 'mousedown':
      case 'mousemove':
        this.#emitEventFromMouse(event as MouseEvent)
        break
      case 'touchend':
        if (this.#observedTouchFromEvent(event as TouchEvent)) {
          this.source.removeEventListener('touchmove', this)
          this.source.removeEventListener('touchend', this)
          this.observedTouchId = null
        }
        break
      case 'mouseup':
        this.source.ownerDocument!.removeEventListener('mousemove', this)
        this.source.ownerDocument!.removeEventListener('mouseup', this)
        break
      default:
        throw new Error(`Unhandled event type: ${event.type}`)
    }
  }

  #emitEventFromMouse(event: MouseEvent) {
    event.preventDefault()
    this.target.dispatchEvent(new TouchPadMoveEvent(event, this.source))
  }

  #emitEventFromTouch(event: TouchEvent) {
    event.preventDefault()
    const touch = this.#observedTouchFromEvent(event)
    if (touch) {
      this.target.dispatchEvent(new TouchPadMoveEvent(event, this.source, touch))
    }
  }

  #observedTouchFromEvent(event: TouchEvent): Touch | undefined {
    return Array.from(event.changedTouches).find(
      (touch) => touch.identifier === this.observedTouchId
    )
  }

  /**
   * Start listening on the `source` and dispatching events on the `target`.
   */
  listen() {
    this.source.addEventListener('mousedown', this)
    this.source.addEventListener('touchstart', this)
  }

  /**
   * Stop listening on the `source`.
   */
  unlisten() {
    for (const event of [
      'mousedown',
      'mousemove',
      'mouseup',
      'touchstart',
      'touchmove',
      'touchend',
    ]) {
      this.source.removeEventListener(event, this)
      this.source.ownerDocument!.removeEventListener(event, this)
    }
  }
}
