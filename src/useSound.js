import { useCallback, useEffect, useRef, useState } from 'react';

export function useSound(scene) {
  const engine = useRef(null);
  const chapter = useRef(scene);
  const initialMuted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('birthday-muted') === '1';
  const [muted, setMuted] = useState(initialMuted);
  const mutedRef = useRef(initialMuted);
  const tone = useCallback((frequency, duration = 3, volume = .05, delay = 0) => {
    const e = engine.current;
    if (!e || e.context.state !== 'running') return;
    const now = e.context.currentTime + delay;
    [1, 2, 3].forEach((harmonic, i) => {
      const oscillator = e.context.createOscillator();
      const gain = e.context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency * harmonic;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume / (1 + i * 5), now + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain); gain.connect(e.master);
      oscillator.start(now); oscillator.stop(now + duration + .1);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }, []);
  const start = useCallback(async () => {
    try {
      if (!engine.current) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const master = context.createGain(); master.gain.value = mutedRef.current ? 0 : .55;
        master.connect(context.destination);
        engine.current = { context, master, timer: null };
        let beat = 0;
        const phrase = () => {
          const notes = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66];
          tone(notes[beat % notes.length], 4, .055);
          if (beat % 4 === 0) tone([130.81, 110, 87.31, 98][Math.floor(beat / 4) % 4], 7, .065);
          if (chapter.current > 1 && beat % 2 === 0) tone(notes[(beat + 2) % 8] * 2, 3, .017, .45);
          beat++;
        };
        await context.resume(); phrase(); engine.current.timer = setInterval(phrase, 1700);
      } else await engine.current.context.resume();
    } catch { /* Audio is optional when a browser does not expose Web Audio. */ }
  }, [tone]);
  const effect = useCallback((kind) => {
    const sequences = { enter: [261.63, 392, 523.25], transition: [329.63, 392], blow: [196, 130.81], cut: [180, 145, 110], serve: [392, 523.25], page: [880, 659.25], gift: [261.63, 329.63, 392, 523.25, 783.99] };
    (sequences[kind] || sequences.transition).forEach((f, i) => tone(f, kind === 'page' ? .2 : kind === 'cut' ? .45 : 2.6, kind === 'page' ? .012 : kind === 'cut' ? .018 : .035, i * (kind === 'cut' ? .08 : .18)));
  }, [tone]);
  useEffect(() => { chapter.current = scene; }, [scene]);
  const toggle = () => {
    const next = !mutedRef.current; mutedRef.current = next; setMuted(next);
    try { sessionStorage.setItem('birthday-muted', next ? '1' : '0'); } catch { /* storage may be blocked */ }
    start();
    if (engine.current) engine.current.master.gain.setTargetAtTime(next ? 0 : .55, engine.current.context.currentTime, .3);
  };
  useEffect(() => () => { const e = engine.current; if (e) { clearInterval(e.timer); e.context.close().catch(() => {}); engine.current = null; } }, []);
  return { muted, start, toggle, effect };
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
    let stream; let context;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      if (token !== generation.current) { stream.getTracks().forEach(t => t.stop()); return; }
      context = new (window.AudioContext || window.webkitAudioContext)(); await context.resume();
      if (token !== generation.current) { stream.getTracks().forEach(t => t.stop()); await context.close(); return; }
      const analyser = context.createAnalyser(); analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let consecutive = 0; let ticks = 0; let baseline = 0;
      setStatus('listening');
      const interval = setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
        if (ticks++ < 5) { baseline += rms / 5; return; }
        consecutive = rms > Math.max(.022, baseline * 2.1) ? consecutive + 1 : 0;
        if (consecutive >= 3) { stop(); setStatus('done'); callback.current(); }
      }, 100);
      const timeout = setTimeout(() => { stop(); setStatus('timeout'); }, 12000);
      run.current = { stream, context, interval, timeout };
    } catch { stream?.getTracks().forEach(t => t.stop()); context?.close().catch(() => {}); if (token === generation.current) setStatus('denied'); }
  };
  return { status, listen, stop };
}
