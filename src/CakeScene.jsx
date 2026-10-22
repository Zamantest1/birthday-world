import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TAU = Math.PI * 2;
const START = .28;
const END = .94;
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function sector(radius, height, start, end) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  for (let i = 0; i <= 100; i++) { const a = start + (end - start) * i / 100; shape.lineTo(Math.sin(a) * radius, Math.cos(a) * radius); }
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .012, bevelThickness: .012, curveSegments: 64 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
function useFrostingTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d'); c.fillStyle = '#aaa'; c.fillRect(0, 0, 256, 256);
    let seed = 12;
    for (let i = 0; i < 18000; i++) { seed = (seed * 16807) % 2147483647; const x = seed % 256; seed = (seed * 16807) % 2147483647; const y = seed % 256; c.fillStyle = `rgba(255,255,255,${(i % 5) * .025})`; c.fillRect(x, y, 2, 2); }
    const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]); return texture;
}
function IcingWriting() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
    const c = canvas.getContext('2d'); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = '#77524080'; c.shadowBlur = 3; c.shadowOffsetY = 3;
    c.fillStyle = '#6b476e'; c.font = 'italic 78px Georgia';
    c.fillText('Someone I love', 512, 195);
    c.fillText('was born today ♥', 512, 305);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[-.15, .976, -.1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2, 1]} /><meshStandardMaterial map={texture} transparent depthWrite={false} roughness={.78} polygonOffset polygonOffsetFactor={-2} /></mesh>;
}
function Rosette({ angle, bottom = false }) {
  return <group position={[Math.sin(angle) * (bottom ? 1.42 : 1.28), bottom ? -.12 : 1, -Math.cos(angle) * (bottom ? 1.42 : 1.28)]} rotation={[0, angle, 0]}>
    {Array.from({ length: 6 }, (_, j) => <mesh key={j} castShadow position={[Math.sin(j * TAU / 6) * .047, 0, Math.cos(j * TAU / 6) * .047]} rotation={[.25, j * TAU / 6, .3]} scale={[.045, bottom ? .055 : .09, .071]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color="#f6eadd" roughness={.72} /></mesh>)}
    <mesh position={[0, .04, 0]}><sphereGeometry args={[.037, 10, 8]} /><meshStandardMaterial color={bottom ? '#f6eadd' : '#d8b56d'} metalness={bottom ? 0 : .65} roughness={.38} /></mesh>
  </group>;
}
function CakeSection({ start, end, bump }) {
  const layers = useMemo(() => [
    { y: -.13, h: .29, r: 1.38, color: '#d9b080' },
    { y: .16, h: .07, r: 1.39, color: '#9f5d72' },
    { y: .23, h: .08, r: 1.39, color: '#f4dfce' },
    { y: .31, h: .25, r: 1.38, color: '#d9b080' },
    { y: .56, h: .07, r: 1.39, color: '#9f5d72' },
    { y: .63, h: .26, r: 1.38, color: '#e1bb8e' },
    { y: .89, h: .07, r: 1.43, color: '#f6eadd' },
  ].map(l => ({ ...l, geo: sector(l.r, l.h, start, end) })), [start, end]);
  useEffect(() => () => layers.forEach(l => l.geo.dispose()), [layers]);
  return <>
    {layers.map((l, i) => <mesh key={i} geometry={l.geo} position={[0, l.y, 0]} castShadow receiveShadow><meshStandardMaterial color={l.color} bumpMap={bump} bumpScale={i === 6 ? .016 : .06} roughness={.86} /></mesh>)}
    <mesh rotation={[0, Math.PI - end, 0]} position={[0, .39, 0]} castShadow receiveShadow><cylinderGeometry args={[1.43, 1.44, 1.04, 96, 12, true, 0, end - start]} /><meshStandardMaterial color="#eee0cf" bumpMap={bump} bumpScale={.025} roughness={.7} /></mesh>
    {[.04, .24, .46, .67, .82].map(y => <mesh key={y} rotation={[Math.PI / 2, 0, start - Math.PI / 2]} position={[0, y, 0]}><torusGeometry args={[1.432, .009, 4, 96, end - start]} /><meshStandardMaterial color="#e5d5c3" roughness={.8} /></mesh>)}
    {Array.from({ length: 38 }, (_, i) => i * TAU / 38).filter(a => a >= start && a < end).map(a => <group key={a}><Rosette angle={a} /><Rosette angle={a} bottom /></group>)}
  </>;
}
function Candle({ blownOut, reduced }) {
  const flame = useRef(); const light = useRef(); const smoke = useRef(); const elapsed = useRef(0);
  useFrame((state, dt) => {
    if (!flame.current || !light.current || !smoke.current) return;
    const t = state.clock.elapsedTime;
    elapsed.current = blownOut ? elapsed.current + dt : 0;
    const scale = blownOut ? Math.max(0, 1 - elapsed.current * 2) : 1;
    flame.current.scale.set(.065 * scale, (.16 + (reduced ? 0 : Math.sin(t * 16) * .014)) * scale, .065 * scale);
    flame.current.rotation.z = blownOut ? -elapsed.current * 1.5 : Math.sin(t * 7) * .09;
    const flicker = Math.sin(t * 18) * 0.18 + Math.sin(t * 29) * 0.10 + (Math.sin(t * 7) * 0.06);
    light.current.intensity = scale * (2.8 + (reduced ? 0 : flicker));
    light.current.position.set((reduced ? 0 : Math.sin(t * 11) * 0.02), 1.65, -.42 + (reduced ? 0 : Math.cos(t * 13) * 0.02));
    smoke.current.children.forEach((m, i) => { const age = elapsed.current - i * .16; m.visible = blownOut && age > 0 && age < 2.8; m.position.set(Math.sin(age * 3 + i) * .08, 1.6 + age * .33, -.42); m.scale.setScalar(.04 + age * .025); m.material.opacity = Math.max(0, .22 * (1 - age / 2.8)); });
  });
  return <>
    <mesh position={[0, 1.22, -.42]} castShadow><cylinderGeometry args={[.047, .05, .52, 24]} /><meshStandardMaterial color="#c59a68" metalness={.3} roughness={.4} /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, 1 + i * .06, -.42]} rotation={[Math.PI / 2, .13, 0]}><torusGeometry args={[.049, .006, 5, 24]} /><meshStandardMaterial color="#f6eadd" /></mesh>)}
    <mesh position={[0, 1.5, -.42]}><cylinderGeometry args={[.009, .009, .06, 8]} /><meshStandardMaterial color="#3f2931" /></mesh>
    <mesh ref={flame} position={[0, 1.65, -.42]}><sphereGeometry args={[1, 20, 20]} /><meshBasicMaterial color="#ffe1a1" toneMapped={false} /></mesh>
    <pointLight ref={light} position={[0, 1.65, -.42]} color="#ffb85e" distance={3} decay={2} />
    <group ref={smoke}>{Array.from({ length: 10 }, (_, i) => <mesh key={i} visible={false}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#d3c5cf" transparent depthWrite={false} /></mesh>)}</group>
  </>;
}
export default function CakeScene({ blownOut, sliceServed, reduced }) {
  const slice = useRef(); const plate = useRef(); const bump = useFrostingTexture();
  const cutProgress = useRef(0);
  useFrame((_, dt) => {
    if (!slice.current || !plate.current) return;
    cutProgress.current = THREE.MathUtils.damp(cutProgress.current, sliceServed ? 1 : 0, reduced ? 14 : 2.0, dt);
    const p = cutProgress.current;

    // Slice center angle = 0.61 rad (~35 deg)
    const ux = 0.5728;
    const uz = -0.8196;
    const targetX = 1.25;
    const targetZ = -1.78;

    // Phase 1 (0 -> 0.28): Distinct radial separation cut from the cake
    const sepDist = smooth(0, 0.28, p) * 0.35;
    // Phase 2 (0.22 -> 1.0): Graceful lift arc and glide onto the plate
    const glide = smooth(0.22, 1.0, p);
    const arcY = Math.sin(glide * Math.PI) * 0.16;

    const posX = ux * sepDist + (targetX - ux * 0.35) * glide;
    const posZ = uz * sepDist + (targetZ - uz * 0.35) * glide;
    const posY = -0.065 * glide + arcY;

    slice.current.position.set(posX, posY, posZ);

    // Plate scales in as the slice approaches
    const plateScale = smooth(0.18, 0.72, p);
    plate.current.scale.setScalar(Math.max(0.001, plateScale));
  });
  return <group rotation={[0, Math.PI, 0]} position={[0, -.35, 0]}>
    <mesh position={[0, -.24, 0]} castShadow receiveShadow><cylinderGeometry args={[1.7, 1.68, .12, 96]} /><meshStandardMaterial color="#d9bb82" metalness={.65} roughness={.3} /></mesh>
    <mesh position={[0, -.48, 0]} castShadow><cylinderGeometry args={[.65, .86, .4, 64]} /><meshStandardMaterial color="#41303e" metalness={.38} roughness={.32} /></mesh>
    <mesh position={[0, -.7, 0]} receiveShadow><cylinderGeometry args={[1, 1.05, .06, 64]} /><meshStandardMaterial color="#d9bb82" metalness={.6} roughness={.3} /></mesh>
    <CakeSection start={END} end={START + TAU} bump={bump} />
    <group ref={slice}><CakeSection start={START} end={END} bump={bump} /></group>
    <group rotation={[0, Math.PI, 0]}><IcingWriting /><Candle blownOut={blownOut} reduced={reduced} /></group>
    <mesh ref={plate} position={[1.25, -.22, -1.78]} receiveShadow><cylinderGeometry args={[.8, .75, .05, 64]} /><meshStandardMaterial color="#f4e9d8" metalness={.12} roughness={.3} /></mesh>
  </group>;
}
