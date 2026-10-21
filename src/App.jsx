import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Sparkle, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';
import World from './World.jsx';
import { spreads } from './MagazineScene.jsx';
import { useBirthdayMicrophone, useSound } from './useSound.js';

const CHAPTERS = ['Enter', 'The cake', 'The keepsake', 'The gift'];
const ease = [0.22, 1, 0.36, 1];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update); return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

function Loader() {
  const { active, progress } = useProgress();
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!active && progress === 100) setReady(true); }, [active, progress]);
  return <AnimatePresence>{active && !ready && <motion.div className="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
    <span>Preparing your little world</span><i style={{ transform: `scaleX(${progress / 100})` }} />
  </motion.div>}</AnimatePresence>;
}

const reveal = (delay = 0) => ({ initial: { opacity: 0, y: 18, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: -10, filter: 'blur(4px)' }, transition: { duration: 1.1, delay, ease } });

function HeroCopy({ onEnter }) {
  return <div className="hero-copy">
    <motion.p className="kicker" {...reveal(.5)}>A birthday, made by hand</motion.p>
    <h1>
      <motion.span {...reveal(.8)}>Someone special</motion.span>
      <motion.span {...reveal(1.05)}>was <em>born today.</em></motion.span>
    </h1>
    <motion.p className="lede" {...reveal(1.5)}>So I made you a tiny universe.<br />Take your time. Every little thing is for you.</motion.p>
    <motion.button className="cta" onClick={onEnter} {...reveal(2.1)} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
      <span>Enter your little world</span><ArrowRight size={16} aria-hidden="true" />
    </motion.button>
  </div>;
}

function CakeCopy({ candleOut, sliceServed, mic, onListen, onManual, onServe }) {
  const hint = { requesting: 'Allow the microphone, then blow gently.', listening: 'Listening… blow softly toward your screen.', denied: 'Microphone unavailable — you can still put it out below.', unsupported: 'This browser can’t listen — you can still put it out below.', timeout: 'I didn’t quite catch that. Try once more.' }[mic.status];
  return <>
    <motion.div className="chapter-head" {...reveal(.3)}>
      <p className="kicker">Chapter 02</p>
      <h2>Make a <em>wish.</em></h2>
    </motion.div>
    <div className="action-dock">
      <AnimatePresence mode="wait">
        {!candleOut && <motion.div key="blow" className="dock-inner" {...reveal(.6)}>
          <button className="cta" onClick={onListen} disabled={mic.status === 'listening' || mic.status === 'requesting'}>
            <Mic size={16} aria-hidden="true" /><span>{mic.status === 'listening' ? 'Listening…' : 'Blow out the candle'}</span>
            {mic.status === 'listening' && <i className="pulse" aria-hidden="true" />}
          </button>
          <p className="hint" aria-live="polite">{hint || 'Close your eyes, make a wish, then blow gently.'}</p>
          <button className="text-link" onClick={onManual}>Extinguish candle instead</button>
        </motion.div>}
        {candleOut && !sliceServed && <motion.div key="serve" className="dock-inner" {...reveal(.9)}>
          <p className="celebrate">Wish made. <span>It’s safe with me.</span></p>
          <button className="cta" onClick={onServe}><span>Serve the birthday slice</span></button>
        </motion.div>}
        {sliceServed && <motion.div key="served" className="dock-inner" {...reveal(1.4)}>
          <p className="celebrate large">Birthday rule:<br /><em>the first slice is always yours.</em></p>
        </motion.div>}
      </AnimatePresence>
    </div>
  </>;
}

function MagazineCopy({ page, turning, onTurn }) {
  return <>
    <motion.div className="chapter-head" {...reveal(.3)}>
      <p className="kicker">Chapter 03 · {String(page + 1).padStart(2, '0')}</p>
      <h2><AnimatePresence mode="wait"><motion.em key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .5 }}>{spreads[page].title}</motion.em></AnimatePresence></h2>
    </motion.div>
    <div className="action-dock">
      <motion.div className="page-controls" {...reveal(.7)}>
        <button onClick={() => onTurn(-1)} disabled={page === 0 || turning} aria-label="Previous page"><ArrowLeft size={18} /></button>
        <span>{String(page + 1).padStart(2, '0')} <i>/</i> {String(spreads.length).padStart(2, '0')}</span>
        <button onClick={() => onTurn(1)} disabled={page === spreads.length - 1 || turning} aria-label="Next page"><ArrowRight size={18} /></button>
      </motion.div>
      <motion.p className="hint" {...reveal(.9)}>Swipe, use the arrows, or your keyboard.</motion.p>
    </div>
  </>;
}

function GiftCopy({ open, onOpen }) {
  return <>
    <AnimatePresence>{!open && <motion.div className="chapter-head" {...reveal(.3)}>
      <p className="kicker">Chapter 04</p>
      <h2>One last <em>little thing.</em></h2>
    </motion.div>}</AnimatePresence>
    <div className="action-dock">
      <AnimatePresence mode="wait">
        {!open ? <motion.button key="open" className="cta" onClick={onOpen} {...reveal(.8)}><span>Open your gift</span></motion.button>
          : <motion.p key="sig" className="signature" {...reveal(3.2)}>With all my love, always.</motion.p>}
      </AnimatePresence>
    </div>
  </>;
}

export default function App() {
  const reducedPref = useReducedMotion();
  const reduced = !!reducedPref;
  const mobile = useIsMobile();
  const [scene, setScene] = useState(0);
  const [veil, setVeil] = useState(false);
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const sound = useSound(scene);
  const busy = useRef(false);

  const extinguish = useCallback(() => { setCandleOut(true); sound.effect('blow'); }, [sound]);
  const mic = useBirthdayMicrophone(extinguish, scene === 1 && !candleOut);

  const goTo = useCallback((next) => {
    if (busy.current || next < 0 || next > 3 || next === scene) return;
    busy.current = true; sound.start(); sound.effect(next === 1 && scene === 0 ? 'enter' : 'transition');
    setVeil(true);
    setTimeout(() => { setScene(next); setTurn(null); setVeil(false); busy.current = false; }, reduced ? 150 : 900);
  }, [scene, sound, reduced]);

  const turnPage = useCallback((dir) => {
    if (turn) return;
    const to = page + dir; if (to < 0 || to >= spreads.length) return;
    sound.effect('page'); setTurn({ from: page, to });
  }, [page, turn, sound]);
  const onTurnDone = useCallback(() => setTurn(t => { if (t) setPage(t.to); return null; }), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (scene === 2 && ((dir === 1 && page < spreads.length - 1) || (dir === -1 && page > 0))) turnPage(dir);
      else goTo(scene + dir);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [scene, page, turnPage, goTo]);

  const swipe = useRef(null);
  const onPointerDown = (e) => { if (e.pointerType === 'touch') swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current; swipe.current = null; if (!s) return;
    const dx = e.clientX - s.x; if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(e.clientY - s.y) * 1.5) return;
    const dir = dx < 0 ? 1 : -1;
    if (scene === 2 && ((dir === 1 && page < spreads.length - 1) || (dir === -1 && page > 0))) turnPage(dir);
    else if (scene > 0) goTo(scene + dir);
  };

  const state = { scene, candleOut, sliceServed, page, turn, giftOpen };

  return <main className={`experience scene-${scene}`} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas shadows dpr={mobile ? [1, 1.5] : [1, 2]} camera={{ fov: mobile ? 46 : 38, position: [0, 0, 9], near: .1, far: 80 }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
        <World state={state} reduced={reduced} mobile={mobile} onTurnDone={onTurnDone} />
      </Canvas>
    </div>
    <div className="vignette" aria-hidden="true" />

    <header className="topbar">
      <span className="mark">For you <Sparkle size={11} aria-hidden="true" /></span>
      <button className="sound" onClick={sound.toggle} aria-pressed={!sound.muted} aria-label={sound.muted ? 'Turn sound on' : 'Turn sound off'}>
        {sound.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}<span>{sound.muted ? 'Sound off' : 'Sound on'}</span>
      </button>
    </header>

    <nav className="progress" aria-label="Chapters">
      {CHAPTERS.map((label, i) => <button key={label} className={i === scene ? 'active' : i < scene ? 'seen' : ''} onClick={() => goTo(i)} aria-label={`Chapter ${i + 1}: ${label}`} aria-current={i === scene ? 'step' : undefined}><i /></button>)}
      <small>{String(scene + 1).padStart(2, '0')} / 04</small>
    </nav>

    <section className="overlay" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div key={scene} className="overlay-scene" exit={{ opacity: 0 }} transition={{ duration: .4 }}>
          {scene === 0 && <HeroCopy onEnter={() => goTo(1)} />}
          {scene === 1 && <CakeCopy candleOut={candleOut} sliceServed={sliceServed} mic={mic}
            onListen={() => { sound.start(); mic.listen(); }} onManual={() => { mic.stop(); extinguish(); }}
            onServe={() => { setSliceServed(true); sound.effect('serve'); }} />}
          {scene === 2 && <MagazineCopy page={page} turning={!!turn} onTurn={turnPage} />}
          {scene === 3 && <GiftCopy open={giftOpen} onOpen={() => { sound.start(); setGiftOpen(true); sound.effect('gift'); }} />}
        </motion.div>
      </AnimatePresence>
    </section>

    {scene > 0 && <button className="nav-btn back" onClick={() => goTo(scene - 1)}><ArrowLeft size={15} aria-hidden="true" /><span>Back</span></button>}
    {scene > 0 && scene < 3 && <button className="nav-btn next" onClick={() => goTo(scene + 1)}><span>Next chapter</span><ArrowRight size={15} aria-hidden="true" /></button>}

    <AnimatePresence>{veil && <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .1 : .7, ease }} />}</AnimatePresence>
    <Loader />
  </main>;
}
