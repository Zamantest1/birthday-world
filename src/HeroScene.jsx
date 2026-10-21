import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glow, ParticleField } from './three-utils.jsx';

function CelestialRing({ reduced }) {
  const group = useRef(); const moon = useRef();
  useFrame((state, dt) => {
    if (!reduced) group.current.rotation.z += dt * .04;
    const t = state.clock.elapsedTime * (reduced ? 0 : .25);
    moon.current.position.set(Math.cos(t) * 2.35, Math.sin(t) * 2.35, 0);
  });
  return <group rotation={[1.2, .1, .35]}>
    <group ref={group}>
      <mesh><torusGeometry args={[2.35, .007, 8, 220]} /><meshBasicMaterial color="#d8b56d" transparent opacity={.85} toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[2.95, .003, 6, 220]} /><meshBasicMaterial color="#dccfe8" transparent opacity={.28} /></mesh>
      <mesh rotation={[0, 0, .6]}><torusGeometry args={[3.6, .002, 6, 220, Math.PI * 1.2]} /><meshBasicMaterial color="#d8b56d" transparent opacity={.22} /></mesh>
      <group ref={moon}>
        <mesh><sphereGeometry args={[.05, 16, 16]} /><meshBasicMaterial color="#fff1cf" toneMapped={false} /></mesh>
        <Glow color="#f1cf86" scale={.7} opacity={.9} />
      </group>
    </group>
  </group>;
}

export default function HeroScene({ reduced, mobile }) {
  return <group position={[0, .1, -1]}>
    <Glow color="#5b3f7a" scale={9} opacity={.55} />
    <Glow color="#b98a9d" scale={4.5} opacity={.28} />
    <Glow color="#d8b56d" scale={1.6} opacity={.35} />
    <CelestialRing reduced={reduced} />
    <ParticleField count={mobile ? 600 : 1500} inner={8} outer={30} size={.09} opacity={.75} drift={reduced ? 0 : .006} seed={2} />
    <ParticleField count={mobile ? 60 : 140} inner={2} outer={7} size={.07} color="#e8c77f" opacity={.7} drift={reduced ? 0 : .02} seed={5} />
    <ParticleField count={mobile ? 30 : 70} inner={1.2} outer={4} size={.16} color="#dccfe8" opacity={.25} drift={reduced ? 0 : -.015} seed={9} />
    <fog attach="fog" args={[new THREE.Color('#171221'), 12, 34]} />
  </group>;
}
