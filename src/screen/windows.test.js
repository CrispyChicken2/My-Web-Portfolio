import { describe, expect, it } from 'vitest'
import { DESKTOP, constrain, initialWindows, windowsReducer } from './windows'

const open = (state, app, props) => windowsReducer(state, { type: 'open', app, props })

describe('the window manager', () => {
  it('opens one window per application and focuses it', () => {
    let state = open(initialWindows, 'portfolio')
    state = open(state, 'portfolio', { page: 'contact' })
    expect(state.windows).toHaveLength(1)
    expect(state.focused).toBe(state.windows[0].id)
    expect(state.windows[0].props.page).toBe('contact')
  })

  it('brings a focused window to the front', () => {
    let state = open(initialWindows, 'portfolio')
    state = open(state, 'terminal')
    const portfolio = state.windows.find((w) => w.app === 'portfolio')
    state = windowsReducer(state, { type: 'focus', id: portfolio.id })
    const z = Object.fromEntries(state.windows.map((w) => [w.app, w.z]))
    expect(z.portfolio).toBeGreaterThan(z.terminal)
    expect(state.focused).toBe(portfolio.id)
  })

  it('hands focus to the next window down when one is minimised or closed', () => {
    let state = open(initialWindows, 'portfolio')
    state = open(state, 'terminal')
    const [portfolio, terminal] = state.windows
    state = windowsReducer(state, { type: 'minimize', id: terminal.id })
    expect(state.focused).toBe(portfolio.id)
    state = windowsReducer(state, { type: 'close', id: portfolio.id })
    expect(state.focused).toBe(null)
  })

  it('restores a minimised window when it is opened again', () => {
    let state = open(initialWindows, 'terminal')
    state = windowsReducer(state, { type: 'minimize', id: state.windows[0].id })
    state = open(state, 'terminal')
    expect(state.windows[0].minimized).toBe(false)
  })
})

describe('constrain', () => {
  it('keeps a grip of the title bar on the desktop', () => {
    const far = constrain({ x: 5000, y: 5000, width: 800, height: 500 })
    expect(far.x).toBeLessThan(DESKTOP.width)
    expect(far.y).toBeLessThan(DESKTOP.height - DESKTOP.taskbar)
    const lost = constrain({ x: -5000, y: -40, width: 800, height: 500 })
    expect(lost.x + lost.width).toBeGreaterThan(0)
    expect(lost.y).toBe(0)
  })

  it('never makes a window smaller than usable', () => {
    const tiny = constrain({ x: 0, y: 0, width: 10, height: 10 })
    expect(tiny.width).toBeGreaterThanOrEqual(360)
    expect(tiny.height).toBeGreaterThanOrEqual(240)
  })
})
