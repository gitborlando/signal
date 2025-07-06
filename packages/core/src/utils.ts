export function iife<T>(fn: () => T): T {
  return fn()
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2)
}

export function createCache<K, V>() {
  const map = new Map<K, V>()

  return {
    get: (key: K) => map.get(key),
    set: (key: K, value: V) => {
      map.set(key, value)
      return value
    },
    getSet: (key: K, factory: () => V) => {
      if (map.has(key)) {
        return map.get(key)!
      }
      const value = factory()
      map.set(key, value)
      return value
    },
    clear: () => map.clear(),
  }
}
// test change
