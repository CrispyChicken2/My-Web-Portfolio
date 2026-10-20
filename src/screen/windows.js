// The Screen's window manager, as a reducer: which windows are open, where,
// in what order, and in what state. Kept free of React and the DOM so the
// rules about focus and stacking can be tested on their own.

export const DESKTOP = { width: 1720, height: 720, taskbar: 48 }

// Where each application opens, and how big.
export const APPS = {
  portfolio: { width: 1160, height: 612, x: 210, y: 24 },
  terminal: { width: 820, height: 430, x: 700, y: 150 },
  recycle: { width: 760, height: 430, x: 420, y: 96 },
}

let nextId = 1

export const initialWindows = { windows: [], focused: null, top: 0 }

// Keeps at least a grip of the title bar on the desktop, so a window can
// never be dragged somewhere it cannot be dragged back from.
export function constrain({ x, y, width, height }) {
  const grip = 120
  return {
    x: Math.min(Math.max(x, grip - width), DESKTOP.width - grip),
    y: Math.min(Math.max(y, 0), DESKTOP.height - DESKTOP.taskbar - 32),
    width: Math.max(360, Math.min(width, DESKTOP.width)),
    height: Math.max(240, Math.min(height, DESKTOP.height - DESKTOP.taskbar)),
  }
}

export function windowsReducer(state, action) {
  switch (action.type) {
    case 'open': {
      // One window per application: opening it again brings it forward, and
      // passes along anything it was asked to show.
      const existing = state.windows.find((w) => w.app === action.app)
      const top = state.top + 1
      if (existing) {
        return {
          ...state,
          top,
          focused: existing.id,
          windows: state.windows.map((w) =>
            w.id === existing.id ? { ...w, z: top, minimized: false, props: { ...w.props, ...action.props } } : w,
          ),
        }
      }
      const frame = APPS[action.app]
      const offset = (state.windows.length % 4) * 26
      const id = nextId
      nextId += 1
      return {
        ...state,
        top,
        focused: id,
        windows: [
          ...state.windows,
          {
            id,
            app: action.app,
            ...constrain({ ...frame, x: frame.x + offset, y: frame.y + offset }),
            z: top,
            minimized: false,
            maximized: false,
            props: action.props ?? {},
          },
        ],
      }
    }
    case 'focus': {
      if (state.focused === action.id) return state
      const top = state.top + 1
      return {
        ...state,
        top,
        focused: action.id,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z: top, minimized: false } : w)),
      }
    }
    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id)
      return { ...state, windows, focused: frontmost(windows) }
    }
    case 'minimize': {
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w))
      return { ...state, windows, focused: frontmost(windows) }
    }
    case 'maximize':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, maximized: !w.maximized } : w)),
      }
    case 'move':
    case 'resize':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, ...constrain({ ...w, ...action.frame }), maximized: false } : w,
        ),
      }
    default:
      return state
  }
}

// The highest window still showing, or nothing.
function frontmost(windows) {
  const visible = windows.filter((w) => !w.minimized)
  if (!visible.length) return null
  return visible.reduce((a, b) => (a.z > b.z ? a : b)).id
}
