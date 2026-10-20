// Every leaf path in a Dictionary, as dot/bracket notation:
// 'about.tags[0].label'. Array indices are part of the path so a Dictionary
// that drops a Project, a Group or a paragraph fails the parity tests too.
export function keyPaths(node, prefix = '') {
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
