import * as THREE from 'three';

export interface WaterMaterialHandle {
  material: THREE.MeshPhysicalMaterial;
  update: (elapsed: number, sunColor: THREE.Color, skyColor: THREE.Color) => void;
}

export function createVillageWaterMaterial(isSoftwareGl: boolean): WaterMaterialHandle {
  const uniforms = {
    uTime: { value: 0 },
    uDeepColor: { value: new THREE.Color(0x0d4f5c) },
    uShallowColor: { value: new THREE.Color(0x1f7a7c) },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x1a6b73,
    roughness: 0.14,
    metalness: 0.08,
    clearcoat: isSoftwareGl ? 0.3 : 0.9,
    clearcoatRoughness: 0.12,
    reflectivity: 0.85,
    transparent: true,
    opacity: 0.88,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uDeepColor = uniforms.uDeepColor;
    shader.uniforms.uShallowColor = uniforms.uShallowColor;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        varying vec3 vWaterWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float w1 = sin(transformed.x * 0.28 + uTime * 1.45) * 0.06;
        float w2 = cos(transformed.z * 0.34 - uTime * 1.15) * 0.05;
        transformed.z += w1 + w2;
        vWaterWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        varying vec3 vWaterWorldPos;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float ripple = sin(vWaterWorldPos.x * 0.7 + uTime * 1.8) * cos(vWaterWorldPos.z * 0.65 - uTime * 1.5);
        float blend = clamp(0.5 + ripple * 0.35, 0.0, 1.0);
        diffuseColor.rgb = mix(uDeepColor, uShallowColor, blend);`
      );
  };

  return {
    material,
    update: (elapsed: number, sunColor: THREE.Color, skyColor: THREE.Color) => {
      uniforms.uTime.value = elapsed;
      uniforms.uShallowColor.value
        .setHex(0x1f7a7c)
        .lerp(skyColor, 0.25)
        .lerp(sunColor, 0.08);
      uniforms.uDeepColor.value.setHex(0x0b3f4a).lerp(skyColor, 0.14);
    },
  };
}
