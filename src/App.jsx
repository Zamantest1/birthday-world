import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';
import World from './World.jsx';
import { spreads } from './MagazineScene.jsx';
import { LETTER_COPY } from './GiftScene.jsx';
import { useSound } from './useSound.js';

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

function Loader({ scene }) {
  const { active, progress } = useProgress();
  return <AnimatePresence>{active && scene === 0 && <motion.div className="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
    <span>Preparing your little world</span><i style={{ transform: `scaleX(${progress / 100})` }} />
  </motion.div>}</AnimatePresence>;
}

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16, filter: 'blur(5px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, delay, ease } },
  exit: { opacity: 0, y: -8, filter: 'blur(3px)', transition: { duration: 0.2, delay: 0 } },
});

function HeroCopy({ onEnter }) {
  return <div className="hero-copy">
    <h1>
      <motion.span {...reveal(.2)}>Today,</motion.span>
      <motion.span {...reveal(.4)}>someone special <em>was born.</em></motion.span>
    </h1>
    <motion.p className="lede" {...reveal(.6)}>So I made you a tiny universe.<br />Take your time. Every little thing is for you.</motion.p>
    <motion.button className="cta" onClick={onEnter} {...reveal(.8)} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
      <span>Enter your little world</span><ArrowRight size={16} aria-hidden="true" />
    </motion.button>
  </div>;
}

function CakeCopy({ candleOut, sliceServed, onExtinguish, onServe, onNext }) {
  return <>
    <motion.div className="chapter-head" {...reveal(.2)}>
      <p className="kicker">Chapter 01</p>
      <h2>Make a <em>wish.</em></h2>
    </motion.div>
    <div className="action-dock">
      <AnimatePresence mode="wait">
        {!candleOut && <motion.div key="wish" className="dock-inner" {...reveal(.25)}>
          <button className="cta" onClick={onExtinguish}><span>Make a Wish</span></button>
        </motion.div>}
        {candleOut && !sliceServed && <motion.div key="serve" className="dock-inner" {...reveal(.15)}>
          <p className="celebrate">Wish made.</p>
          <button className="cta" onClick={onServe}><span>Cut & serve the birthday slice</span></button>
        </motion.div>}
        {sliceServed && <motion.div key="served" className="dock-inner" {...reveal(.15)}>
          <p className="celebrate large">Birthday rule:<br /><em>the first slice is always yours.</em></p>
          <button className="cta" onClick={onNext} style={{ marginTop: '14px' }}>
            <span>Open Keepsake Magazine →</span>
          </button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </>;
}

function MagazineCopy({ page, turning, onTurn, isLastPage, onNext }) {
  return <>
    <motion.div className="chapter-head" {...reveal(.3)}>
      <p className="kicker">Chapter 02 · {String(page + 1).padStart(2, '0')}</p>
      <h2><AnimatePresence mode="wait"><motion.em key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .5 }}>{spreads[page].title}</motion.em></AnimatePresence></h2>
    </motion.div>
    <div className="action-dock">
      <div className="dock-inner magazine-dock-inner">
        <motion.div className="page-controls" {...reveal(.4)}>
          <button onClick={() => onTurn(-1)} disabled={page === 0 || turning} aria-label="Previous page"><ArrowLeft size={18} /></button>
          <span>{String(page + 1).padStart(2, '0')} <i>/</i> {String(spreads.length).padStart(2, '0')}</span>
          <button onClick={() => onTurn(1)} disabled={page === spreads.length - 1 || turning} aria-label="Next page"><ArrowRight size={18} /></button>
        </motion.div>

        {isLastPage && (
          <motion.button className="cta next-stage-btn" onClick={onNext} {...reveal(0.3)} style={{ marginTop: '10px' }}>
            <span>Open Your Gift Box →</span>
          </motion.button>
        )}
      </div>
    </div>
  </>;
}

function GiftCopy({ open, letterRead, onOpen, onOpenLetter, onReplay }) {
  return <>
    <AnimatePresence>
      {!open && (
        <motion.div
          key="head-initial"
          className="chapter-head"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16, transition: { duration: 0.35 } }}
          transition={{ duration: 0.6 }}
        >
          <p className="kicker">Chapter 03</p>
          <h2>One last <em>little thing.</em></h2>
        </motion.div>
      )}
    </AnimatePresence>
    <div className={`action-dock ${open ? 'final-action-dock' : ''}`}>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button key="open" className="cta" onClick={onOpen} {...reveal(0.3)}>
            <span>Open your gift</span>
          </motion.button>
        ) : (
          <motion.div key="sig" className="dock-inner final-dock-inner" {...reveal(0.2)}>
            <button className="cta read-letter-btn" onClick={onOpenLetter}>
              <span>Read Full Letter ✉</span>
            </button>
            {letterRead && (
              <button className="cta replay-cta" onClick={onReplay} style={{ marginTop: '12px' }}>
                <span>Replay Little World ✦</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>;
}

function LetterModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="letter-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="letter-modal-card" initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <button className="letter-modal-close" onClick={onClose} aria-label="Close letter">✕</button>
          <span className="letter-modal-heart">♡</span>
          <h3 className="letter-modal-heading">{LETTER_COPY.heading}</h3>
          <div className="letter-modal-body">
            {LETTER_COPY.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="letter-modal-divider" />
          <p className="letter-modal-closing">{LETTER_COPY.closing}</p>
          <span className="letter-modal-heart small">♡</span>
          <div className="letter-modal-footer">
            <button className="letter-modal-dismiss-btn" onClick={onClose}>
              <span>Close & Return to World</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const reducedPref = useReducedMotion();
  const reduced = !!reducedPref;
  const mobile = useIsMobile();
  const [scene, setScene] = useState(0);
  const [veil, setVeil] = useState(false);
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [letterRead, setLetterRead] = useState(false);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState(null);
  const [lockNotice, setLockNotice] = useState(null);

  // Fresh progression on every session: only Chapter 0 is unlocked by default
  const [completedChapters, setCompletedChapters] = useState({ 0: true, 1: false, 2: false, 3: false });

  const markComplete = useCallback((ch) => {
    setCompletedChapters(prev => {
      if (prev[ch]) return prev;
      return { ...prev, [ch]: true };
    });
  }, []);

  const toastTimer = useRef(null);
  const showLockToast = useCallback((msg) => {
    setLockNotice(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLockNotice(null), 3200);
  }, []);

  const canAccess = useCallback((target) => {
    if (target <= scene) return true;
    if (target === scene + 1 && completedChapters[scene]) return true;
    return false;
  }, [scene, completedChapters]);

  const triggerLockToast = useCallback((target) => {
    if (target > scene) {
      if (scene === 0) showLockToast('Click "Enter your little world" below to begin ✦');
      else if (scene === 1) showLockToast('Make a wish and cut your birthday slice to unlock Chapter 02 🎂');
      else if (scene === 2) showLockToast('Flip through all magazine spreads to unlock Chapter 03 📖');
      else if (scene === 3) showLockToast('Open your gift box and read your birthday letter ✉');
      else showLockToast('Please finish the current chapter first ✦');
    }
  }, [scene, showLockToast]);

  const sound = useSound(scene);
  const busy = useRef(false);
  const servingRef = useRef(false);

  const extinguish = useCallback(() => {
    setCandleOut(true);
    sound.effect('blow');
    sound.start().then(() => { sound.birthdayTune(); }).catch(() => {});
  }, [sound]);

  const handleServeSlice = useCallback(() => {
    if (sliceServed || servingRef.current) return;
    servingRef.current = true;
    sound.effect('serve');
    setSliceServed(true);
    markComplete(1);
  }, [sliceServed, sound, markComplete]);

  const goTo = useCallback((next) => {
    if (busy.current || next < 0 || next > 3 || next === scene) return;
    if (next > scene && !canAccess(next)) {
      triggerLockToast(next);
      return;
    }
    busy.current = true;
    sound.start();
    sound.effect(next === 1 && scene === 0 ? 'enter' : 'transition');

    if (reduced) {
      setScene(next);
      setTurn(null);
      busy.current = false;
      return;
    }

    // 1. Smoothly fade in veil to 100% solid opacity (320ms)
    setVeil(true);
    setTimeout(() => {
      // 2. Under solid cover, switch scene cleanly
      setScene(next);
      setTurn(null);

      // 3. Allow Three.js 70ms to mount and stabilize camera/geometries in GPU buffer
      setTimeout(() => {
        setVeil(false);
        setTimeout(() => {
          busy.current = false;
        }, 350);
      }, 70);
    }, 320);
  }, [scene, sound, reduced, canAccess, triggerLockToast]);

  const turnPage = useCallback((dir) => {
    if (turn) return;
    const to = page + dir;
    if (to < 0 || to >= spreads.length) return;
    sound.effect('page');
    setTurn({ from: page, to });
    if (to === spreads.length - 1) {
      markComplete(2);
    }
  }, [page, turn, sound, markComplete]);

  const onTurnDone = useCallback(() => {
    setTurn(t => {
      if (t) {
        setPage(t.to);
        if (t.to === spreads.length - 1) {
          markComplete(2);
        }
      }
      return null;
    });
  }, [markComplete]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (scene === 2 && ((dir === 1 && page < spreads.length - 1) || (dir === -1 && page > 0))) {
        turnPage(dir);
      } else if (dir === 1) {
        if (canAccess(scene + 1)) goTo(scene + 1);
        else triggerLockToast(scene + 1);
      } else if (dir === -1) {
        goTo(scene - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene, page, turnPage, goTo, canAccess, triggerLockToast]);

  const openLetter = useCallback(() => {
    sound.start();
    sound.effect('letter');
    setLetterRead(true);
    markComplete(3);
    setLetterModalOpen(true);
  }, [sound, markComplete]);

  const closeLetter = useCallback(() => {
    sound.effect('paper');
    setLetterRead(true);
    markComplete(3);
    setLetterModalOpen(false);
  }, [sound, markComplete]);

  const handleReplay = useCallback(() => {
    setCandleOut(false);
    setSliceServed(false);
    setGiftOpen(false);
    setLetterRead(false);
    setPage(0);
    setCompletedChapters({ 0: true, 1: false, 2: false, 3: false });
    try { sessionStorage.removeItem('birthday_completed_chapters'); } catch {}
    goTo(0);
  }, [goTo]);

  const state = { scene, candleOut, sliceServed, page, turn, giftOpen };

  return <main className={`experience scene-${scene}`}>
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas shadows dpr={mobile ? [1, 1.5] : [1, 2]} camera={{ fov: mobile ? 46 : 38, position: [0, 0, 9], near: .1, far: 80 }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
        <World state={state} reduced={reduced} mobile={mobile} onTurnDone={onTurnDone} />
      </Canvas>
    </div>
    <div className="vignette" aria-hidden="true" />

    <header className="topbar">
      <span className="mark">For you <span aria-hidden="true">✦</span></span>
      <button className="sound" onClick={sound.toggle} aria-pressed={!sound.muted} aria-label={sound.muted ? 'Turn sound on' : 'Turn sound off'}>
        {sound.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}<span>{sound.muted ? 'Sound off' : 'Sound on'}</span>
      </button>
    </header>

    <nav className="progress" aria-label="Chapters">
      {CHAPTERS.map((label, i) => {
        const isCurrent = i === scene;
        const isComplete = completedChapters[i];
        const accessible = i <= scene;
        const className = isCurrent ? 'active' : isComplete ? 'completed seen' : accessible ? 'seen' : 'locked';
        return (
          <button
            key={label}
            className={className}
            onClick={() => {
              if (i === scene) return;
              if (i < scene) goTo(i);
              else triggerLockToast(i);
            }}
            aria-label={`Chapter ${i + 1}: ${label}${!accessible ? ' (Locked)' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <i />
          </button>
        );
      })}
      <small>{String(scene + 1).padStart(2, '0')} / 04</small>
    </nav>

    <section className="overlay" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div key={scene} className="overlay-scene" exit={{ opacity: 0 }} transition={{ duration: .2 }}>
          {scene === 0 && <HeroCopy onEnter={() => goTo(1)} />}
          {scene === 1 && (
            <CakeCopy
              candleOut={candleOut}
              sliceServed={sliceServed}
              onExtinguish={extinguish}
              onServe={handleServeSlice}
              onNext={() => goTo(2)}
            />
          )}
          {scene === 2 && (
            <MagazineCopy
              page={page}
              turning={!!turn}
              onTurn={turnPage}
              isLastPage={page === spreads.length - 1}
              onNext={() => goTo(3)}
            />
          )}
          {scene === 3 && (
            <GiftCopy
              open={giftOpen}
              letterRead={letterRead}
              onOpen={() => {
                sound.start();
                setGiftOpen(true);
                sound.effect('gift');
              }}
              onOpenLetter={openLetter}
              onReplay={handleReplay}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>

    {scene > 0 && (
      <button className="nav-btn back" onClick={() => goTo(scene - 1)}>
        <ArrowLeft size={15} aria-hidden="true" />
        <span>Back</span>
      </button>
    )}

    <AnimatePresence>
      {lockNotice && (
        <motion.div
          className="lock-toast"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <span className="lock-toast-icon"><Lock size={13} aria-hidden="true" /></span>
          <span>{lockNotice}</span>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>{veil && <motion.div className="veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.32, ease }} />}</AnimatePresence>
    <LetterModal isOpen={letterModalOpen} onClose={closeLetter} />
    <Loader scene={scene} />
  </main>;
}
