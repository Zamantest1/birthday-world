import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import HeroScene from './HeroScene.jsx';
import CakeScene from './CakeScene.jsx';
import MagazineScene from './MagazineScene.jsx';
import GiftScene from './GiftScene.jsx';
import { Glow, Motes, ParticleField } from './three-utils.jsx';

const BACKGROUNDS = ['#171221', '#21182c', '#1a1322', '#150f1d'];

function shotFor({ scene, candleOut, sliceServed, turn, giftOpen }) {
  if (scene === 0) return { pos: [0, 0, 7.4], look: [0, 0, 0], k: 1.25 };
  if (scene === 1) {
    if (sliceServed) return { pos: [-.4, 2.3, 5.2], look: [-.75, .1, .7], k: 1.7 };
    return candleOut ? { pos: [1.5, 2.15, 4.9], look: [0, .45, 0], k: 1.7 } : { pos: [2.1, 2.45, 5.4], look: [0, .45, 0], k: 1.7 };
  }
  if (scene === 2) return turn ? { pos: [0, 1.85, 4.15], look: [0, .05, 0], k: 1.95 } : { pos: [0, 1.7, 4.3], look: [0, 0, 0], k: 1.95 };
  return giftOpen ? { pos: [.3, 2.2, 5.6], look: [0, 1.15, 0], k: 1.65 } : { pos: [.6, 1.5, 5.4], look: [0, .35, 0], k: 1.6 };
}

function CameraRig({ state, reduced }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const first = useRef(true);

  useEffect(() => {
    const shot = shotFor(state);
    const entry = new THREE.Vector3(...shot.pos).sub(new THREE.Vector3(...shot.look)).multiplyScalar(reduced ? 1 : 1.55);
    camera.position.copy(new THREE.Vector3(...shot.look).add(entry)).add(new THREE.Vector3(0, reduced ? 0 : .6, 0));
    look.current.set(...shot.look).add(new THREE.Vector3(0, reduced ? 0 : .4, 0));
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.scene]);

  useFrame((three, dt) => {
    if (state.scene === 1) return;
    const shot = shotFor(state);
    const aspect = size.width / size.height;
    const fit = aspect < 1 ? THREE.MathUtils.clamp(shot.k / Math.max(aspect, .42) * .5, 1, shot.k) : aspect < 1.25 ? 1.15 : 1;
    lookTarget.current.set(...shot.look);
    target.current.set(...shot.pos).sub(lookTarget.current).multiplyScalar(fit).add(lookTarget.current);
    if (!reduced) {
      const t = three.clock.elapsedTime;
      target.current.x += three.pointer.x * .32 + Math.sin(t * .21) * .08;
      target.current.y += three.pointer.y * .18 + Math.sin(t * .17) * .05;
    }
    const speed = reduced ? 8 : 1.6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, speed, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, speed, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, speed, dt);
    look.current.lerp(lookTarget.current, 1 - Math.exp(-dt * speed));
    camera.lookAt(look.current);
  });
  return null;
}

function Background({ scene }) {
  const { scene: three } = useThree();
  const color = useRef(new THREE.Color(BACKGROUNDS[0]));
  const goal = useRef(new THREE.Color());
  useEffect(() => { three.background = color.current; }, [three]);
  useFrame((_, dt) => { goal.current.set(BACKGROUNDS[scene]); color.current.lerp(goal.current, 1 - Math.exp(-dt * 2)); });
  return null;
}

function CakeStage({ candleOut, sliceServed, reduced, mobile }) {
  const warm = useRef();
  useFrame((_, dt) => { warm.current.intensity = THREE.MathUtils.damp(warm.current.intensity, candleOut ? 6 : 14, 2, dt); });
  return <group>
    <spotLight position={[3, 5.5, 4]} angle={.4} penumbra={.85} intensity={75} color="#fbeedd" castShadow shadow-mapSize={mobile ? 1024 : 2048} shadow-bias={-.0003} shadow-normalBias={.02} />
    <spotLight position={[-3.5, 3, -3.5]} angle={.55} penumbra={1} intensity={55} color="#a184d1" />
    <pointLight ref={warm} position={[-2.6, 1.2, 1.8]} intensity={14} color="#d8b56d" distance={7} />
    <Glow color="#5a3f7c" scale={7.5} opacity={.6} position={[0, .6, -2.6]} />
    <Glow color="#b98a9d" scale={3.6} opacity={.18} position={[0, .3, -2.2]} />
    <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[9, 64]} /><meshStandardMaterial color="#251a30" roughness={.92} /></mesh>
    <mesh position={[0, -1.055, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.1, 2.13, 128]} /><meshBasicMaterial color="#d8b56d" transparent opacity={.28} toneMapped={false} /></mesh>
    <ContactShadows position={[0, -1.05, 0]} scale={8} blur={2.4} opacity={.65} far={2.5} color="#07040a" />
    <CakeScene blownOut={candleOut} sliceServed={sliceServed} reduced={reduced} />
    <Motes active={candleOut} origin={[0, 1.35, -.42]} spread={.2} height={1.8} count={mobile ? 26 : 46} speed={.55} size={.05} />
    <ParticleField count={mobile ? 90 : 200} inner={4} outer={12} size={.06} color="#e8c77f" opacity={.4} drift={reduced ? 0 : .008} seed={4} />
  </group>;
}

export default function World({ state, reduced, mobile, onTurnDone }) {
  const { scene } = state;
  return <>
    <Background scene={scene} />
    <CameraRig state={state} reduced={reduced} />
    <OrbitControls makeDefault enabled={scene === 1} enablePan={false} enableDamping dampingFactor={0.085} rotateSpeed={mobile ? 0.8 : 0.65} zoomSpeed={0.7} minDistance={3.6} maxDistance={8} minPolarAngle={Math.PI / 3.4} maxPolarAngle={Math.PI * 0.78} />
    <ambientLight intensity={.18} color="#dccfe8" />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={1.4} color="#f6f0e8" position={[3, 4, 3]} scale={[4, 2, 1]} />
      <Lightformer form="rect" intensity={.8} color="#9b7cc4" position={[-4, 2, -3]} scale={[4, 3, 1]} />
      <Lightformer form="ring" intensity={1} color="#d8b56d" position={[0, 3, -4]} scale={2} />
    </Environment>
    {scene === 0 && <HeroScene reduced={reduced} mobile={mobile} />}
    {scene === 1 && <CakeStage candleOut={state.candleOut} sliceServed={state.sliceServed} reduced={reduced} mobile={mobile} />}
    {scene === 2 && <Suspense fallback={null}>
      <spotLight position={[1.5, 5, 3]} angle={.5} penumbra={.9} intensity={45} color="#fbefe0" castShadow shadow-mapSize={1024} shadow-bias={-.0004} />
      <spotLight position={[-3, 2, -2]} angle={.6} penumbra={1} intensity={20} color="#9b7cc4" />
      <Glow color="#4f3570" scale={7} opacity={.5} position={[0, 0, -2.5]} />
      <ParticleField count={mobile ? 80 : 160} inner={3} outer={10} size={.05} color="#e8c77f" opacity={.4} drift={reduced ? 0 : .006} seed={7} />
      <Floating reduced={reduced}><MagazineScene page={state.page} turn={state.turn} onTurnDone={onTurnDone} reduced={reduced} /></Floating>
      <ContactShadows position={[0, -1.25, 0]} scale={7} blur={3} opacity={.55} far={2} color="#07040a" />
    </Suspense>}
    {scene === 3 && <GiftScene open={state.giftOpen} reduced={reduced} mobile={mobile} />}
  </>;
}

function Floating({ children, reduced }) {
  const ref = useRef();
  useFrame((s) => { if (!reduced) { ref.current.position.y = Math.sin(s.clock.elapsedTime * .7) * .04; ref.current.rotation.z = Math.sin(s.clock.elapsedTime * .4) * .01; } });
  return <group ref={ref}>{children}</group>;
}
