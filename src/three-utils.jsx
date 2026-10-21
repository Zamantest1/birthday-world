import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d');
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner); g.addColorStop(.35, inner.replace(/[\d.]+\)$/, '0.35)')); g.addColorStop(1, outer);
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [inner, outer]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function Glow({ color = '#d8b56d', scale = 2, opacity = .6, ...props }) {
  const map = useGlowTexture();
  return <sprite scale={[scale, scale, 1]} {...props}>
    <spriteMaterial map={map} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
  </sprite>;
}

function seeded(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

/** Rising golden motes. "burst" plays once when active turns true, "loop" streams while active. */
export function Motes({ active, origin = [0, 0, 0], spread = .5, height = 2, count = 60, color = '#f1d08a', size = .045, mode = 'burst', speed = .5 }) {
  const points = useRef(); const age = useRef(0); const fade = useRef(0);
  const { positions, seeds } = useMemo(() => {
    const rand = seeded(count * 97 + 3);
    const seeds = Array.from({ length: count }, () => [rand(), rand(), rand(), .5 + rand()]);
    return { positions: new Float32Array(count * 3), seeds };
  }, [count]);
  useFrame((state, dt) => {
    age.current = active ? age.current + dt : 0;
    fade.current = THREE.MathUtils.damp(fade.current, active ? 1 : 0, 3, dt);
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const [a, r, phase, v] = seeds[i];
      const life = mode === 'loop' ? (t * speed * v * .4 + phase) % 1 : Math.min(1, age.current * speed * v * .5);
      const angle = a * Math.PI * 2 + life * 2;
      const radius = spread * Math.sqrt(r) * (mode === 'loop' ? 1 - life * .4 : 1 + life);
      positions[i * 3] = origin[0] + Math.cos(angle) * radius;
      positions[i * 3 + 1] = origin[1] + life * height * v;
      positions[i * 3 + 2] = origin[2] + Math.sin(angle) * radius;
    }
    const geo = points.current.geometry; geo.attributes.position.needsUpdate = true;
    const burstFade = mode === 'burst' ? Math.max(0, 1 - age.current * speed * .45) : 1;
    points.current.material.opacity = fade.current * burstFade * .9;
    points.current.visible = points.current.material.opacity > .01;
  });
  const map = useGlowTexture();
  return <points ref={points} visible={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial map={map} color={color} size={size} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
  </points>;
}

/** A field of drifting particles in a spherical shell — used for stars and dust. */
export function ParticleField({ count = 800, inner = 6, outer = 24, size = .06, color = '#f6f0e8', opacity = .8, drift = .01, seed = 1 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const rand = seeded(seed * 7919 + count);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1; const th = rand() * Math.PI * 2; const r = inner + (outer - inner) * Math.cbrt(rand());
      const s = Math.sqrt(1 - u * u);
      arr.set([Math.cos(th) * s * r, u * r * .7, Math.sin(th) * s * r], i * 3);
    }
    return arr;
  }, [count, inner, outer, seed]);
  const map = useGlowTexture();
  useFrame((_, dt) => { ref.current.rotation.y += dt * drift; ref.current.rotation.x += dt * drift * .2; });
  return <points ref={ref}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial map={map} color={color} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
  </points>;
}

export async function whenFontsReady(fonts) {
  if (!document.fonts?.load) return;
  try { await Promise.all(fonts.map(f => document.fonts.load(f))); } catch { /* fall back to serif */ }
}
