#!/usr/bin/env node
// PostToolUse hook: every visible string exists in both Locales (CONTEXT.md).
// A string added to one Dictionary and not the other is a bug, with no
// exceptions, so the parity test runs the moment content.js is written rather
// than waiting for CI on push.
import { execFileSync } from 'node:child_process'

const raw = await new Promise((resolve) => {
  let buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (d) => (buf += d))
  process.stdin.on('end', () => resolve(buf))
})

let input = {}
try {
  input = JSON.parse(raw || '{}')
} catch {
  process.exit(0)
}

const path = input?.tool_input?.file_path ?? ''
const normalised = path.split('\\').join('/')
if (!normalised.endsWith('src/data/content.js')) process.exit(0)

try {
  execFileSync('npx', ['vitest', 'run', 'src/data/content.test.js'], {
    cwd: input.cwd || process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`
  console.error(
    'Dictionary parity failed — a string exists in one Locale but not the ' +
      'other. Fix both Dictionaries in src/data/content.js before continuing.\n\n' +
      out.slice(-3000),
  )
  process.exit(2)
}
