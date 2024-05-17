/**
 * Event emitted when the user drags the pointer or touch on the element.
 */
export class TouchPadMoveEvent extends CustomEvent<TouchPadMoveEventDetails> {
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

    super('touchpadmove', { bubbles: true, composed: true, detail: { x, y } })

    this.target = target
    this.originalEvent = event
  }
}

export interface TouchPadMoveEventDetails {
  /**
   * The horizontal position of the pointer or touch relative to the width of the element.
   */
  x: number

  /**
   * The vertical position of the pointer or touch relative to the height of the element.
   */
  y: number
}
