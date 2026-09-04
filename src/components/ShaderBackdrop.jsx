import { Component } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import FlatBackdrop from './FlatBackdrop'

// If the surface cannot be built, the designed flat Backdrop takes its place
// and the page stays complete.
class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <FlatBackdrop /> : this.props.children
  }
}

// The Backdrop: the exact preset supplied by Oscar (a shadergradient.co
// export). The props below are the preset verbatim — the only overrides are
// `animate` and `uTime`, so that a Visitor who asks for reduced motion gets a
// still Backdrop rather than a moving one.
//
// This preset carries the whole Backdrop. It is a third-party surface, so
// nothing on the site can sample it — which is why the navigation bar is a
// flat Pill rather than a refraction. See
// docs/adr/0003-shadergradient-backdrop.md.
export default function ShaderBackdrop() {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ background: 'var(--bg)' }}>
      <GLBoundary>
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          pixelDensity={1}
          fov={45}
        >
          <ShaderGradient
            animate={reduce ? 'off' : 'on'}
            axesHelper="off"
            brightness={1}
            cAzimuthAngle={180}
            cDistance={2.8}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#606080"
            color2="#8d7dca"
            color3="#212121"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="3d"
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </GLBoundary>
    </div>
  )
}
