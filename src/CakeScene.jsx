import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float, OrbitControls, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

function Candle({ blownOut }) {
  return (
    <group position={[0, 1.15, 0]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 24]} />
        <meshStandardMaterial color="#f8efe3" roughness={0.38} />
      </mesh>
      {[0, 1, 2, 3, 4].map((n) => (
        <mesh key={n} position={[0, 0.18 - n * 0.075, 0.056]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.12, 0.018, 0.008]} />
          <meshStandardMaterial color="#d8b56d" roughness={0.5} />
        </mesh>
      ))}
      {!blownOut && (
        <Float speed={4} rotationIntensity={0.12} floatIntensity={0.12}>
          <mesh position={[0, 0.48, 0]} scale={[0.09, 0.16, 0.09]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color="#ffb24a" />
          </mesh>
          <pointLight position={[0, 0.48, 0]} color="#ffb24a" intensity={1.6} distance={2.2} />
        </Float>
      )}
      {blownOut && <Sparkles count={9} scale={[0.4, 0.6, 0.4]} size={2} speed={0.2} color="#c9b9d1" position={[0, 0.48, 0]} />}
    </group>
  );
}

function Cake({ blownOut, sliceServed }) {
  return (
    <group>
      <mesh position={[0, -0.72, 0]} receiveShadow>
        <cylinderGeometry args={[1.78, 1.72, 0.14, 96]} />
        <meshStandardMaterial color="#d9c8b7" roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.55, 1.18, 96]} />
        <meshStandardMaterial color="#f0dccc" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.57, 0]} castShadow>
        <cylinderGeometry args={[1.54, 1.54, 0.15, 96]} />
        <meshStandardMaterial color="#fffaf4" roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <torusGeometry args={[1.49, 0.075, 14, 96]} />
        <meshStandardMaterial color="#fffaf4" roughness={0.28} />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.43, 0.42, Math.sin(angle) * 1.43]} castShadow>
            <sphereGeometry args={[0.095, 16, 16]} />
            <meshStandardMaterial color="#fffaf4" roughness={0.32} />
          </mesh>
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.18, 0.655, Math.sin(angle) * 1.18]} scale={[0.045, 0.018, 0.045]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={i % 2 ? '#d8b56d' : '#b98a9d'} />
          </mesh>
        );
      })}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.67, 0]} scale={[0.26, 0.02, 0.26]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshStandardMaterial color="#fffaf4" />
        </mesh>
      </group>
      <Candle blownOut={blownOut} />
      {sliceServed && (
        <group position={[1.8, -0.2, 0.8]} rotation={[0, -0.55, 0]}>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, -0.12]} castShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.68, 3, 1, false, Math.PI / 2]} />
            <meshStandardMaterial color="#f0dccc" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[0, 0, -0.12]}>
            <cylinderGeometry args={[0.45, 0.45, 0.09, 3, 1, false, Math.PI / 2]} />
            <meshStandardMaterial color="#fffaf4" roughness={0.3} />
          </mesh>
          <mesh position={[0.05, 0.52, 0.02]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#b45f71" roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function CakeScene({ blownOut, sliceServed }) {
  return (
    <div className="cake-canvas" aria-label="Interactive 3D birthday cake">
      <Canvas shadows dpr={[1, 1.6]} camera={{ position: [4.1, 3.5, 6.4], fov: 38 }}>
        <color attach="background" args={['#f6f0e8']} />
        <fog attach="fog" args={['#f6f0e8', 9, 18]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 7, 5]} intensity={2.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-4, 2, -3]} color="#e4c9ed" intensity={1.2} />
        <Suspense fallback={null}>
          <Cake blownOut={blownOut} sliceServed={sliceServed} />
          <ContactShadows position={[0, -0.82, 0]} opacity={0.28} scale={7} blur={2.8} far={3} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.85} maxPolarAngle={1.65} minAzimuthAngle={-0.75} maxAzimuthAngle={0.75} />
      </Canvas>
      <div className="cake-icing-note">Someone I love<br />was born today <span>♥</span></div>
    </div>
  );
}