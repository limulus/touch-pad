import { TouchPad } from './index.js'
export * from './index.js'

if (!customElements.get('touch-pad')) {
  customElements.define('touch-pad', TouchPad)
}
