/**
 * Event handler for touchpad-like input. The user can click (or touch) and drag on the
 * given element to emit events with the coordinates of the pointer relative to the element
 * and its size.
 */
export class TouchPad extends EventTarget implements EventListenerObject {
  private readonly element: HTMLElement
  private observedTouchId: number | null = null

  constructor(element: HTMLElement) {
    super()
    this.element = element
    this.element.addEventListener('mousedown', this)
    this.element.addEventListener('touchstart', this)
  }

  handleEvent(event: MouseEvent | TouchEvent) {
    if (event.target === this.element) {
      if (event instanceof MouseEvent && event.type === 'mousedown') {
        if (event.button !== 0) return
        this.element.ownerDocument!.addEventListener('mousemove', this)
        this.element.ownerDocument!.addEventListener('mouseup', this)
      } else if (
        self.TouchEvent &&
        event instanceof TouchEvent &&
        event.type === 'touchstart' &&
        this.observedTouchId === null
      ) {
        this.observedTouchId = event.changedTouches[0].identifier
        this.element.addEventListener('touchmove', this)
        this.element.addEventListener('touchend', this)
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
          this.element.removeEventListener('touchmove', this)
          this.element.removeEventListener('touchend', this)
          this.observedTouchId = null
        }
        break
      case 'mouseup':
        this.element.ownerDocument!.removeEventListener('mousemove', this)
        this.element.ownerDocument!.removeEventListener('mouseup', this)
        break
      default:
        throw new Error(`Unhandled event type: ${event.type}`)
    }
  }

  #emitEventFromMouse(event: MouseEvent) {
    event.preventDefault()
    this.dispatchEvent(new TouchPadMoveEvent(event, this.element))
  }

  #emitEventFromTouch(event: TouchEvent) {
    event.preventDefault()
    const touch = this.#observedTouchFromEvent(event)
    if (touch) {
      this.dispatchEvent(new TouchPadMoveEvent(event, this.element, touch))
    }
  }

  #observedTouchFromEvent(event: TouchEvent): Touch | undefined {
    return Array.from(event.changedTouches).find(
      (touch) => touch.identifier === this.observedTouchId
    )
  }

  /**
   * Disconnect this touchpad from the element it was attached to.
   */
  disconnect() {
    for (const event of [
      'mousedown',
      'mousemove',
      'mouseup',
      'touchstart',
      'touchmove',
      'touchend',
    ]) {
      this.element.removeEventListener(event, this)
      this.element.ownerDocument!.removeEventListener(event, this)
    }
  }
}

export class TouchPadMoveEvent extends CustomEvent<{ x: number; y: number }> {
  readonly target: HTMLElement
  readonly originalEvent: MouseEvent | TouchEvent

  constructor(event: MouseEvent | TouchEvent, target: HTMLElement, touch?: Touch) {
    let coords: { clientX: number; clientY: number }
    if (touch) {
      coords = touch
    } else if (event instanceof MouseEvent) {
      coords = event
    } else {
      throw new TypeError('Expected MouseEvent or TouchEvent')
    }

    const rect = target.getBoundingClientRect()
    const x = (coords.clientX - rect.left) / rect.width
    const y = (coords.clientY - rect.top) / rect.height

    super('touchpadmove', { detail: { x, y } })

    this.target = target
    this.originalEvent = event
  }
}
