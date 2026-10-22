import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Motes, ParticleField } from './three-utils.jsx';

const W = 1.3; const H = 1; const T = .04;
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function Velvet(props) { return <meshPhysicalMaterial color="#6b4a7e" roughness={.85} sheen={1} sheenRoughness={.45} sheenColor="#c9b0e8" {...props} />; }
function Satin(props) { return <meshPhysicalMaterial color="#e8c4a0" roughness={.22} metalness={.52} clearcoat={.85} clearcoatRoughness={.25} sheen={1} sheenColor="#f8d8b8" {...props} />; }

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
    'It feels a little strange to think that we have known each other for more than six years. That is a lot of time, a lot of growing up, and a lot of life lived along the way.',
    'We have had good days and difficult ones. There have been times when things felt easy, and times when we struggled to understand each other or figure out what came next. We have not always had everything worked out, but the time we have shared has meant a great deal to me.',
    'I wanted to make something for your birthday that was just for you. Not because everything in life needs to be perfect or because we need to have every answer right now, but because your birthday deserves to be celebrated, and I genuinely wanted you to feel special.',
    'One thing I truly hope you know is that I want good things for you. I hope your hard work takes you somewhere you are proud of. I hope you find peace in your decisions, confidence in yourself, and happiness in the life you build. I hope you keep your kind heart, your cute little charm, and that stubborn, fiery side that makes you so unmistakably you.',
    'There may be things we still need to figure out as life moves forward. We do not have to put all those questions into today. Today is your birthday, and I hope you can enjoy it for what it is: another year of your life, another chance to grow, and another reason to celebrate the person you are.',
    'Thank you for the time we have shared and for the place you have had in my life. I will always treat that part of my story with care and respect.',
    'For this new year of your life, I wish you happiness that feels genuine, success that you can be proud of, good health, peaceful days, and plenty of reasons to smile.',
    'Happy Birthday, Amina. I hope today is kind to you, and I hope the year ahead brings you many beautiful things.',
  ],
  closing: 'With warmth, care, and respect.',
};

function Letter({ progressRef, reduced, mobile }) {
  const group = useRef();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1650;
    const c = canvas.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 1200, 1650);
    grad.addColorStop(0, '#fdfaf6'); grad.addColorStop(.55, '#fef8f4'); grad.addColorStop(1, '#f8eff5');
    c.fillStyle = grad; c.fillRect(0, 0, 1200, 1650);
    for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(107,74,126,${(i % 4) * .007})`; c.fillRect((i * 71) % 1200, (i * 137) % 1650, 2, 2); }

    // Double border: gold outer, lilac inner
    c.strokeStyle = '#d8b56d'; c.lineWidth = 4; c.strokeRect(44, 44, 1112, 1562);
    c.strokeStyle = '#c9b0e8'; c.lineWidth = 1.5; c.strokeRect(56, 56, 1088, 1538);

    // Heart motif & Header
    c.textAlign = 'center';
    c.fillStyle = '#9b7cc4'; c.font = '36px Georgia'; c.fillText('♡', 600, 115);
    c.fillStyle = '#6b4a7e'; c.font = 'italic 46px Georgia'; c.fillText(LETTER_COPY.heading, 600, 172);
    c.fillStyle = '#d8b56d'; c.fillRect(520, 196, 160, 1.5);

    // Paragraph wrapping with 20.5px Georgia and 31px line-height
    c.fillStyle = '#3a2245';
    c.font = 'italic 20.5px Georgia';
    const wrap = (text, maxWidth) => {
      const words = text.split(/\s+/); const lines = []; let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (c.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line); return lines;
    };

    let y = 248;
    for (const paragraph of LETTER_COPY.paragraphs) {
      const lines = wrap(paragraph, 940);
      for (const line of lines) { c.fillText(line, 600, y); y += 31; }
      y += 12;
    }

    // Signoff & Closing
    c.fillStyle = '#c9b0e8'; c.fillRect(520, y + 6, 160, 1.5);
    y += 46;
    c.fillStyle = '#6b4a7e'; c.font = 'italic 30px Georgia';
    c.fillText(LETTER_COPY.closing, 600, y);
    c.fillStyle = '#9b7cc4'; c.font = '28px Georgia';
    c.fillText('♡', 600, y + 42);

    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    if (!group.current) return;
    const p = progressRef.current;
    const rise = smooth(0.48, 0.96, p);
    group.current.visible = rise > 0.001;
    if (rise <= 0.001) return;

    const targetY = mobile ? 1.50 : 1.68;
    const targetZ = mobile ? 1.20 : 1.35;
    const targetScale = mobile ? 0.67 : 0.82;

    group.current.position.y = 0.35 + rise * (targetY - 0.35);
    group.current.position.z = 0.05 + rise * (targetZ - 0.05);
    group.current.rotation.x = -0.55 + rise * 0.55;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.008;
    group.current.scale.setScalar(0.20 + rise * (targetScale - 0.20));
  });

  return (
    <group ref={group} position={[0, 0.35, 0.05]} visible={false}>
      {/* Backing paper card substrate */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.08, 2.86, 0.024]} />
        <meshStandardMaterial color="#f8edf4" roughness={0.92} />
      </mesh>
      {/* Front letter printed surface with polygonOffset to prevent any flicker */}
      <mesh position={[0, 0, 0.016]} receiveShadow>
        <planeGeometry args={[2.04, 2.82]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.92}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </group>
  );
}

export default function GiftScene({ open, reduced, mobile }) {
  const box = useRef();
  const lid = useRef();
  const bow = useRef();
  const light = useRef();
  const glow = useRef();
  const progress = useRef(0);

  useFrame((state, dt) => {
    if (!box.current || !lid.current || !bow.current || !light.current || !glow.current) return;
    progress.current = open
      ? Math.min(1, progress.current + dt / (reduced ? 0.3 : 2.4))
      : Math.max(0, progress.current - dt / 1.0);
    const p = progress.current;
    const t = state.clock.elapsedTime;

    // Box gentle hovering without sudden twist
    box.current.position.y = reduced ? 0 : Math.sin(t * 0.9) * 0.025;
    box.current.rotation.y = -0.22 + (reduced ? 0 : Math.sin(t * 0.35) * 0.03);

    // 1. Bow unlocks & wobbles subtly during initial opening
    const wobble = (1 - smooth(0.04, 0.22, p)) * smooth(0, 0.04, p);
    bow.current.scale.setScalar(1 + Math.sin(p * 50) * 0.08 * wobble);
    bow.current.rotation.z = Math.sin(p * 35) * 0.12 * wobble;

    // 2. Gift Box Top Lid opens wide backward cleanly!
    lid.current.position.y = H + smooth(0.12, 0.28, p) * 0.22;
    lid.current.position.z = (-W / 2 - 0.04) - smooth(0.18, 0.48, p) * 0.14;
    lid.current.rotation.x = -smooth(0.15, 0.48, p) * 2.15; // ~123 degrees swing open!

    // 3. Inside of box lights up with glowing birthday radiance!
    light.current.intensity = smooth(0.24, 0.54, p) * 20;
    glow.current.material.opacity = smooth(0.26, 0.58, p) * 0.95;
  });

  return <group position={[0, -0.6, 0]}>
    <spotLight position={[2.5, 5, 3.5]} angle={.42} penumbra={.9} intensity={60} color="#f6e8d6" castShadow shadow-mapSize={mobile ? 512 : 1024} shadow-bias={-.0004} />
    <spotLight position={[-3, 2.5, -3]} angle={.6} penumbra={1} intensity={35} color="#d58ba8" />
    <pointLight position={[-2, 1, 2]} intensity={4} color="#d8b56d" distance={6} />
    <Glow color="#8e526d" scale={8} opacity={.6} position={[0, 1.2, -2.5]} />
    <ParticleField count={mobile ? 120 : 260} inner={1.8} outer={8} size={.06} color="#f0a9bf" opacity={.65} drift={reduced ? 0 : .015} seed={11} />

    <mesh position={[0, -.3, 0]} castShadow receiveShadow><cylinderGeometry args={[1.35, 1.45, .6, 96]} /><meshPhysicalMaterial color="#4f3358" roughness={.8} sheen={1} sheenColor="#8f74ad" /></mesh>
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, .018, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.25} /></mesh>
    <mesh position={[0, -.6, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, .014, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.3} /></mesh>
    <ContactShadows position={[0, -.605, 0]} scale={mobile ? 4.5 : 5.2} blur={0.8} opacity={0.82} far={1.5} color="#09040d" />
    <ContactShadows position={[0, -.6, 0]} scale={mobile ? 7.5 : 9} blur={2.8} opacity={0.45} far={3} color="#180b22" />

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
    <Letter progressRef={progress} reduced={reduced} mobile={mobile} />
  </group>;
}
