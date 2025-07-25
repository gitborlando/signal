# G-Signal

A reactive signal library for JavaScript/TypeScript that provides fine-grained reactivity with powerful composition patterns.

## Features

🚀 **Lightweight & Fast** - Minimal overhead with maximum performance  
🔥 **Reactive Signals** - Fine-grained reactivity system  
🎯 **TypeScript First** - Full type safety with excellent IDE support  
🔗 **Signal Derivation** - Compose signals with automatic dependency tracking  
📦 **Batch Updates** - Efficiently batch multiple signal updates  
🎛️ **Flexible Hooks** - Advanced hook system with ordering and lifecycle control  
🛡️ **Interceptors** - Transform signal values before they're set  
🔄 **Signal Merging** - Combine multiple signals with intelligent triggering

## Installation

```bash
pnpm add g-signal
```

## Quick Start

### Basic Usage

```typescript
import { Signal } from 'g-signal'

// Create a signal
const count = Signal.create(0)

// Listen to changes
const unsubscribe = count.hook((value, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${value}`)
})

// Update the signal
count.dispatch(1) // Logs: "Count changed: 0 → 1"
count.value = 2 // Alternative way to set value

// Cleanup
unsubscribe()
```

### Derived Signals

```typescript
const firstName = Signal.create('John')
const lastName = Signal.create('Doe')

// Create a derived signal
const fullName = Signal.derive(firstName, lastName, (first, last) => {
  return `${first} ${last}`
})

fullName.hook((name) => console.log(`Full name: ${name}`))

firstName.dispatch('Jane') // Logs: "Full name: Jane Doe"
```

### Batch Updates

```typescript
const x = Signal.create(0)
const y = Signal.create(0)
const sum = Signal.derive(x, y, (a, b) => a + b)

sum.hook((value) => console.log(`Sum: ${value}`))

// Without batching: sum would be calculated twice
// With batching: sum is calculated only once
Signal.batch(() => {
  x.dispatch(5)
  y.dispatch(3)
}) // Logs: "Sum: 8" (only once)
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
const unsubscribe = signal.hook((value, oldValue) => {
  console.log(`${oldValue} → ${value}`)
})

// Remove listener
unsubscribe()
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
  },
)
```

#### `signal.dispatch(value?, args?): void`

Update the signal value.

```typescript
// Set new value
signal.dispatch(42)

// Use function to access current value
signal.dispatch((currentValue) => {
  console.log('Current:', currentValue)
})

// Pass additional arguments
signal.dispatch(42, { source: 'user-input' })
```

#### `signal.intercept(handler): void`

Intercept and transform values before they're set.

```typescript
const count = Signal.create(0)

// Prevent negative values
count.intercept((value) => {
  return value < 0 ? 0 : value
})

count.dispatch(-5)
console.log(count.value) // 0
```

#### `signal.removeAll(): void`

Remove all listeners.

```typescript
signal.removeAll()
```

### Static Methods

#### `Signal.derive(...signals, computeFn): Signal<Result>`

Create a derived signal from multiple source signals.

```typescript
const a = Signal.create(2)
const b = Signal.create(3)
const c = Signal.create(4)

const result = Signal.derive(a, b, c, (x, y, z) => x * y + z)
console.log(result.value) // 10

a.dispatch(5)
console.log(result.value) // 19
```

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
const b = Signal.create(2)
const sum = Signal.derive(a, b, (x, y) => x + y)

sum.hook((value) => console.log('Sum:', value))

Signal.batch(() => {
  a.dispatch(5)
  b.dispatch(10)
}) // sum is calculated only once: "Sum: 15"
```

## Advanced Usage

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

### Complex Derivations

```typescript
const users = Signal.create([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 },
])

const filter = Signal.create('')
const sortBy = Signal.create('name')

const filteredAndSorted = Signal.derive(
  users,
  filter,
  sortBy,
  (userList, filterText, sortField) => {
    return userList
      .filter((user) => user.name.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1))
  },
)

filteredAndSorted.hook((users) => {
  console.log('Filtered users:', users)
})

filter.dispatch('a') // Shows Alice and Charlie
sortBy.dispatch('age') // Re-sorts by age
```

### Error Handling

```typescript
const signal = Signal.create(0)

signal.hook((value, oldValue, args) => {
  try {
    // Your logic here
    console.log('Processing:', value)
  } catch (error) {
    console.error('Hook error:', error)
  }
})

// Interceptor with error handling
signal.intercept((value) => {
  if (typeof value !== 'number') {
    console.warn('Invalid value type, converting to number')
    return Number(value) || 0
  }
  return value
})
```

## Performance Tips

1. **Use batching** for multiple related updates
2. **Derive sparingly** - only when you need computed values
3. **Remove listeners** when no longer needed to prevent memory leaks
4. **Use interceptors** for validation/transformation at the source
5. **Leverage hook ordering** to optimize execution flow

## TypeScript Support

Full TypeScript support with generic type inference:

```typescript
// Type is inferred as Signal<number>
const count = Signal.create(42)

// Type is inferred as Signal<string>
const name = Signal.create('hello')

// Derived signal type is inferred
const doubled = Signal.derive(count, (x) => x * 2) // Signal<number>

// Custom types work seamlessly
interface User {
  id: number
  name: string
}

const user = Signal.create<User>({ id: 1, name: 'Alice' })
```

## License

MIT © G-Signal Team
