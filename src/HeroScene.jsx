import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glow, ParticleField } from './three-utils.jsx';

// 16 Key stars of Scorpius mapped into rich 3D astronomical coordinates
const SCORPIO_STARS = [
  // Claws & Head (Beta, Delta, Pi, Nu)
  { name: 'Graffias (Beta Sco)', pos: [-1.45, 1.35, -0.15], color: '#b5ccff', size: 0.09 },
  { name: 'Dschubba (Delta Sco)', pos: [-0.95, 1.05, 0.05], color: '#c5d8ff', size: 0.10 },
  { name: 'Pi Scorpii', pos: [-1.6, 0.75, -0.2], color: '#a8c2ff', size: 0.075 },
  { name: 'Jabbah (Nu Sco)', pos: [-1.25, 1.62, -0.1], color: '#b0c8ff', size: 0.07 },
  // Head to Heart (Sigma Sco -> Antares)
  { name: 'Alniyat (Sigma Sco)', pos: [-0.52, 0.55, 0.12], color: '#c0d5ff', size: 0.085 },
  { name: 'Antares (Alpha Sco - Heart)', pos: [0.0, 0.18, 0.32], color: '#ff5522', size: 0.17, isAntares: true },
  // Spine & Body (Tau, Epsilon, Mu, Zeta, Eta)
  { name: 'Tau Scorpii', pos: [0.4, -0.18, 0.16], color: '#c0d5ff', size: 0.08 },
  { name: 'Wei (Epsilon Sco)', pos: [0.74, -0.58, 0.06], color: '#ffd29e', size: 0.09 },
  { name: 'Mu Scorpii', pos: [0.88, -1.05, -0.08], color: '#b0c8ff', size: 0.08 },
  { name: 'Zeta Scorpii', pos: [0.76, -1.52, -0.18], color: '#ffd29e', size: 0.08 },
  { name: 'Eta Scorpii', pos: [0.4, -1.9, -0.1], color: '#c0d5ff', size: 0.08 },
  // Tail & Stinger hook (Theta, Iota, Kappa, Lambda/Shaula, Upsilon/Lesath)
  { name: 'Sargas (Theta Sco)', pos: [-0.22, -2.08, 0.05], color: '#ffd090', size: 0.10 },
  { name: 'Iota Scorpii', pos: [-0.88, -1.98, 0.16], color: '#c0d5ff', size: 0.08 },
  { name: 'Kappa Scorpii', pos: [-1.32, -1.68, 0.24], color: '#c0d5ff', size: 0.08 },
  { name: 'Shaula (Lambda Sco - Stinger)', pos: [-1.52, -1.18, 0.35], color: '#9bc2ff', size: 0.135, isStinger: true },
  { name: 'Lesath (Upsilon Sco)', pos: [-1.7, -0.96, 0.38], color: '#b0c8ff', size: 0.09, isStinger: true },
];

const CONSTELLATION_EDGES = [
  // Claws
  [0, 1], // Graffias -> Dschubba
  [1, 2], // Dschubba -> Pi
  [0, 3], // Graffias -> Jabbah
  // Head to Heart
  [1, 4], // Dschubba -> Alniyat
  [4, 5], // Alniyat -> Antares
  // Body spine
  [5, 6], // Antares -> Tau
  [6, 7], // Tau -> Wei
  [7, 8], // Wei -> Mu
  [8, 9], // Mu -> Zeta
  [9, 10], // Zeta -> Eta
  // Stinger curve
  [10, 11], // Eta -> Sargas
  [11, 12], // Sargas -> Iota
  [12, 13], // Iota -> Kappa
  [13, 14], // Kappa -> Shaula
  [14, 15], // Shaula -> Lesath
  [13, 15], // Kappa -> Lesath closure
];

function ScorpioConstellation({ reduced, mobile }) {
  const group = useRef();
  const antaresGlow = useRef();

  const lineGeometry = useMemo(() => {
    const points = [];
    CONSTELLATION_EDGES.forEach(([i, j]) => {
      points.push(new THREE.Vector3(...SCORPIO_STARS[i].pos));
      points.push(new THREE.Vector3(...SCORPIO_STARS[j].pos));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      group.current.rotation.y = Math.sin(t * 0.22) * 0.1;
      group.current.rotation.x = 0.04 + Math.sin(t * 0.18) * 0.05;
      group.current.position.y = Math.sin(t * 0.32) * 0.04;
    }
    if (antaresGlow.current) {
      antaresGlow.current.scale.setScalar(1.4 + Math.sin(t * 2.4) * 0.25);
    }
  });

  return (
    <group ref={group} scale={mobile ? 0.44 : 0.54}>
      {/* Luminous Constellation Lines - Golden Laser */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#e8c4a0" transparent opacity={0.7} linewidth={1.5} />
      </lineSegments>

      {/* Secondary Cosmic Lilac Aura Lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#c9b0e8" transparent opacity={0.3} linewidth={3} />
      </lineSegments>

      {/* 3D Stars of Scorpius */}
      {SCORPIO_STARS.map((star, idx) => (
        <group key={idx} position={star.pos}>
          <mesh castShadow>
            <sphereGeometry args={[star.size, 16, 16]} />
            <meshStandardMaterial
              color={star.color}
              emissive={star.color}
              emissiveIntensity={star.isAntares ? 1.8 : 0.9}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>

          {/* Antares (Red Supergiant Heart of the Scorpion) Specialized Pulsating Aura */}
          {star.isAntares && (
            <group ref={antaresGlow}>
              <Glow color="#ff4411" scale={2.0} opacity={0.88} />
              <Glow color="#ffd700" scale={1.0} opacity={0.92} />
              <pointLight color="#ff6633" intensity={3.5} distance={5} decay={2} />
            </group>
          )}

          {/* Shaula & Lesath (The Stinger) Specialized Electric Aura */}
          {star.isStinger && (
            <Glow color="#7aaaff" scale={1.2} opacity={0.65} />
          )}
        </group>
      ))}

      {/* 3D Golden Scorpio Zodiac Glyph Medallion at the heart of the constellation */}
      <ScorpioGlyph3D mobile={mobile} />
    </group>
  );
}

function ScorpioGlyph3D({ mobile }) {
  const glyphRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  // High-res canvas texture with golden Scorpio zodiac symbol ♏
  const glyphTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const c = canvas.getContext('2d');

    // Deep celestial medallion background
    const bgGrad = c.createRadialGradient(256, 256, 40, 256, 256, 240);
    bgGrad.addColorStop(0, 'rgba(48, 28, 68, 0.95)');
    bgGrad.addColorStop(0.7, 'rgba(28, 16, 42, 0.95)');
    bgGrad.addColorStop(1, 'rgba(18, 10, 28, 0.98)');
    c.fillStyle = bgGrad;
    c.beginPath();
    c.arc(256, 256, 236, 0, Math.PI * 2);
    c.fill();

    // Outer double gold borders
    c.strokeStyle = '#e8c4a0';
    c.lineWidth = 8;
    c.stroke();

    c.strokeStyle = 'rgba(201, 176, 232, 0.6)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(256, 256, 218, 0, Math.PI * 2);
    c.stroke();

    // Subtle star dots on the border
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x = 256 + Math.cos(angle) * 227;
      const y = 256 + Math.sin(angle) * 227;
      c.fillStyle = '#ffd700';
      c.beginPath();
      c.arc(x, y, 3, 0, Math.PI * 2);
      c.fill();
    }

    // Glowing Golden Scorpio Symbol ♏
    c.save();
    c.shadowColor = '#ffd700';
    c.shadowBlur = 28;
    c.fillStyle = '#ffe9b8';
    c.font = 'bold 240px Georgia, "Segoe UI Symbol", serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('♏', 256, 260);
    c.restore();

    // Secondary crisp stroke on the glyph
    c.strokeStyle = '#d4af37';
    c.lineWidth = 3;
    c.font = 'bold 240px Georgia, "Segoe UI Symbol", serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.strokeText('♏', 256, 260);

    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame((state, dt) => {
    if (!glyphRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow 3D rotation showcasing depth and specular shine
    glyphRef.current.rotation.y = t * 0.42;
    glyphRef.current.rotation.x = Math.sin(t * 0.35) * 0.12;
    glyphRef.current.position.y = 0.12 + Math.sin(t * 0.6) * 0.04;

    // Gyroscopic outer rings spinning around the medallion
    if (ring1.current) ring1.current.rotation.z += dt * 0.6;
    if (ring2.current) ring2.current.rotation.x += dt * 0.45;
  });

  return (
    <group ref={glyphRef} position={[-0.1, 0.12, 0]} scale={mobile ? 1.05 : 1.25}>
      {/* 3D Round Metallic Gold Medallion - oriented to face viewer */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 64]} />
        <meshPhysicalMaterial
          color="#d4af37"
          metalness={0.92}
          roughness={0.18}
          clearcoat={1.0}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Front Face with Scorpio Glyph (Facing Camera along +Z) */}
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[1.04, 1.04]} />
        <meshBasicMaterial map={glyphTexture} transparent opacity={0.98} toneMapped={false} />
      </mesh>

      {/* Back Face with Scorpio Glyph (Facing Away along -Z) */}
      <mesh position={[0, 0, -0.027]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.04, 1.04]} />
        <meshBasicMaterial map={glyphTexture} transparent opacity={0.98} toneMapped={false} />
      </mesh>

      {/* 3D Gyroscopic Orbital Ring 1 */}
      <group ref={ring1} rotation={[Math.PI / 3.2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.82, 0.012, 12, 96]} />
          <meshStandardMaterial color="#e8c4a0" metalness={0.9} roughness={0.2} emissive="#ffd700" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* 3D Gyroscopic Orbital Ring 2 */}
      <group ref={ring2} rotation={[0, Math.PI / 2.8, Math.PI / 5]}>
        <mesh>
          <torusGeometry args={[0.96, 0.008, 12, 96]} />
          <meshBasicMaterial color="#c9b0e8" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Medallion Golden Aura */}
      <Glow color="#e8c4a0" scale={2.2} opacity={0.45} />
    </group>
  );
}

// Celestial Rings with the Beloved Orbiting Golden Moon
function CelestialRingsWithMoon({ reduced, mobile }) {
  const group = useRef();
  const moon = useRef();

  useFrame((state, dt) => {
    if (!reduced && group.current) group.current.rotation.z += dt * 0.038;
    const t = state.clock.elapsedTime * (reduced ? 0 : 0.28);
    if (moon.current) {
      moon.current.position.set(Math.cos(t) * 2.38, Math.sin(t) * 2.38, 0);
    }
  });

  return (
    <group rotation={[1.18, 0.12, 0.35]} scale={mobile ? 0.45 : 0.55}>
      <group ref={group}>
        {/* Ring 1 - Golden orbit */}
        <mesh>
          <torusGeometry args={[2.38, 0.007, 8, 220]} />
          <meshBasicMaterial color="#e8c4a0" transparent opacity={0.8} toneMapped={false} />
        </mesh>
        {/* Ring 2 - Soft Lilac outer orbit */}
        <mesh>
          <torusGeometry args={[3.0, 0.004, 6, 220]} />
          <meshBasicMaterial color="#c9b0e8" transparent opacity={0.32} />
        </mesh>
        {/* Ring 3 - Tilted golden arc */}
        <mesh rotation={[0, 0, 0.6]}>
          <torusGeometry args={[3.65, 0.003, 6, 220, Math.PI * 1.25]} />
          <meshBasicMaterial color="#e8c4a0" transparent opacity={0.25} />
        </mesh>
        {/* Orbiting Golden Moon */}
        <group ref={moon}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#fff4df" toneMapped={false} />
          </mesh>
          <Glow color="#ffd700" scale={1.0} opacity={0.9} />
        </group>
      </group>
    </group>
  );
}

export default function HeroScene({ reduced, mobile }) {
  return (
    <group position={[0, 0, -0.6]}>
      {/* Full-density starlight particle fields across whole cosmos */}
      <ParticleField
        count={mobile ? 600 : 1400}
        inner={7}
        outer={28}
        size={0.085}
        opacity={0.75}
        drift={reduced ? 0 : 0.006}
        seed={2}
      />
      <ParticleField
        count={mobile ? 70 : 150}
        inner={1.8}
        outer={7}
        size={0.07}
        color="#e8c4a0"
        opacity={0.78}
        drift={reduced ? 0 : 0.02}
        seed={5}
      />
      <ParticleField
        count={mobile ? 35 : 75}
        inner={1.0}
        outer={4.2}
        size={0.15}
        color="#c9b0e8"
        opacity={0.32}
        drift={reduced ? 0 : -0.015}
        seed={9}
      />

      {/* Floating 3D Scorpio Celestial System in the upper sky (Zero Overlap with Text) */}
      <group position={[0, mobile ? 1.05 : 1.22, 0]}>
        {/* Multi-layered cosmic nebulas centered behind the Scorpio constellation */}
        <Glow color="#5b3f7a" scale={6.5} opacity={0.65} position={[0, 0, -0.6]} />
        <Glow color="#b98a9d" scale={3.8} opacity={0.35} position={[0, 0, -0.4]} />
        <Glow color="#e8c4a0" scale={1.9} opacity={0.42} position={[0, 0, -0.2]} />

        {/* Orbiting celestial rings with orbiting glowing moon */}
        <CelestialRingsWithMoon reduced={reduced} mobile={mobile} />

        {/* Astronomical 3D Scorpio Constellation + 3D Golden Medallion */}
        <ScorpioConstellation reduced={reduced} mobile={mobile} />
      </group>

      <fog attach="fog" args={[new THREE.Color('#171221'), 12, 34]} />
    </group>
  );
}
