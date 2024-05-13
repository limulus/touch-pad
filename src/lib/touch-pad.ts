import { TouchPadEventProcessor } from './TouchPadEventProcessor.js'

/**
 * A web component that processes pointer and touch events and produces `touchpadmove`
 * events that track the movement of the pointer/finger in relation to the center of the
 * element.
 */
export class TouchPad extends HTMLElement {
  private readonly eventProcessor: TouchPadEventProcessor

  constructor() {
    super()
    this.eventProcessor = new TouchPadEventProcessor(this)
  }

  connectedCallback() {
    this.eventProcessor.listen()
  }

  disconnectedCallback() {
    this.eventProcessor.unlisten()
  }
}
