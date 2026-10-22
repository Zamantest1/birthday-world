import { useCallback, useEffect, useRef, useState } from 'react';

const TARGET_BG_VOLUME = 0.36; // Warm, balanced ambient volume
const DUCKED_BG_VOLUME = 0.10; // Ducked background volume during birthday tune

export function useSound(scene) {
  const engine = useRef(null);
  const chapter = useRef(scene);
  const bgAudioRef = useRef(null);
  const fadeTimer = useRef(null);
  const duckTimer = useRef(null);
  const initialMuted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('birthday-muted') === '1';
  const [muted, setMuted] = useState(initialMuted);
  const mutedRef = useRef(initialMuted);
  const lastPaperTime = useRef(0);

  // Initialize continuous background audio track
  useEffect(() => {
    if (!bgAudioRef.current && typeof window !== 'undefined') {
      const audio = new Audio('/audio/background-music.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = mutedRef.current ? 0 : TARGET_BG_VOLUME;

      // Fail-safe continuous loop listener across all mobile & desktop browsers
      const handleEnded = () => {
        try {
          audio.currentTime = 0;
          if (!mutedRef.current) {
            audio.play().catch(() => {});
          }
        } catch { /* loop recovery */ }
      };
      audio.addEventListener('ended', handleEnded);

      // Resume audio if tab becomes active after backgrounding
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !mutedRef.current && bgAudioRef.current) {
          if (bgAudioRef.current.paused) {
            bgAudioRef.current.play().catch(() => {});
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      bgAudioRef.current = audio;

      return () => {
        audio.removeEventListener('ended', handleEnded);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Smooth volume fading / ducking helper
  const fadeAudio = useCallback((audio, targetVol, durationMs = 500) => {
    if (!audio) return;
    if (fadeTimer.current) cancelAnimationFrame(fadeTimer.current);
    const startVol = audio.volume;
    const startTime = performance.now();
    const diff = targetVol - startVol;
    if (Math.abs(diff) < 0.005) {
      audio.volume = targetVol;
      return;
    }
    const step = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(1, elapsed / durationMs);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      audio.volume = Math.max(0, Math.min(1, startVol + diff * eased));
      if (p < 1) {
        fadeTimer.current = requestAnimationFrame(step);
      }
    };
    fadeTimer.current = requestAnimationFrame(step);
  }, []);

  const tone = useCallback((frequency, duration = 3, volume = .05, delay = 0) => {
    const e = engine.current;
    if (!e || e.context.state !== 'running' || mutedRef.current) return;
    const now = e.context.currentTime + delay;
    [1, 2, 3].forEach((harmonic, i) => {
      const oscillator = e.context.createOscillator();
      const gain = e.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume / (1 + i * 5), now + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(e.master);
      oscillator.start(now);
      oscillator.stop(now + duration + .1);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }, []);

  // Realistic Web Audio synthesized paper rustle / page turn / letter fold sound
  const paperRustle = useCallback((intensity = 1.0, isLetter = false) => {
    try {
      const e = engine.current;
      if (!e || e.context.state !== 'running' || mutedRef.current) return;
      const nowMs = performance.now();
      // Debounce rapid duplicate calls within 180ms
      if (nowMs - lastPaperTime.current < 180) return;
      lastPaperTime.current = nowMs;

      const ctx = e.context;
      const now = ctx.currentTime;
      const duration = isLetter ? 0.36 : 0.26;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Synthesize pink-leaning noise with micro-friction crinkles
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        const pink = b0 + b1 + b2 + white * 0.2;
        const crinkle = Math.random() > (isLetter ? 0.985 : 0.978) ? (Math.random() * 1.6 - 0.8) : 0;
        data[i] = (pink * 0.32 + crinkle) * 0.45;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to isolate tactile paper friction frequencies (1.6kHz - 2.8kHz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(isLetter ? 1800 : 2400, now);
      bandpass.frequency.exponentialRampToValueAtTime(isLetter ? 1100 : 1500, now + duration);
      bandpass.Q.value = isLetter ? 1.2 : 1.5;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 550;

      const gain = ctx.createGain();
      const peakVol = (isLetter ? 0.048 : 0.055) * intensity;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + (isLetter ? 0.05 : 0.035));
      gain.gain.exponentialRampToValueAtTime(peakVol * 0.5, now + duration * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Low-resonance body flutter for archival paper weight
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isLetter ? 100 : 135, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.13);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.016 * intensity, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(e.master);

      osc.connect(oscGain);
      oscGain.connect(e.master);

      noise.start(now);
      noise.stop(now + duration + 0.02);
      osc.start(now);
      osc.stop(now + 0.15);

      noise.onended = () => {
        noise.disconnect();
        bandpass.disconnect();
        highpass.disconnect();
        gain.disconnect();
        osc.disconnect();
        oscGain.disconnect();
      };
    } catch {
      // Audio fallback is non-blocking
    }
  }, []);

  const start = useCallback(async () => {
    try {
      if (!engine.current) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const master = context.createGain();
        master.gain.value = mutedRef.current ? 0 : 0.85;
        master.connect(context.destination);
        engine.current = { context, master };
      }
      if (engine.current.context.state === 'suspended') {
        await engine.current.context.resume();
      }

      // Start continuous background audio track with fade-in
      const bg = bgAudioRef.current;
      if (bg && !mutedRef.current) {
        if (bg.paused) {
          bg.volume = 0;
          await bg.play().catch(() => {});
          fadeAudio(bg, TARGET_BG_VOLUME, 1000);
        }
      }
    } catch { /* Audio is non-blocking */ }
  }, [fadeAudio]);

  const birthdayTune = useCallback(() => {
    try {
      const e = engine.current;
      if (!e || e.context.state !== 'running' || mutedRef.current) return;
      const ctx = e.context;
      const baseNow = ctx.currentTime;

      // 1. Duck background music gracefully so birthday melody is prominent
      const bg = bgAudioRef.current;
      if (bg && !mutedRef.current) {
        fadeAudio(bg, DUCKED_BG_VOLUME, 450);
        if (duckTimer.current) clearTimeout(duckTimer.current);
        duckTimer.current = setTimeout(() => {
          if (!mutedRef.current && bgAudioRef.current) {
            fadeAudio(bgAudioRef.current, TARGET_BG_VOLUME, 1400);
          }
        }, 7800);
      }

      // 2. Play warm music-box chime harmonics
      // G4 G4 A4 G4 C5 B4 | G4 G4 A4 G4 D5 C5
      const notes = [
        { f: 392.00, t: 0.00, d: 0.32, v: 0.28 }, // Hap-
        { f: 392.00, t: 0.34, d: 0.32, v: 0.28 }, // py
        { f: 440.00, t: 0.68, d: 0.58, v: 0.30 }, // birth-
        { f: 392.00, t: 1.30, d: 0.58, v: 0.29 }, // day
        { f: 523.25, t: 1.92, d: 0.62, v: 0.33 }, // to
        { f: 493.88, t: 2.56, d: 1.05, v: 0.30 }, // you
        { f: 392.00, t: 3.75, d: 0.32, v: 0.28 }, // Hap-
        { f: 392.00, t: 4.09, d: 0.32, v: 0.28 }, // py
        { f: 440.00, t: 4.43, d: 0.58, v: 0.30 }, // birth-
        { f: 392.00, t: 5.05, d: 0.58, v: 0.29 }, // day
        { f: 587.33, t: 5.67, d: 0.62, v: 0.34 }, // to
        { f: 523.25, t: 6.31, d: 1.45, v: 0.34 }, // you!
      ];

      notes.forEach(({ f, t, d, v }) => {
        const now = baseNow + t;
        const harmonics = [
          { mul: 1, gainRatio: 1.0, type: 'sine' },
          { mul: 2, gainRatio: 0.38, type: 'sine' },
          { mul: 3, gainRatio: 0.14, type: 'triangle' },
          { mul: 4, gainRatio: 0.06, type: 'sine' },
        ];

        harmonics.forEach(({ mul, gainRatio, type }) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(f * mul, now);

          const peak = v * gainRatio;
          gainNode.gain.setValueAtTime(0.0001, now);
          gainNode.gain.linearRampToValueAtTime(peak, now + 0.018);
          // Resonant musical ring decay
          gainNode.gain.exponentialRampToValueAtTime(peak * 0.45, now + d * 0.4);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.3);

          osc.connect(gainNode);
          gainNode.connect(e.master);

          osc.start(now);
          osc.stop(now + d + 0.35);

          osc.onended = () => {
            osc.disconnect();
            gainNode.disconnect();
          };
        });
      });
    } catch { /* Audio is non-blocking */ }
  }, [fadeAudio]);

  const effect = useCallback((kind) => {
    if (kind === 'page') {
      paperRustle(1.0, false);
      return;
    }
    if (kind === 'paper' || kind === 'letter') {
      paperRustle(1.15, true);
      return;
    }
    if (kind === 'gift') {
      paperRustle(1.2, true);
      const sequences = [261.63, 329.63, 392, 523.25];
      sequences.forEach((f, i) => tone(f, 2.4, .03, i * .15 + .12));
      return;
    }

    const sequences = {
      enter: [261.63, 392, 523.25],
      transition: [329.63, 392],
      blow: [196, 130.81],
      cut: [180, 145, 110],
      serve: [392, 523.25],
      celebration: [523.25, 659.25, 783.99, 1046.5],
    };
    (sequences[kind] || sequences.transition).forEach((f, i) => {
      tone(f, kind === 'cut' ? .45 : kind === 'celebration' ? .7 : 2.6,
           kind === 'cut' ? .018 : kind === 'celebration' ? .025 : .035,
           i * (kind === 'cut' ? .08 : kind === 'celebration' ? .12 : .18));
    });
  }, [tone, paperRustle]);

  useEffect(() => { chapter.current = scene; }, [scene]);

  // First interaction gesture listener to seamlessly unlock audio in modern browsers
  useEffect(() => {
    const handleFirstGesture = () => {
      start();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [start]);

  const toggle = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    try { sessionStorage.setItem('birthday-muted', next ? '1' : '0'); } catch { /* storage */ }

    const bg = bgAudioRef.current;
    if (bg) {
      if (next) {
        fadeAudio(bg, 0, 180);
        setTimeout(() => { if (mutedRef.current && bgAudioRef.current) bgAudioRef.current.pause(); }, 200);
      } else {
        bg.volume = 0;
        bg.play().then(() => {
          fadeAudio(bg, TARGET_BG_VOLUME, 280);
        }).catch(() => {});
      }
    }

    if (engine.current) {
      engine.current.master.gain.setTargetAtTime(next ? 0 : 0.85, engine.current.context.currentTime, .15);
    }
  };

  useEffect(() => () => {
    if (fadeTimer.current) cancelAnimationFrame(fadeTimer.current);
    if (duckTimer.current) clearTimeout(duckTimer.current);
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.src = '';
      bgAudioRef.current = null;
    }
    const e = engine.current;
    if (e) {
      e.context.close().catch(() => {});
      engine.current = null;
    }
  }, []);

  return { muted, start, toggle, effect, birthdayTune, paperRustle };
}

export function useBirthdayMicrophone(onBlow, active) {
  const [status, setStatus] = useState('idle');
  const run = useRef(null);
  const generation = useRef(0);
  const callback = useRef(onBlow); callback.current = onBlow;
  const stop = useCallback(() => {
    generation.current++;
    const r = run.current;
    if (r) { clearInterval(r.interval); clearTimeout(r.timeout); r.stream.getTracks().forEach(t => t.stop()); r.context.close().catch(() => {}); run.current = null; }
  }, []);
  useEffect(() => { if (!active) { stop(); setStatus('idle'); } return stop; }, [active, stop]);
  const listen = async () => {
    if (run.current || status === 'requesting') return;
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('unsupported'); return; }
    stop(); const token = generation.current; setStatus('requesting');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      if (token !== generation.current) { stream.getTracks().forEach(t => t.stop()); return; }
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let blowFrames = 0;
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const low = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
        if (low > 140) blowFrames++; else blowFrames = Math.max(0, blowFrames - 1);
        if (blowFrames > 3) { callback.current(); stop(); setStatus('idle'); }
      }, 50);
      const timeout = setTimeout(() => { stop(); setStatus('idle'); }, 12000);
      run.current = { stream, context, interval, timeout };
      setStatus('listening');
    } catch { setStatus('denied'); }
  };
  return { status, listen, stop };
}
