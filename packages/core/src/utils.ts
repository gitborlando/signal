import { createCache } from '@gitborlando/utils'
import { nanoid } from 'nanoid'
import { Signal } from './signal'

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
