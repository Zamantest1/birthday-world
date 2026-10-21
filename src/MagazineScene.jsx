import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const spreads = [
  { title: 'The little things', lines: ['The tiny moments that', 'somehow become the', 'biggest memories.'], note: 'Some moments are small.', end: 'The way they stay with us is not.', photo: '/images/keepsake.png' },
  { title: 'Your kind of magic', lines: ['The way you make ordinary', 'days feel a little', 'more golden.'], note: 'A thousand ordinary days.', end: 'Extraordinary, because of you.', photo: '/images/keepsake.png' },
  { title: 'A note for you', lines: ['The world got a little', 'brighter on the day', 'you arrived.'], note: 'Here’s to your next chapter.', end: 'And all the beauty still to come.', photo: '/images/keepsake.png' },
];
function makePage(page, left, image) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const c = canvas.getContext('2d'); c.fillStyle = '#f6f0e8'; c.fillRect(0, 0, 768, 1024);
  for (let i = 0; i < 8000; i++) { c.fillStyle = `rgba(84,55,45,${(i % 3) * .008})`; c.fillRect((i * 83.13) % 768, (i * 37.31) % 1024, 2, 2); }
  c.fillStyle = '#8b6a56'; c.font = '18px sans-serif'; c.textAlign = 'center';
  c.fillText(left ? 'THE BIRTHDAY EDITION' : `CHAPTER 0${page + 1}`, 384, 80);
  c.strokeStyle = '#d4c2ac'; c.beginPath(); c.moveTo(60, 108); c.lineTo(708, 108); c.stroke();
  const data = spreads[page];
  if (left) {
    c.drawImage(image, 70, 155, 628, 680);
    c.fillStyle = '#5c3d4b'; c.font = 'italic 33px Georgia'; c.fillText(['A beautiful little life.', 'A little more golden.', 'For you. Always.'][page], 384, 901);
  } else {
    c.fillStyle = '#a77c83'; c.font = '54px Georgia'; c.fillText('♡', 384, 245);
    c.fillStyle = '#392638'; c.font = '52px Georgia';
    const title = data.title.split(' '); const split = Math.ceil(title.length / 2);
    c.fillText(title.slice(0, split).join(' '), 384, 358); c.fillText(title.slice(split).join(' '), 384, 425);
    c.font = 'italic 31px Georgia'; data.lines.forEach((line, i) => c.fillText(line, 384, 525 + i * 48));
    c.fillStyle = '#8d787c'; c.font = '22px sans-serif'; c.fillText(data.note, 384, 754); c.fillText(data.end, 384, 790);
    c.fillStyle = '#ad8b5d'; c.font = 'italic 26px Georgia'; c.fillText('— with love, always —', 384, 902);
  }
  c.fillStyle = '#8b6a56'; c.font = '17px sans-serif'; c.fillText(`0${page * 2 + (left ? 1 : 2)}`, 384, 978);
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function TurningPage({ from, to, textures, onDone, reduced }) {
  const group = useRef(); const progress = useRef(0); const done = useRef(false);
  const forward = to > from;
  const geometry = useMemo(() => { const g = new THREE.PlaneGeometry(1.75, 2.35, 40, 1); g.translate(.875, 0, 0); return g; }, []);
  const frontMap = forward ? textures[from][1] : textures[to][1];
  const backMap = useMemo(() => {
    const t = (forward ? textures[to][0] : textures[from][0]).clone();
    t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; return t;
  }, [forward, from, to, textures]);
  useEffect(() => () => { geometry.dispose(); backMap.dispose(); }, [geometry, backMap]);
  useFrame((_, dt) => {
    progress.current = Math.min(1, progress.current + dt / (reduced ? .05 : 1.35));
    const p = progress.current; const eased = p * p * (3 - 2 * p);
    group.current.rotation.y = forward ? -eased * Math.PI : -Math.PI + eased * Math.PI;
    const lift = Math.sin(eased * Math.PI);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const u = positions.getX(i) / 1.75;
      positions.setZ(i, (Math.sin(u * Math.PI * .9) * .22 + u * u * (forward ? -.18 : .18)) * lift);
    }
    positions.needsUpdate = true; geometry.computeVertexNormals();
    if (p === 1 && !done.current) { done.current = true; onDone(); }
  });
  return <group ref={group} position={[0, 0, .05]}>
    <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial map={frontMap} side={THREE.FrontSide} roughness={.96} /></mesh>
    <mesh geometry={geometry} castShadow><meshStandardMaterial map={backMap} side={THREE.BackSide} roughness={.96} /></mesh>
  </group>;
}
export default function MagazineScene({ page, turn, onTurnDone, reduced }) {
  const image = useTexture(spreads[page].photo);
  const textures = useMemo(() => spreads.map((_, i) => [makePage(i, true, image.image), makePage(i, false, image.image)]), [image]);
  useEffect(() => () => textures.flat().forEach(t => t.dispose()), [textures]);
  const leftPage = turn ? (turn.to < turn.from ? turn.to : turn.from) : page;
  const rightPage = turn ? (turn.to > turn.from ? turn.to : turn.from) : page;
  return <group position={[0, .05, 0]} rotation={[-.48, -.08, -.04]}>
    <mesh position={[0, 0, -.07]} castShadow><boxGeometry args={[3.66, 2.48, .1]} /><meshStandardMaterial color="#83646c" roughness={.8} /></mesh>
    {[-1, 1].map(side => <group key={side} position={[side * .89, 0, 0]}>
      <mesh castShadow><boxGeometry args={[1.75, 2.35, .09]} /><meshStandardMaterial color="#e4d7c5" roughness={.95} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0, 0, -.04 + i * .013]}><boxGeometry args={[1.76, 2.36, .002]} /><meshStandardMaterial color="#bbae9e" /></mesh>)}
      <mesh position={[0, 0, .048]} receiveShadow><planeGeometry args={[1.75, 2.35]} /><meshStandardMaterial map={textures[side === -1 ? leftPage : rightPage][side === -1 ? 0 : 1]} roughness={.96} /></mesh>
    </group>)}
    <mesh position={[0, 0, .025]}><cylinderGeometry args={[.025, .025, 2.38, 12]} /><meshStandardMaterial color="#a59582" /></mesh>
    {turn && <TurningPage key={`${turn.from}-${turn.to}`} {...turn} textures={textures} onDone={onTurnDone} reduced={reduced} />}
  </group>;
}
