# @gitborlando/signal

A signal like event-bus for JavaScript/TypeScript.

## Features

- 🔍 **Test Coverage 100%** - 100% test coverage with 100% type safety
- 🎯 **TypeScript First** - Full type safety with excellent IDE support
- 📦 **Batch Updates** - Efficiently batch multiple signal updates
- 🎛️ **Orderable Hooks** - Advanced hook system with ordering control
- 🔄 **Signal Merging** - Combine multiple signals with intelligent triggering

## Installation

```bash
pnpm add @gitborlando/signal
```

## Quick Start

### Basic Usage

```typescript
import { Signal } from '@gitborlando/signal'

// variable name is event name
const countEvent = Signal.create(0)

const unHook = countEvent.hook((value, oldValue) => {
  console.log(`CountEvent: ${oldValue} → ${value}`)
})

countEvent.dispatch(1) // Logs: "CountEvent: 0 → 1"
countEvent.value = 2 // only set value, not trigger hook

unHook()
```

#### Alternative way in other event-emitter

```typescript
const em = new EventEmitter()

// value no type inferred, no old value
em.on('count', (value) => {})

// need manually handle event key
em.emit('count', 1)

em.off('count')
```

#### Specially in react, it is much more easier to use, for example:

with signal:

```typescript
const countEvent = Signal.create(0)

// no need to manually return a cleanup function
useEffect(() => {
  return countEvent.hook((value, oldValue) => {
    console.log(`CountEvent: ${oldValue} → ${value}`)
  })
}, [])
```

with event-emitter:

```typescript
const em = new EventEmitter()

useEffect(() => {
  em.on('count', (value) => {
    console.log(`CountEvent: ${value}`)
  })
  return () => {
    em.off('count')
  }
}, [])
```

### Batch Triggering

```typescript
const x = Signal.create(0)

sum.hook((value) => console.log(`Sum: ${value}`))

// Without batching: sum would be calculated twice
// With batching: sum is calculated only once
Signal.batch(() => {
  x.dispatch(1)
  x.dispatch(2)
  x.dispatch(3)
}) // Logs: "Sum: 3" (only once)
```

### Merge triggering

```typescript
const signal1 = Signal.create(1)
const signal2 = Signal.create(2)
const signal3 = Signal.create(3)

const merged = Signal.merge(signal1, signal2, signal3)

merged.hook(() => {
  console.log('All signals have been triggered!')
})

signal1.dispatch(10)
signal2.dispatch(20)
signal3.dispatch(30) // Now merged triggers
```

### Hook Ordering

```typescript
const signal = Signal.create(0)

// This runs last
signal.hook({ afterAll: true }, (value) => console.log('4. After all'))

// These run in registration order
signal.hook((value) => console.log('2. Normal hook'))
signal.hook((value) => console.log('3. Another normal hook'))

// This runs first
signal.hook({ beforeAll: true }, (value) => console.log('1. Before all'))

signal.dispatch(1)
// Output:
// 1. Before all
// 2. Normal hook
// 3. Another normal hook
// 4. After all
```

## API Reference

### Signal Class

#### `Signal.create<T>(value?: T): Signal<T>`

Creates a new signal instance.

```typescript
const signal = Signal.create(42)
const stringSignal = Signal.create('hello')
const boolSignal = Signal.create(true)
```

#### `signal.value: T`

Get or set the current value.

```typescript
const count = Signal.create(0)
console.log(count.value) // 0
count.value = 42
console.log(count.value) // 42
```

#### `signal.oldValue: T`

Get the previous value (read-only).

```typescript
const count = Signal.create(0)
count.dispatch(1)
console.log(count.oldValue) // 0
console.log(count.value) // 1
```

#### `signal.hook(callback): () => void`

Add a listener to the signal.

```typescript
const unHook = signal.hook((value, oldValue) => {
  console.log(`${oldValue} → ${value}`)
})

// Remove listener
unHook()
```

#### `signal.hook(options, callback): () => void`

Add a listener with options.

```typescript
signal.hook(
  {
    id: 'hookId', // Unique identifier for the hook
    immediately: true, // Execute immediately with current value
    once: true, // Execute only once
    beforeAll: true, // Execute before all other hooks
    afterAll: false, // Execute after all other hooks
    before: 'hookId', // Execute before specific hook
    after: 'hookId', // Execute after specific hook
  },
  (value) => {
    console.log('Hook executed:', value)
  }
)
```

#### `signal.dispatch(value?): void`

Update the signal value.

```typescript
// Set new value
signal.dispatch(42)

// Use function to access current value
signal.dispatch((currentValue) => {
  console.log('Current:', currentValue)
})
```

#### `signal.removeAll(): void`

Remove all listeners.

```typescript
signal.removeAll()
```

### Static Methods

#### `Signal.merge(...signals): Signal<void>`

Create a signal that triggers when all input signals have triggered at least once.

```typescript
const signal1 = Signal.create(1)
const signal2 = Signal.create(2)
const signal3 = Signal.create(3)

const merged = Signal.merge(signal1, signal2, signal3)

merged.hook(() => {
  console.log('All signals have been triggered!')
})

// All three need to trigger for merged to trigger
signal1.dispatch(10)
signal2.dispatch(20)
signal3.dispatch(30) // Now merged triggers
```

#### `Signal.batch(callback): void`

Batch multiple signal updates to avoid redundant calculations.

```typescript
const a = Signal.create(1)

sum.hook((value) => console.log('Sum:', value))

Signal.batch(() => {
  a.dispatch(1)
  a.dispatch(2)
  a.dispatch(3)
}) // sum is calculated only once: "Sum: 3"
```
