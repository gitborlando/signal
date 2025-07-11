import { Signal } from './signal'

export function iife<T>(fn: () => T): T {
  return fn()
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2)
}

const signalIdCache = createCache<Signal<any>, string>()

export function getSignalId(signal: Signal<any>) {
  return signalIdCache.getSet(signal, () => nanoid())
}

export function genObjectKeyByValues(obj: Record<string, any>) {
  const keys = Object.keys(obj).sort()

  const stringFy = (value: any) => {
    let result = ''
    try {
      result = JSON.stringify(value)
    } catch (error) {
      result = String(value)
    }
    return result
  }

  const values = keys.map((key) => stringFy(obj[key]))
  return values.join('-')
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
