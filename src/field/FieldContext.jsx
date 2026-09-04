import { createContext, useContext, useMemo, useRef, useState } from 'react'

// The Field and the navigation bar have to agree on two things: where the bar
// is (so the shader can refract exactly that region) and whether the Field is
// live (so the bar knows whether to drop its own flat background). Both travel
// through here rather than a module-level global.

const INERT = { live: false, bus: { navRect: null, requestRender() {} }, setLive() {} }

const FieldContext = createContext(null)

export function FieldProvider({ children }) {
  const [live, setLive] = useState(false)
  // A mutable bus, deliberately outside React state: the nav's rectangle is
  // read by the renderer every frame and must never cause a re-render.
  const bus = useRef({ navRect: null, requestRender() {} }).current
  const value = useMemo(() => ({ live, setLive, bus }), [live, bus])
  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

export function useField() {
  return useContext(FieldContext) ?? INERT
}
