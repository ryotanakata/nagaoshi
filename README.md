# nagaoshi - 長押し -

**Simple** | **Robust** | **Universal** | **Vanilla-Friendly** | **Prototype-Ready**

A lightweight utility for handling long press events in JavaScript.

![Nagaoshi Demo: Long-press for continuous increment and decrement and reset](https://github.com/ryotanakata/nagaoshi/raw/main/docs/assets/demo.gif)

### Using the nagaoshi function

```html
<button>Press and hold me</button>

<script type="module">
  import { nagaoshi } from "nagaoshi";

  const button = document.querySelector("button");

  const option = {
    interval: 100,
    delay: 500,
    onStart: () => console.log("Long press started"),
    onFinish: () => console.log("Long press finished"),
    onCancel: () => console.log("Long press cancelled"),
  };

  const action = () => {
    console.log("Long press detected!");
  };

  nagaoshi(button, action, option);
</script>
```

### Using the custom 'nagaoshi' event

```html
<button>Press and hold me</button>

<script type="module">
  import { nagaoshi } from "nagaoshi";

  const button = document.querySelector("button");

  button.addEventListener("nagaoshi", () => {
    console.log("Long press detected via custom event!");
  });
</script>
```

## Install

### npm

```
npm install nagaoshi
```

### yarn

```
yarn add nagaoshi
```

### pnpm

```
pnpm add nagaoshi
```

### CDN

```html
<script src="https://unpkg.com/nagaoshi@1.0.0/dist/index.js"></script>
```

## Document

### Arguments

| Argument | Type            | Default  | Description                                |
| -------- | --------------- | -------- | ------------------------------------------ |
| element  | HTMLElement     | -        | The element to set the long press event on |
| action   | Function        | () => {} | The action to execute on long press        |
| options  | NagaoshiOptions | {}       | Optional configuration object              |

### Options

| Option   | Type     | Default   | Description                                                          |
| -------- | -------- | --------- | -------------------------------------------------------------------- |
| interval | number   | 75        | The interval (in ms) between each action execution during long press |
| delay    | number   | 1000      | The delay (in ms) before long press is triggered                     |
| onStart  | Function | undefined | Callback function when long press starts                             |
| onFinish | Function | undefined | Callback function when long press finishes                           |
| onCancel | Function | undefined | Callback function when long press is cancelled                       |

### Interactive Content Detection

The `nagaoshi` utility automatically detects interactive content in the DOM. It searches for elements that match the following criteria:

- `a[href]`: Links with href attributes
- `button`: Button elements
- `details`: Details elements
- `embed`: Embed elements
- `iframe`: Iframe elements
- `label`: Label elements
- `select`: Select elements
- `textarea`: Textarea elements
- `audio[controls]`: Audio elements with controls
- `video[controls]`: Video elements with controls
- `img[usemap]`: Images with usemap attributes
- `input:not([type="hidden"])`: All input elements except hidden inputs

When these elements are detected, the `nagaoshi` functionality is automatically applied, allowing you to use the custom 'nagaoshi' event listener without explicitly calling the `nagaoshi` function.

## Example

### Basic Usage

```javascript
import { nagaoshi } from "nagaoshi";

const button = document.querySelector("button");

nagaoshi(button, () => {
  console.log("Long press detected!");
});
```

### With Options

```javascript
import { nagaoshi } from "nagaoshi";

const button = document.querySelector("button");

nagaoshi(
  button,
  () => {
    console.log("Long press action");
  },
  {
    interval: 100,
    delay: 500,
    onStart: () => console.log("Long press started"),
    onFinish: () => console.log("Long press finished"),
    onCancel: () => console.log("Long press cancelled"),
  }
);
```

### Using Custom Event

```javascript
const button = document.querySelector("button");

button.addEventListener("nagaoshi", () => {
  console.log("Long press detected via custom event!");
});
```

### Cleanup

The `nagaoshi` function returns a cleanup function that removes all event listeners:

```javascript
const cleanup = nagaoshi(button, () => {
  console.log("Long press detected!");
});

// Later, when you want to remove the long press functionality:
cleanup();
```

### TypeScript Support

```typescript
import { nagaoshi, NagaoshiOptions } from "nagaoshi";

const button = document.querySelector("button") as HTMLElement;

const options: NagaoshiOptions = {
  interval: 100,
  delay: 500,
  onStart: () => console.log("Long press started"),
  onFinish: () => console.log("Long press finished"),
  onCancel: () => console.log("Long press cancelled"),
};

nagaoshi(
  button,
  () => {
    console.log("Long press detected!");
  },
  options
);
```

## Styling with aria-pressed

The `nagaoshi` utility automatically sets the `aria-pressed` attribute on the target element during a long press. This allows you to style the element based on its pressed state, enhancing both visual feedback and accessibility.

Example CSS:

```css
button[aria-pressed="true"] {
  background-color: #4caf50;
  color: white;
}
```

### Keyboard Support

The `nagaoshi` utility also supports keyboard events for accessibility:

```javascript
import { nagaoshi } from "nagaoshi";

const button = document.querySelector("button");

nagaoshi(button, () => {
  console.log("Long press or key hold detected!");
});
```

Users can trigger the long press action by holding down the Enter or Space key.

## Features

- Two ways to use: explicit `nagaoshi` function call or custom 'nagaoshi' event listener
- Automatic detection of interactive elements
- Supports both pointer and keyboard events for accessibility
- Customizable delay and interval for long press detection
- Provides callbacks for start, finish, and cancel events
- TypeScript support
- Cleanup function for easy removal of event listeners
- Uses `aria-pressed` attribute for styling and accessibility

## Browser Support

This utility uses modern JavaScript features and should work in all contemporary browsers. For older browsers, you may need to use appropriate polyfills or transpile the code.
