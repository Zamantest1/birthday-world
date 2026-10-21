import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Motes, ParticleField } from './three-utils.jsx';

const W = 1.3; const H = 1; const T = .04;
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function Velvet(props) { return <meshPhysicalMaterial color="#754052" roughness={.85} sheen={1} sheenRoughness={.45} sheenColor="#dcb3c6" {...props} />; }
function Satin(props) { return <meshPhysicalMaterial color="#e2c486" roughness={.32} metalness={.35} clearcoat={.6} clearcoatRoughness={.3} {...props} />; }

function Bow({ bowRef }) {
  return <group ref={bowRef} position={[0, .21, W / 2 + .02]}>
    {[-1, 1].map(s => <mesh key={s} castShadow position={[s * .16, .07, 0]} rotation={[Math.PI / 2 - .25, s * .35, s * .5]} scale={[1, .55, 1]}><torusGeometry args={[.15, .04, 12, 32]} /><Satin /></mesh>)}
    {[-1, 1].map(s => <mesh key={`t${s}`} castShadow position={[s * .12, .01, .16]} rotation={[-.2, 0, s * .5]}><boxGeometry args={[.09, .012, .32]} /><Satin /></mesh>)}
    <mesh castShadow position={[0, .06, 0]}><sphereGeometry args={[.07, 16, 12]} /><Satin /></mesh>
  </group>;
}

const LETTER_COPY = {
  heading: 'A Little Letter for You',
  paragraphs: [
    'You are my favourite kind of wonderful.',
    'Today, tomorrow, and all the days after, I hope life brings you little moments of happiness, reasons to smile, and memories worth keeping.',
    'May this new chapter of your life be filled with warmth, beautiful surprises, peaceful days, and everything your heart has been wishing for.',
    'You deserve to feel loved, appreciated, and celebrated, not just today, but every day.',
    'No matter where life takes you, I hope you always remember how special you are.',
  ],
  closing: 'With all my love, always.',
};

function Letter({ visible, reduced, mobile }) {
  const group = useRef(); const paper = useRef();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1600;
    const c = canvas.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 1200, 1600);
    grad.addColorStop(0, '#fffaf4'); grad.addColorStop(.55, '#fff5ee'); grad.addColorStop(1, '#f4dfdf');
    c.fillStyle = grad; c.fillRect(0, 0, 1200, 1600);
    for (let i = 0; i < 4200; i++) { c.fillStyle = `rgba(117,64,82,${(i % 4) * .009})`; c.fillRect((i * 71) % 1200, (i * 137) % 1600, 2, 2); }
    c.strokeStyle = '#d99ab1'; c.lineWidth = 6; c.strokeRect(48, 48, 1104, 1504);
    c.strokeStyle = '#ead0d4'; c.lineWidth = 2; c.strokeRect(68, 68, 1064, 1464);
    c.textAlign = 'center'; c.fillStyle = '#c27d96'; c.font = '58px Georgia'; c.fillText('♡', 600, 145);
    c.fillStyle = '#754052'; c.font = 'italic 59px Georgia'; c.fillText(LETTER_COPY.heading, 600, 235);
    c.fillStyle = '#553142'; c.font = '32px Georgia';
    const wrap = (text, maxWidth) => {
      const words = text.split(/\\s+/); const lines = []; let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (c.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line); return lines;
    };
    let y = 355;
    for (const paragraph of LETTER_COPY.paragraphs) {
      const lines = wrap(paragraph, 820);
      for (const line of lines) { c.fillText(line, 600, y); y += 43; }
      y += 22;
    }
    c.fillStyle = '#c27d96'; c.fillRect(520, y + 2, 160, 3); y += 64;
    c.fillStyle = '#754052'; c.font = 'italic 36px Georgia';
    c.fillText(LETTER_COPY.closing, 600, Math.min(y + 8, 1460));
    c.fillStyle = '#b98a9d'; c.font = '30px Georgia'; c.fillText('♡', 600, 1490);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((state, dt) => {
    const current = group.current.userData.progress ?? 0;
    const next = THREE.MathUtils.damp(current, visible ? 1 : 0, reduced ? 12 : 1.6, dt);
    group.current.userData.progress = next;
    group.current.visible = next > .005;
    // Rise from the box cavity, unfold, and settle just above the open box.
    group.current.position.y = .12 + next * (mobile ? 1.12 : 1.42);
    group.current.position.z = .34 + next * .52;
    group.current.rotation.x = -.28 - (1 - smooth(0, .9, next)) * .62;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * .35) * .008;
    group.current.scale.setScalar(.08 + next * (mobile ? .62 : .82));
    paper.current.material.opacity = Math.min(1, next * 2.2);
  });
  return <group ref={group} position={[0, .12, .34]} visible={false}>
    <mesh ref={paper} position={[0, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[2.05, 2.72, 1, 1]} />
      <meshStandardMaterial map={texture} transparent opacity={0} side={THREE.DoubleSide} roughness={.92} metalness={0} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
    <mesh position={[0, 0, -.018]} castShadow receiveShadow>
      <boxGeometry args={[2.05, 2.72, .035]} />
      <meshStandardMaterial color="#e4c6c9" roughness={.94} />
    </mesh>
oup>
  </group>;
}

export default function GiftScene({ open, reduced, mobile }) {
  const box = useRef(); const lid = useRef(); const bow = useRef(); const light = useRef(); const glow = useRef(); const progress = useRef(0);
  useFrame((state, dt) => {
    progress.current = open ? Math.min(1, progress.current + dt / (reduced ? .3 : 3.2)) : Math.max(0, progress.current - dt / 1.2);
    const p = progress.current; const t = state.clock.elapsedTime;
    box.current.position.y = reduced ? 0 : Math.sin(t * .9) * .025;
    box.current.rotation.y = -.42 + (reduced ? 0 : Math.sin(t * .35) * .05) + smooth(0, .5, p) * .3;
    const wobble = (1 - smooth(.05, .28, p)) * smooth(0, .05, p);
    bow.current.scale.setScalar(1 + Math.sin(p * 60) * .08 * wobble);
    bow.current.rotation.z = Math.sin(p * 40) * .12 * wobble;
    lid.current.rotation.x = -smooth(.22, .72, p) * 1.95;
    lid.current.position.y = H + smooth(.18, .32, p) * .05;
    light.current.intensity = smooth(.35, .8, p) * 9;
    glow.current.material.opacity = smooth(.35, .85, p) * .9;
  });
  return <group position={[0, -.6, 0]}>
    <spotLight position={[2.5, 5, 3.5]} angle={.42} penumbra={.9} intensity={60} color="#f6e8d6" castShadow shadow-mapSize={mobile ? 512 : 1024} shadow-bias={-.0004} />
    <spotLight position={[-3, 2.5, -3]} angle={.6} penumbra={1} intensity={35} color="#d58ba8" />
    <pointLight position={[-2, 1, 2]} intensity={4} color="#d8b56d" distance={6} />
    <Glow color="#8e526d" scale={8} opacity={.6} position={[0, 1.2, -2.5]} />
    <ParticleField count={mobile ? 120 : 260} inner={1.8} outer={8} size={.06} color="#f0a9bf" opacity={.65} drift={reduced ? 0 : .015} seed={11} />

    <mesh position={[0, -.3, 0]} castShadow receiveShadow><cylinderGeometry args={[1.35, 1.45, .6, 96]} /><meshPhysicalMaterial color="#553142" roughness={.8} sheen={1} sheenColor="#8f74ad" /></mesh>
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, .018, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.25} /></mesh>
    <mesh position={[0, -.6, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, .014, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.3} /></mesh>
    <ContactShadows position={[0, -.6, 0]} scale={7} blur={2.6} opacity={.7} far={2} color="#08050c" />

    <group ref={box}>
      <mesh position={[0, T / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, T, W]} /><Velvet /></mesh>
      {[[0, -1], [0, 1], [1, 0], [-1, 0]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x * (W - T) / 2, H / 2, z * (W - T) / 2]} castShadow receiveShadow>
        <boxGeometry args={[x ? T : W, H, z ? T : W]} /><Velvet />
      </mesh>)}
      <mesh position={[0, H * .4, 0]}><boxGeometry args={[W - T * 2.2, H * .8, W - T * 2.2]} /><meshStandardMaterial color="#3b202c" roughness={1} side={THREE.BackSide} /></mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map(r => <mesh key={r} rotation={[0, r, 0]} position={[Math.sin(r) * (W / 2 + .004), H / 2, Math.cos(r) * (W / 2 + .004)]} castShadow><boxGeometry args={[.16, H, .008]} /><Satin /></mesh>)}
      <Glow ref={glow} color="#ffd38a" scale={2.4} opacity={0} position={[0, H + .1, 0]} />
      <pointLight ref={light} position={[0, H - .15, 0]} color="#ffd2a1" intensity={0} distance={4} decay={2} />
      <group ref={lid} position={[0, H, -W / 2 - .04]}>
        <group position={[0, 0, 0]}>
          <mesh position={[0, .1, W / 2 + .04]} castShadow receiveShadow><boxGeometry args={[W + .08, .2, W + .08]} /><Velvet color="#8f4f68" /></mesh>
          <mesh position={[0, .1, W / 2 + .04]} castShadow><boxGeometry args={[.17, .208, W + .088]} /><Satin /></mesh>
          <mesh position={[0, .1, W / 2 + .04]} castShadow><boxGeometry args={[W + .088, .208, .17]} /><Satin /></mesh>
          <Bow bowRef={bow} />
        </group>
      </group>
      <Motes active={open} mode="loop" origin={[0, H - .1, 0]} spread={.45} height={2.6} count={mobile ? 50 : 110} speed={.6} size={.05} />
    </group>
    <Letter visible={open} reduced={reduced} mobile={mobile} />
  </group>;
}
