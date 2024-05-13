# touch-pad

Track drags and touches on an element, a bit like a touchpad or trackpad.

## Demo

The best way to understand how `touch-pad` works is to [try it]. Or check out the video below.

[try it]: https://limulus.net/penumbra/journal/005-ray-sphere-interactions/#demo

<details>
  <summary>Video Demo</summary>
  <video src="https://github.com/limulus/touch-pad/assets/609858/95624937-b0b0-4f22-ac14-b46465a37e74" autoplay loop muted inline width="720" height="405"></video>
</details>

## Installation

```sh
npm install touch-pad
```

## Usage

This package provides a web component and an event processor class. In both cases
`TouchPadMoveEvent`s are emitted when the user drags or touches the element. The event
`detail` property contains an `x` and `y` property with the current position of the touch or
drag relative to the top left corner of the element as a fraction of the element's width and
height.

### As a Web Component

```javascript
import 'touch-pad/define'
```

The `touch-pad/define` module automatically registers the `touch-pad` custom element. You
can now use it in your HTML.

```html
<touch-pad>
  <interactive-element><interactive-element>
</touch-pad>
```

If you prefer to do your own registration, you can instead `import { TouchPad } from
'touch-pad'` to get the class.

Now you can listen for `touchpadmove` events on the `touch-pad` element (or on its
ancestors).

```javascript
document.querySelector('touch-pad').addEventListener('touchpadmove', (event) => {
  console.log(event.detail)
})
```

### As a Class

```javascript
import { TouchPadEventProcessor } from 'touch-pad'
```

```javascript
const eventProcessor = new TouchPadEventProcessor(
  document.querySelector('interactive-element')
)
eventProcessor.listen()
```

The `<interactive-element>` will now emit `touchpadmove` events when the user drags or
touches it.

```javascript
document.querySelector('interactive-element').addEventListener('touchpadmove', (event) => {
  console.log(event.detail)
})
```

If do not want your element to emit `touchpadmove` events into the DOM, you can specify an `EventTarget` as the second argument to the constructor.

```javascript
const touchMoveTarget = new EventTarget()
touchMoveTarget.addEventListener('touchpadmove', (event) => {
  console.log(event.detail)
})

const eventProcessor = new TouchPadEventProcessor(
  document.querySelector('interactive-element'),
  touchMoveTarget
)
eventProcessor.listen()
```

#### Cleanup

If the source element is removed from the DOM, you should call `eventProcessor.unlisten()`
to stop listening for events. Failure to do so may result in memory leaks, since it adds
event listeners to the element’s document. This is not necessary for the web component usage
pattern where this is handled for you.
