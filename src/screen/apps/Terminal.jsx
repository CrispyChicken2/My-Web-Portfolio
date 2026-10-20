import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../i18n'
import { interfaceStrings } from '../../data/interface'
import { social } from '../../data/content'
import { Glyph } from '../glyphs'

// A terminal, PowerShell-style, that answers from the portfolio's own
// content. Typing in it presses the keys of the keyboard on the desk.

const PROMPT = String.raw`PS C:\Users\oscar>`
const COMMANDS = ['whoami', 'about', 'skills', 'projects', 'open', 'experience', 'contact', 'lang', 'clear']

// Each command returns lines; a line is a string or { text, tone }.
function run(input, { t, ui, setLang, openApp }) {
  const [command, ...args] = input.trim().split(/\s+/)
  const s = ui.terminal
  switch ((command ?? '').toLowerCase()) {
    case '':
      return []
    case 'help':
      return [
        { text: s.helpTitle, tone: 'head' },
        ...COMMANDS.map((name) => ({ text: `  ${name.padEnd(12)}${s.commands[name]}`, tone: 'dim' })),
      ]
    case 'whoami':
      return [{ text: t.meta.title, tone: 'head' }, t.profile.available]
    case 'about':
      return [{ text: t.about.heading, tone: 'head' }, ...t.about.paragraphs, '', ...t.about.tags.map((tag) => `  · ${tag.label}`)]
    case 'skills':
      return t.skills.groups.flatMap((group) => [
        { text: group.group, tone: 'head' },
        { text: `  ${group.items.join('  ')}`, tone: 'dim' },
      ])
    case 'projects':
      return [
        { text: t.projects.heading, tone: 'head' },
        ...t.projects.items.flatMap((project, index) => [
          `  ${String(index + 1).padStart(2, '0')}  ${project.title}`,
          { text: `      ${project.category}`, tone: 'dim' },
        ]),
      ]
    case 'open': {
      const index = Number.parseInt(args[0], 10) - 1
      const project = t.projects.items[index]
      if (!project) return [{ text: s.openUsage.replace('{total}', String(t.projects.items.length)), tone: 'error' }]
      window.open(project.github, '_blank', 'noopener,noreferrer')
      return [s.opening.replace('{title}', project.title)]
    }
    case 'experience':
      return t.experience.items.flatMap((item) => [
        { text: `${item.role} — ${item.org}`, tone: 'head' },
        { text: `  ${item.period}`, tone: 'dim' },
      ])
    case 'contact':
      openApp('portfolio', { page: 'contact' })
      return [`  email     ${social.email}`, `  github    ${social.github}`, `  linkedin  ${social.linkedin}`]
    case 'lang': {
      const code = (args[0] ?? '').toLowerCase()
      if (code !== 'en' && code !== 'fr') return [{ text: s.langUsage, tone: 'error' }]
      setLang(code)
      return [interfaceStrings[code].screen.terminal.langSet]
    }
    case 'sudo':
      return [{ text: s.sudo, tone: 'error' }]
    case 'clear':
      return null
    default:
      return [{ text: s.notFound.replace('{cmd}', command), tone: 'error' }]
  }
}

// The tab strip that sits in the window's title bar.
export function TerminalTabs() {
  return (
    <div className="br-tabs">
      <div className="br-tab tm-tab" data-active="">
        <span className="tm-icon" aria-hidden="true">
          &gt;_
        </span>
        <span className="br-tab-title">PowerShell</span>
        <span className="br-tab-close" aria-hidden="true">
          <Glyph kind="close" size={12} />
        </span>
      </div>
      <span className="br-newtab" aria-hidden="true">
        <Glyph kind="plus" size={14} />
      </span>
      <span className="br-newtab" aria-hidden="true">
        <Glyph kind="chevronDown" size={14} />
      </span>
    </div>
  )
}

export default function Terminal({ focused, openApp }) {
  const { t, lang, setLang } = useLang()
  const ui = interfaceStrings[lang].screen
  const [lines, setLines] = useState(() => [
    { text: 'PowerShell 7.5.0', tone: 'plain' },
    { text: ui.terminal.welcome, tone: 'dim' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)
  const input = useRef(null)
  const end = useRef(null)

  useEffect(() => {
    if (focused) input.current?.focus({ preventScroll: true })
  }, [focused])

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const submit = (event) => {
    event.preventDefault()
    const output = run(value, { t, ui, setLang, openApp })
    if (output === null) setLines([])
    else setLines((previous) => [...previous, { text: `${PROMPT} ${value}`, tone: 'echo' }, ...output])
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 50))
    setCursor(-1)
    setValue('')
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault()
      const next = Math.min(history.length - 1, cursor + 1)
      setCursor(next)
      setValue(history[next])
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = cursor - 1
      setCursor(next)
      setValue(next >= 0 ? history[next] : '')
    } else if (event.key === 'Tab') {
      event.preventDefault()
      const match = [...COMMANDS, 'help'].find((name) => name.startsWith(value.trim()))
      if (value.trim() && match) setValue(match)
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="term" onClick={() => input.current?.focus({ preventScroll: true })}>
      {lines.map((line, index) => {
        const { text, tone } = typeof line === 'string' ? { text: line, tone: 'plain' } : line
        return (
          <p key={index} className="term-line" data-tone={tone}>
            {text || ' '}
          </p>
        )
      })}
      <form className="term-input" onSubmit={submit} ref={end}>
        <label htmlFor="term-field">{PROMPT}</label>
        <input
          id="term-field"
          ref={input}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
    </div>
  )
}
