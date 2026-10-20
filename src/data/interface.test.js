import { describe, expect, it } from 'vitest'
import { interfaceStrings } from './interface'
import { keyPaths } from './keyPaths'

// The interface strings obey the same rule as the content: a string that
// exists in one Locale and not the other is a bug.
describe('Interface Dictionary parity', () => {
  const paths = Object.fromEntries(
    Object.entries(interfaceStrings).map(([lang, dict]) => [lang, new Set(keyPaths(dict))]),
  )

  it('has both Locales', () => {
    expect(Object.keys(interfaceStrings).sort()).toEqual(['en', 'fr'])
  })

  it.each([
    ['en', 'fr'],
    ['fr', 'en'],
  ])('every key in %s exists in %s', (a, b) => {
    const missing = [...paths[a]].filter((p) => !paths[b].has(p)).sort()
    expect(missing, `missing from the ${b} Dictionary: ${missing.join(', ')}`).toEqual([])
  })

  it('has no empty string', () => {
    for (const dict of Object.values(interfaceStrings)) {
      for (const path of keyPaths(dict)) {
        const value = path
          .replace(/\[(\d+)\]/g, '.$1')
          .split('.')
          .reduce((node, key) => node[key], dict)
        expect(String(value).trim(), path).not.toBe('')
      }
    }
  })
})
