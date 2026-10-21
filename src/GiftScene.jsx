import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Motes, ParticleField } from './three-utils.jsx';

const W = 1.3; const H = 1; const T = .04;
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function Velvet(props) { return <meshPhysicalMaterial color="#6b4a7e" roughness={.85} sheen={1} sheenRoughness={.45} sheenColor="#c9b0e8" {...props} />; }
function Satin(props) { return <meshPhysicalMaterial color="#e2c486" roughness={.32} metalness={.35} clearcoat={.6} clearcoatRoughness={.3} {...props} />; }

function Bow({ bowRef }) {
  return <group ref={bowRef} position={[0, .21, W / 2 + .02]}>
    {[-1, 1].map(s => <mesh key={s} castShadow position={[s * .16, .07, 0]} rotation={[Math.PI / 2 - .25, s * .35, s * .5]} scale={[1, .55, 1]}><torusGeometry args={[.15, .04, 12, 32]} /><Satin /></mesh>)}
    {[-1, 1].map(s => <mesh key={`t${s}`} castShadow position={[s * .12, .01, .16]} rotation={[-.2, 0, s * .5]}><boxGeometry args={[.09, .012, .32]} /><Satin /></mesh>)}
    <mesh castShadow position={[0, .06, 0]}><sphereGeometry args={[.07, 16, 12]} /><Satin /></mesh>
  </group>;
}

export const LETTER_COPY = {
  heading: 'Dear Amina,',
  paragraphs: [
    'Happy Birthday.',
    'More than six years is a long time to share with someone. We have lived through so many moments—some bright and easy, others quiet and heavy. There were times when the road felt uncertain, and times when we were not sure where we stood. Yet somehow, through all of it, we kept finding our way back to each other.',
    'Whatever choices come next, and wherever our paths may lead, I want you to know how deeply grateful I am for the time we have shared. You have given this part of my life meaning, warmth, and memories that I will always hold close.',
    'I hope this year brings you peace, gentle days, and every opportunity to build the life you deserve. Never lose that kind heart, that cute little charm, or the fiery spark that makes you who you are.',
    'Happy Birthday, Amina. I wish you nothing but the best, always.',
  ],
  closing: 'With warmth, respect, and care, always.',
};

function Letter({ visible, reduced, mobile }) {
  const group = useRef();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1600;
    const c = canvas.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 1200, 1600);
    grad.addColorStop(0, '#fbf7ff'); grad.addColorStop(.55, '#fff9f5'); grad.addColorStop(1, '#f5e9f8');
    c.fillStyle = grad; c.fillRect(0, 0, 1200, 1600);
    for (let i = 0; i < 4200; i++) { c.fillStyle = `rgba(117,64,82,${(i % 4) * .009})`; c.fillRect((i * 71) % 1200, (i * 137) % 1600, 2, 2); }
    c.strokeStyle = '#d99ab1'; c.lineWidth = 6; c.strokeRect(48, 48, 1104, 1504);
    c.strokeStyle = '#ead0d4'; c.lineWidth = 2; c.strokeRect(68, 68, 1064, 1464);
    c.textAlign = 'center'; c.fillStyle = '#9b7cc4'; c.font = '60px Georgia'; c.fillText('♡', 600, 155);
    c.fillStyle = '#6b4a7e'; c.font = 'italic 58px Georgia'; c.fillText(LETTER_COPY.heading, 600, 245);
    c.fillStyle = '#4a3060'; c.font = '34px Georgia';
    const wrap = (text, maxWidth) => {
      const words = text.split(/\s+/); const lines = []; let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (c.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line); return lines;
    };
    let y = 370;
    for (const paragraph of LETTER_COPY.paragraphs) {
      const lines = wrap(paragraph, 840);
      for (const line of lines) { c.fillText(line, 600, y); y += 45; }
      y += 24;
    }
    c.fillStyle = '#c27d96'; c.fillRect(520, y + 6, 160, 3); y += 64;
    c.fillStyle = '#6b4a7e'; c.font = 'italic 38px Georgia';
    c.fillText(LETTER_COPY.closing, 600, Math.min(y + 12, 1450));
    c.fillStyle = '#b98a9d'; c.font = '32px Georgia';
    c.fillText('♡', 600, 1485);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, dt) => {
    if (!group.current) return;
    const current = group.current.userData.progress ?? 0;
    const next = THREE.MathUtils.damp(current, visible ? 1 : 0, reduced ? 12 : 1.4, dt);
    group.current.userData.progress = next;

    const rise = smooth(0.25, 0.95, next);
    group.current.visible = rise > 0.001;
    if (rise <= 0.001) return;

    const targetY = mobile ? 2.05 : 1.82;
    const targetZ = mobile ? 1.65 : 1.50;
    const targetScale = mobile ? 0.82 : 0.90;

    group.current.position.y = 0.20 + rise * (targetY - 0.20);
    group.current.position.z = 0.15 + rise * (targetZ - 0.15);
    group.current.rotation.x = -0.68 + rise * 0.54;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.008;
    group.current.scale.setScalar(0.25 + rise * (targetScale - 0.25));
  });

  return (
    <group ref={group} position={[0, 0.18, 0.12]} visible={false}>
      <mesh position={[0, 0, 0.013]} castShadow receiveShadow>
        <planeGeometry args={[2.04, 2.72]} />
        <meshStandardMaterial map={texture} roughness={0.92} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.08, 2.76, 0.024]} />
        <meshStandardMaterial color="#f0dce6" roughness={0.92} />
      </mesh>
    </group>
  );
}

export default function GiftScene({ open, reduced, mobile }) {
  const box = useRef(); const lid = useRef(); const bow = useRef(); const light = useRef(); const glow = useRef(); const progress = useRef(0);
  useFrame((state, dt) => {
    if (!box.current || !lid.current || !bow.current || !light.current || !glow.current) return;
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

    <mesh position={[0, -.3, 0]} castShadow receiveShadow><cylinderGeometry args={[1.35, 1.45, .6, 96]} /><meshPhysicalMaterial color="#4f3358" roughness={.8} sheen={1} sheenColor="#8f74ad" /></mesh>
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
