import * as THREE from 'three'

// Shell fur: a mesh is drawn several more times, each copy pushed a little
// further out along its normals, and each copy keeps only the pixels that
// fall on a strand. Seen together the shells read as pile — a dog's coat, a
// slipper's fleece — without a texture or a single extra vertex in the
// mesh itself.
//
// Strands are placed in the object's own space, so the geometry needs no
// UVs: a 3D cell grid, one strand per cell, each strand a different length.

const shellChunk = /* glsl */ `
  float furHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
`

// `layers` shells, `length` in the mesh's units, `density` strands per unit.
// `clump` (0–1) lets neighbouring strands share length, which reads as
// locks rather than velvet; `droop` pulls the tips downwards.
export function addFur(mesh, { layers = 10, length = 0.6, density = 2.5, thickness = 0.55, clump = 0.4, droop = 0, shade = 0.5 } = {}) {
  const base = mesh.material
  const group = new THREE.Group()
  group.name = `${mesh.name || 'mesh'}-fur`

  for (let layer = 1; layer <= layers; layer += 1) {
    const h = layer / layers
    const material = base.clone()
    material.onBeforeCompile = (shader) => {
      shader.uniforms.furH = { value: h }
      shader.uniforms.furLength = { value: length }
      shader.uniforms.furDensity = { value: density }
      shader.uniforms.furThickness = { value: thickness }
      shader.uniforms.furClump = { value: clump }
      shader.uniforms.furDroop = { value: droop }
      shader.uniforms.furShade = { value: shade }
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float furH;\nuniform float furLength;\nuniform float furDroop;\nvarying vec3 vFurPos;',
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          transformed += normalize(objectNormal) * furLength * furH;
          transformed.y -= furDroop * furLength * furH * furH;
          vFurPos = position;`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float furH;
          uniform float furDensity;
          uniform float furThickness;
          uniform float furClump;
          uniform float furShade;
          varying vec3 vFurPos;
          ${shellChunk}`,
        )
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
          vec3 cellPos = vFurPos * furDensity;
          vec3 cell = floor(cellPos);
          float own = furHash(cell);
          float lock = furHash(floor(cellPos * 0.35));
          float strand = mix(own, lock, furClump);
          // each strand thins towards its tip, and ends at its own length
          vec3 local = fract(cellPos) - 0.5;
          float radius = furThickness * (1.0 - furH) * 0.5 + 0.08;
          if (strand < furH * 0.92 || length(local) > radius + 0.22) discard;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          // deeper in the pile is darker: light reaches the tips
          diffuseColor.rgb *= mix(1.0 - furShade, 1.0, furH);`,
        )
    }
    // Every shell runs the same program; only its uniforms differ.
    material.customProgramCacheKey = () => `fur-${base.type}-${base.vertexColors}`
    material.transparent = false
    const shell = new THREE.Mesh(mesh.geometry, material)
    shell.castShadow = false
    shell.receiveShadow = true
    shell.name = `fur-${layer}`
    group.add(shell)
  }

  mesh.add(group)
  return group
}
