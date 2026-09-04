import { describe, expect, it } from 'vitest'
import { locales } from './content'

// CONTEXT.md: "Every visible string exists in both; a string that exists in
// only one is a bug." Nothing enforced that until this test. It compares the
// two Dictionaries' key structures — not their values, which are translations
// and are meant to differ.

// Every leaf path in a Dictionary, as dot/bracket notation:
// 'about.tags[0].label'. Array indices are part of the path so a Dictionary
// that drops a Project, a Group or a paragraph fails too.
function keyPaths(node, prefix = '') {
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => keyPaths(item, `${prefix}[${i}]`))
  }
  if (node && typeof node === 'object') {
    return Object.keys(node).flatMap((key) =>
      keyPaths(node[key], prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

describe('Dictionary parity', () => {
  const paths = Object.fromEntries(
    Object.entries(locales).map(([lang, dict]) => [lang, new Set(keyPaths(dict))]),
  )

  it('has both Locales', () => {
    expect(Object.keys(locales).sort()).toEqual(['en', 'fr'])
  })

  it.each([
    ['en', 'fr'],
    ['fr', 'en'],
  ])('every key in %s exists in %s', (a, b) => {
    const missing = [...paths[a]].filter((p) => !paths[b].has(p)).sort()
    expect(missing, `missing from the ${b} Dictionary: ${missing.join(', ')}`).toEqual([])
  })
})

describe('keyPaths', () => {
  it('names nested and indexed leaves', () => {
    expect(keyPaths({ a: { b: 1 }, c: [{ d: 2 }, 'e'] })).toEqual([
      'a.b',
      'c[0].d',
      'c[1]',
    ])
  })
})
