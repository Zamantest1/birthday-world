import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CakeSlice, Gift, Heart, Mic, Sparkles, Volume2 } from 'lucide-react';
import CakeScene from './CakeScene.jsx';

const pages = [
  { label: 'CHAPTER 01', title: 'The little things', text: 'The tiny moments that somehow become the biggest memories.', note: 'Some moments are small. The way they stay with us is not.' },
  { label: 'CHAPTER 02', title: 'Your kind of magic', text: 'The way you make ordinary days feel a little more golden.', note: 'You make the ordinary feel like something worth remembering.' },
  { label: 'CHAPTER 03', title: 'A note for you', text: 'The world got a little brighter on the day you arrived.', note: 'I hope this next chapter gives you a hundred reasons to smile.' },
];

export default function App() {
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [page, setPage] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const micRun = useRef(null);

  useEffect(() => () => {
    if (micRun.current) {
      clearInterval(micRun.current.interval);
      clearTimeout(micRun.current.timeout);
      micRun.current.stream?.getTracks().forEach(track => track.stop());
      micRun.current.context?.close();
    }
  }, []);

  const goToCake = () => document.getElementById('cake')?.scrollIntoView({ behavior: 'smooth' });
  const blowManually = () => { setCandleOut(true); setMicStatus('done'); };

  const listenForBlow = async () => {
    if (candleOut) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }
    try {
      setMicStatus('listening');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const stop = () => {
        if (micRun.current) {
          clearInterval(micRun.current.interval);
          clearTimeout(micRun.current.timeout);
          stream.getTracks().forEach(track => track.stop());
          context.close().catch(() => {});
          micRun.current = null;
        }
      };
      const interval = setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const centered = (sample - 128) / 128;
          sum += centered * centered;
        }
        const volume = Math.sqrt(sum / samples.length);
        if (volume > 0.095) {
          stop();
          setCandleOut(true);
          setMicStatus('done');
        }
      }, 100);
      const timeout = setTimeout(() => {
        stop();
        setMicStatus(current => current === 'listening' ? 'timeout' : current);
      }, 8000);
      micRun.current = { interval, timeout, stream, context };
    } catch {
      setMicStatus('denied');
    }
  };

  return <main>
    <section className="hero" id="home">
      <div className="stars" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <header className="topbar"><span><Sparkles size={15} /> A LITTLE WORLD FOR YOU</span><small>MADE WITH LOVE</small></header>
      <div className="hero-content">
        <p className="eyebrow"><i /> THE DAY THE WORLD GOT BRIGHTER <i /></p>
        <h1>Someone special<br />was <em>born today.</em></h1>
        <p className="hero-copy">So I made you a tiny universe.<br />Take your time. Every little thing is for you.</p>
        <button className="gold-button" onClick={goToCake}>Enter your little world <ArrowRight size={17} /></button>
        <div className="scroll-hint"><ArrowDown size={14} /> THERE'S MORE WAITING BELOW</div>
      </div>
      <footer className="hero-footer">FOR MY FAVOURITE PERSON <Heart size={14} fill="currentColor" /> WITH ALL MY HEART</footer>
    </section>

    <section className="cake-section section-pad" id="cake">
      <div className="section-heading">
        <p className="eyebrow dark">01 / MAKE A WISH</p>
        <h2>A little cake.<br /><em>A very big wish.</em></h2>
        <p>Make a wish, then blow gently at your screen. If your microphone is available, the candle will go out when it hears your breath.</p>
      </div>
      <div className="cake-stage">
        <div className="cake-glow" />
        <CakeScene blownOut={candleOut} sliceServed={sliceServed} />
      </div>
      <div className="cake-controls">
        {!candleOut ? <div className="cake-action-row">
          <button className="dark-button" onClick={listenForBlow}><Mic size={17} /> {micStatus === 'listening' ? 'Listening… blow now' : 'Blow out the candle'}</button>
          <button className="quiet-button" onClick={blowManually}><Volume2 size={16} /> Tap instead</button>
        </div> : !sliceServed ? <button className="dark-button" onClick={() => setSliceServed(true)}><CakeSlice size={17} /> Serve me a slice</button> : <p className="cute-note">Birthday rule: the first slice is always yours. 🍰</p>}
        <p className="microcopy">{!candleOut ? (micStatus === 'denied' ? 'Microphone access was blocked. You can still tap to blow out the candle.' : micStatus === 'unsupported' ? 'This browser cannot use the microphone here. Tap instead to continue.' : micStatus === 'timeout' ? 'I didn’t catch that breeze. Try again or tap instead.' : micStatus === 'listening' ? 'Listening for a little birthday breeze…' : 'Make a wish first. I promise not to tell.') : !sliceServed ? 'Wish granted. Now, the important part…' : 'Zero calories on birthdays. I don’t make the rules.'}</p>
      </div>
    </section>

    <section className="magazine-section section-pad" id="magazine">
      <div className="magazine-intro"><p className="eyebrow">02 / A FEW PAGES ABOUT YOU</p><h2>Your very own<br /><em>little magazine.</em></h2><p>A few words, a few memories, and all the things I hope you never forget.</p><div className="magazine-note"><span>✦</span> A little keepsake, made just for you.</div></div>
      <div className="magazine-wrap">
        <div className="book">
          <article className="page left-page"><span className="page-kicker">A SPECIAL EDITION</span><div className="page-art"><div className="sun" /><div className="hill hill-a" /><div className="hill hill-b" /><span>✦</span><small>FOR YOU, ALWAYS</small></div><small className="page-number">0{page * 2 + 1}</small></article>
          <article className="page right-page"><span className="page-kicker">{pages[page].label}</span><div className="page-copy"><span className="tiny-heart">♡</span><h3>{pages[page].title}</h3><p>{pages[page].text}</p><div className="page-note">{pages[page].note}</div><div className="flourish">— with love, always —</div></div><small className="page-number">0{page * 2 + 2}</small></article>
        </div>
        <div className="page-controls"><button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Previous page"><ArrowLeft size={17} /></button><span>0{page + 1} <i>/</i> 0{pages.length}</span><button disabled={page === pages.length - 1} onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))} aria-label="Next page"><ArrowRight size={17} /></button></div>
        <p className="microcopy">Turn the pages · This is a first draft of your keepsake</p>
      </div>
    </section>

    <section className="gift-section section-pad" id="gift">
      <div className="sparkles">✦　·　✧　·　✦</div><p className="eyebrow">03 / ONE LAST LITTLE THING</p>
      <h2>There’s a little<br /><em>something for you.</em></h2><p className="gift-copy">No peeking. Well… just one last click.</p>
      <button className={`gift-button ${giftOpen ? 'opened' : ''}`} onClick={() => setGiftOpen(v => !v)} aria-label="Open the birthday gift">
        <span className="gift-lid" /><span className="gift-box"><i /></span><span className="gift-ribbon" />
        {!giftOpen ? <span className="gift-label"><Gift size={16} /> OPEN YOUR GIFT</span> : <span className="gift-surprise"><Heart size={30} fill="currentColor" /><b>You are my favourite<br />kind of wonderful.</b><small>Today, tomorrow, and all the days after.</small></span>}
      </button>
      <footer className="final-note">MADE FOR YOU, WITH ALL MY HEART <Heart size={13} fill="currentColor" /></footer>
    </section>
  </main>;
}