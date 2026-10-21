import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Motes, ParticleField, whenFontsReady } from './three-utils.jsx';

const W = 1.3; const H = 1; const T = .04;
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function Velvet(props) { return <meshPhysicalMaterial color="#5a2f4a" roughness={.85} sheen={1} sheenRoughness={.45} sheenColor="#dcb3c6" {...props} />; }
function Satin(props) { return <meshPhysicalMaterial color="#e2c486" roughness={.32} metalness={.35} clearcoat={.6} clearcoatRoughness={.3} {...props} />; }

function Bow({ bowRef }) {
  return <group ref={bowRef} position={[0, .21, W / 2 + .02]}>
    {[-1, 1].map(s => <mesh key={s} castShadow position={[s * .16, .07, 0]} rotation={[Math.PI / 2 - .25, s * .35, s * .5]} scale={[1, .55, 1]}><torusGeometry args={[.15, .04, 12, 32]} /><Satin /></mesh>)}
    {[-1, 1].map(s => <mesh key={`t${s}`} castShadow position={[s * .12, .01, .16]} rotation={[-.2, 0, s * .5]}><boxGeometry args={[.09, .012, .32]} /><Satin /></mesh>)}
    <mesh castShadow position={[0, .06, 0]}><sphereGeometry args={[.07, 16, 12]} /><Satin /></mesh>
  </group>;
}

function Message({ visible }) {
  const mesh = useRef(); const { viewport, camera } = useThree();
  const texture = useMemo(() => new THREE.CanvasTexture(document.createElement('canvas')), []);
  useEffect(() => {
    let alive = true;
    const draw = () => {
      const canvas = texture.image; canvas.width = 1600; canvas.height = 720;
      const c = canvas.getContext('2d'); c.clearRect(0, 0, 1600, 720); c.textAlign = 'center';
      c.shadowColor = 'rgba(216,181,109,.55)'; c.shadowBlur = 28;
      c.fillStyle = '#f6f0e8'; c.font = 'italic 500 118px "Playfair Display", Georgia, serif';
      c.fillText('You are my favourite', 800, 230); c.fillText('kind of wonderful.', 800, 375);
      c.shadowBlur = 0; c.fillStyle = '#d8b56d'; c.fillRect(740, 450, 120, 2);
      c.fillStyle = '#dccfe8'; c.font = '500 46px "DM Sans", sans-serif';
      c.fillText('Today, tomorrow, and all the days after.', 800, 545);
      texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
    };
    draw();
    whenFontsReady(['italic 500 118px "Playfair Display"', '500 46px "DM Sans"']).then(() => alive && draw());
    return () => { alive = false; texture.dispose(); };
  }, [texture]);
  useFrame((state, dt) => {
    const m = mesh.current; const target = visible ? 1 : 0;
    m.material.opacity = THREE.MathUtils.damp(m.material.opacity, target, 2.2, dt);
    const vp = viewport.getCurrentViewport(camera, m.getWorldPosition(new THREE.Vector3()));
    const fit = Math.min(1, (vp.width * .92) / 3.6);
    m.scale.setScalar(fit * (.92 + m.material.opacity * .08));
    m.position.y = 2.5 + (1 - m.material.opacity) * -.3 + Math.sin(state.clock.elapsedTime * .8) * .02;
    m.quaternion.copy(camera.quaternion);
    m.visible = m.material.opacity > .01;
  });
  return <mesh ref={mesh} position={[0, 2.5, 0]} visible={false}>
    <planeGeometry args={[3.6, 1.62]} />
    <meshBasicMaterial map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
  </mesh>;
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
    <spotLight position={[-3, 2.5, -3]} angle={.6} penumbra={1} intensity={35} color="#9d7cc8" />
    <pointLight position={[-2, 1, 2]} intensity={4} color="#d8b56d" distance={6} />
    <Glow color="#4a2f63" scale={8} opacity={.6} position={[0, 1.2, -2.5]} />
    <ParticleField count={mobile ? 120 : 260} inner={1.8} outer={8} size={.06} color="#e8c77f" opacity={.65} drift={reduced ? 0 : .015} seed={11} />

    <mesh position={[0, -.3, 0]} castShadow receiveShadow><cylinderGeometry args={[1.35, 1.45, .6, 96]} /><meshPhysicalMaterial color="#30223f" roughness={.8} sheen={1} sheenColor="#8f74ad" /></mesh>
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, .018, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.25} /></mesh>
    <mesh position={[0, -.6, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, .014, 10, 128]} /><meshStandardMaterial color="#d8b56d" metalness={.9} roughness={.3} /></mesh>
    <ContactShadows position={[0, -.6, 0]} scale={7} blur={2.6} opacity={.7} far={2} color="#08050c" />

    <group ref={box}>
      <mesh position={[0, T / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, T, W]} /><Velvet /></mesh>
      {[[0, -1], [0, 1], [1, 0], [-1, 0]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x * (W - T) / 2, H / 2, z * (W - T) / 2]} castShadow receiveShadow>
        <boxGeometry args={[x ? T : W, H, z ? T : W]} /><Velvet />
      </mesh>)}
      <mesh position={[0, H * .4, 0]}><boxGeometry args={[W - T * 2.2, H * .8, W - T * 2.2]} /><meshStandardMaterial color="#2a1626" roughness={1} side={THREE.BackSide} /></mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map(r => <mesh key={r} rotation={[0, r, 0]} position={[Math.sin(r) * (W / 2 + .004), H / 2, Math.cos(r) * (W / 2 + .004)]} castShadow><boxGeometry args={[.16, H, .008]} /><Satin /></mesh>)}
      <Glow ref={glow} color="#ffd38a" scale={2.4} opacity={0} position={[0, H + .1, 0]} />
      <pointLight ref={light} position={[0, H - .15, 0]} color="#ffc977" intensity={0} distance={4} decay={2} />
      <group ref={lid} position={[0, H, -W / 2 - .04]}>
        <group position={[0, 0, 0]}>
          <mesh position={[0, .1, W / 2 + .04]} castShadow receiveShadow><boxGeometry args={[W + .08, .2, W + .08]} /><Velvet color="#64354f" /></mesh>
          <mesh position={[0, .1, W / 2 + .04]} castShadow><boxGeometry args={[.17, .208, W + .088]} /><Satin /></mesh>
          <mesh position={[0, .1, W / 2 + .04]} castShadow><boxGeometry args={[W + .088, .208, .17]} /><Satin /></mesh>
          <Bow bowRef={bow} />
        </group>
      </group>
      <Motes active={open} mode="loop" origin={[0, H - .1, 0]} spread={.45} height={2.6} count={mobile ? 50 : 110} speed={.6} size={.05} />
    </group>
    <Message visible={open} />
  </group>;
}
