import { Component } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import FlatBackdrop from './FlatBackdrop'

class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <FlatBackdrop /> : this.props.children
  }
}

// Full-screen animated shader gradient behind all content.
// The <ShaderGradient> props are the exact preset supplied by Oscar
// (shadergradient.co export) — only `animate`/`uTime` are overridden when the
// visitor prefers reduced motion.
export default function ShaderBackdrop() {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void">
      <GLBoundary>
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          pixelDensity={1}
          fov={45}
        >
          <ShaderGradient
            animate={reduce ? 'off' : 'on'}
            axesHelper="off"
            bgColor1="#000000"
            bgColor2="#000000"
            brightness={0.8}
            cAzimuthAngle={270}
            cDistance={0.5}
            cPolarAngle={180}
            cameraZoom={15.1}
            color1="#73bfc4"
            color2="#ff810a"
            color3="#8da0ce"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="env"
            pixelDensity={1}
            positionX={-0.1}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.4}
            rotationX={0}
            rotationY={130}
            rotationZ={70}
            shader="defaults"
            type="sphere"
            uAmplitude={3.2}
            uDensity={0.8}
            uFrequency={5.5}
            uSpeed={0.3}
            uStrength={0.3}
            uTime={reduce ? 4 : 0}
            wireframe={false}
            zoomOut={false}
          />
        </ShaderGradientCanvas>
      </GLBoundary>

      {/* readability scrim + vignette (the shader has its own grain) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(5,7,11,0.3) 0%, rgba(5,7,11,0.45) 55%, rgba(5,7,11,0.68) 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 120% at 50% 42%, transparent 55%, rgba(2,3,6,0.66) 100%)' }}
      />
    </div>
  )
}
