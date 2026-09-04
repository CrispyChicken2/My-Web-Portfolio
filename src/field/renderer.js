import { COMPOSITE_FRAG, EXPANSE_FRAG, POINTS_FRAG, POINTS_VERT, QUAD_VERT } from './shaders'

// The site's one and only WebGL surface. It renders the Field — the expanse
// and the points above it — into a framebuffer, then composites that to the
// screen, refracting it where the navigation bar sits. Nothing in here knows
// about React, and nothing in here decides how the Visitor's input maps to a
// number; that belongs to src/motion/params.js.

const POINT_COUNT = 480

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`The Field failed to compile a program: ${log}`)
  }
  return shader
}

function link(gl, vertSource, fragSource) {
  const program = gl.createProgram()
  const vert = compile(gl, gl.VERTEX_SHADER, vertSource)
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSource)
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`The Field failed to link a program: ${log}`)
  }
  return program
}

// Every uniform this program declares, by name, so call sites read as
// `set(program, 'u_time', value)` instead of juggling locations.
function uniforms(gl, program) {
  const map = new Map()
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < count; i += 1) {
    const info = gl.getActiveUniform(program, i)
    map.set(info.name, gl.getUniformLocation(program, info.name))
  }
  return map
}

// A uniform the compiler optimised away has no location; passing null is a
// no-op, which keeps every call site free of existence checks.
const at = (map, name) => map.get(name) ?? null

export function createFieldRenderer(canvas, options = {}) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  })
  if (!gl) throw new Error('WebGL2 is unavailable')

  const palette = options.palette
  let points = options.points !== false

  const expanse = link(gl, QUAD_VERT, EXPANSE_FRAG)
  const pointLayer = link(gl, POINTS_VERT, POINTS_FRAG)
  const composite = link(gl, QUAD_VERT, COMPOSITE_FRAG)
  const u = {
    expanse: uniforms(gl, expanse),
    points: uniforms(gl, pointLayer),
    composite: uniforms(gl, composite),
  }

  // One fullscreen triangle pair, shared by the expanse and the composite.
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const quadVao = gl.createVertexArray()
  gl.bindVertexArray(quadVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  // The point layer draws from gl_VertexID alone — no attributes at all.
  const emptyVao = gl.createVertexArray()

  const target = gl.createFramebuffer()
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  let width = 0
  let height = 0
  let fieldWidth = 0
  let fieldHeight = 0
  let pixelScale = options.pixelScale ?? 1
  // The Field has no high-frequency detail worth resolving, so it is drawn at
  // a fraction of the screen's pixels and sampled back bilinearly. The
  // composite — and with it the bar's refraction — still runs at full size.
  const fieldScale = options.fieldScale ?? 0.5

  function resize(cssWidth, cssHeight, scale = pixelScale) {
    pixelScale = scale
    const w = Math.max(1, Math.round(cssWidth * scale))
    const h = Math.max(1, Math.round(cssHeight * scale))
    if (w === width && h === height) return false
    width = w
    height = h
    fieldWidth = Math.max(1, Math.round(w * fieldScale))
    fieldHeight = Math.max(1, Math.round(h * fieldScale))
    canvas.width = w
    canvas.height = h
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, fieldWidth, fieldHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return true
  }

  // state: { time, pointer: {x, y}, pointerAmount, velocity, nav }
  // `nav` is the bar's rectangle in CSS pixels from the top-left, or null.
  function render(state) {
    if (!width || !height) return
    const { time = 0, pointer = { x: 0, y: 0 }, pointerAmount = 0, velocity = 0, nav = null } = state

    gl.bindFramebuffer(gl.FRAMEBUFFER, target)
    gl.viewport(0, 0, fieldWidth, fieldHeight)

    gl.useProgram(expanse)
    gl.uniform2f(at(u.expanse, 'u_res'), fieldWidth, fieldHeight)
    gl.uniform1f(at(u.expanse, 'u_time'), time)
    gl.uniform2f(at(u.expanse, 'u_pointer'), pointer.x, pointer.y)
    gl.uniform1f(at(u.expanse, 'u_pointerAmount'), pointerAmount)
    gl.uniform1f(at(u.expanse, 'u_velocity'), velocity)
    gl.uniform3fv(at(u.expanse, 'u_ink'), palette.ink)
    gl.uniform3fv(at(u.expanse, 'u_deep'), palette.deep)
    gl.uniform3fv(at(u.expanse, 'u_mid'), palette.mid)
    gl.uniform3fv(at(u.expanse, 'u_glow'), palette.glow)
    gl.bindVertexArray(quadVao)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    if (points) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      gl.useProgram(pointLayer)
      gl.uniform2f(at(u.points, 'u_res'), fieldWidth, fieldHeight)
      gl.uniform1f(at(u.points, 'u_time'), time)
      gl.uniform2f(at(u.points, 'u_pointer'), pointer.x, pointer.y)
      gl.uniform1f(at(u.points, 'u_pointerAmount'), pointerAmount)
      gl.uniform1f(at(u.points, 'u_velocity'), velocity)
      gl.uniform1f(at(u.points, 'u_scale'), pixelScale * fieldScale)
      gl.uniform1f(at(u.points, 'u_count'), POINT_COUNT)
      gl.uniform3fv(at(u.points, 'u_point'), palette.point)
      gl.bindVertexArray(emptyVao)
      gl.drawArrays(gl.POINTS, 0, POINT_COUNT)
      gl.disable(gl.BLEND)
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
    gl.useProgram(composite)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(at(u.composite, 'u_field'), 0)
    gl.uniform2f(at(u.composite, 'u_res'), width, height)
    gl.uniform3fv(at(u.composite, 'u_ink'), palette.ink)
    gl.uniform3fv(at(u.composite, 'u_navTint'), palette.navTint)
    if (nav) {
      // gl_FragCoord counts from the bottom; a DOM rect counts from the top.
      const s = pixelScale
      gl.uniform4f(
        at(u.composite, 'u_nav'),
        nav.left * s,
        height - (nav.top + nav.height) * s,
        nav.width * s,
        nav.height * s,
      )
      gl.uniform1f(at(u.composite, 'u_navRadius'), Math.min(nav.radius, nav.height / 2) * s)
      gl.uniform1f(at(u.composite, 'u_navOn'), 1)
    } else {
      gl.uniform1f(at(u.composite, 'u_navOn'), 0)
    }
    gl.bindVertexArray(quadVao)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindVertexArray(null)
  }

  function setPoints(enabled) {
    points = enabled
  }

  function dispose() {
    gl.deleteProgram(expanse)
    gl.deleteProgram(pointLayer)
    gl.deleteProgram(composite)
    gl.deleteBuffer(quad)
    gl.deleteVertexArray(quadVao)
    gl.deleteVertexArray(emptyVao)
    gl.deleteFramebuffer(target)
    gl.deleteTexture(texture)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { gl, resize, render, setPoints, dispose }
}
