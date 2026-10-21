import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CakeSlice, Gift, Heart, Mic, Sparkles, Volume2, X } from 'lucide-react';
import CakeScene from './CakeScene.jsx';

const pages = [
  { label: 'CHAPTER 01', title: 'The little things', text: 'The tiny moments that somehow become the biggest memories.', note: 'Some moments are small. The way they stay with us is not.' },
  { label: 'CHAPTER 02', title: 'Your kind of magic', text: 'The way you make ordinary days feel a little more golden.', note: 'You make the ordinary feel like something worth remembering.' },
  { label: 'CHAPTER 03', title: 'A note for you', text: 'The world got a little brighter on the day you arrived.', note: 'I hope this next chapter gives you a hundred reasons to smile.' },
];

export default function App() {
  const [scene, setScene] = useState(0);
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [page, setPage] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const [transitioning, setTransitioning] = useState(false);
  const micRun = useRef(null);

  useEffect(() => () => {
    if (micRun.current) {
      clearInterval(micRun.current.interval);
      clearTimeout(micRun.current.timeout);
      micRun.current.stream?.getTracks().forEach(track => track.stop());
      micRun.current.context?.close();
    }
  }, []);

  const moveScene = (next) => {
    if (transitioning || next < 0 || next > 3 || next === scene) return;
    setTransitioning(true);
    window.setTimeout(() => { setScene(next); setTransitioning(false); }, 360);
  };
  const blowManually = () => { setCandleOut(true); setMicStatus('done'); };

  const listenForBlow = async () => {
    if (candleOut) return;
    if (!navigator.mediaDevices?.getUserMedia) { setMicStatus('unsupported'); return; }
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
          clearInterval(micRun.current.interval); clearTimeout(micRun.current.timeout);
          stream.getTracks().forEach(track => track.stop()); context.close().catch(() => {}); micRun.current = null;
        }
      };
      const interval = setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) { const centered = (sample - 128) / 128; sum += centered * centered; }
        if (Math.sqrt(sum / samples.length) > 0.095) { stop(); setCandleOut(true); setMicStatus('done'); }
      }, 100);
      const timeout = setTimeout(() => { stop(); setMicStatus(current => current === 'listening' ? 'timeout' : current); }, 8000);
      micRun.current = { interval, timeout, stream, context };
    } catch { setMicStatus('denied'); }
  };

  return <main className={`experience ${transitioning ? 'is-transitioning' : ''}`}>
    <div className="scene-progress" aria-label="Birthday experience progress">
      {[0,1,2,3].map((n) => <button key={n} className={scene === n ? 'active' : scene > n ? 'visited' : ''} onClick={() => moveScene(n)} aria-label={['Introduction','Birthday cake','Keepsake magazine','Gift'][n]}><span /></button>)}
      <small>0{scene + 1} <i>/</i> 04</small>
    </div>
    <header className="experience-topbar"><span><Sparkles size={14}/> A LITTLE WORLD FOR YOU</span><span>MADE WITH LOVE <Heart size={13} fill="currentColor"/></span></header>

    {scene === 0 && <section className="scene hero-scene" key="hero">
      <div className="cosmic-orb orb-a"/><div className="cosmic-orb orb-b"/><div className="hero-moon"/>
      <div className="hero-content">
        <p className="eyebrow"><i/> THE DAY THE WORLD GOT BRIGHTER <i/></p>
        <h1>Someone special<br/>was <em>born today.</em></h1>
        <p className="hero-copy">So I made you a tiny universe.<br/>Take your time. Every little thing is for you.</p>
        <button className="gold-button" onClick={() => moveScene(1)}>Enter your little world <ArrowRight size={17}/></button>
        <div className="scroll-hint"><Sparkles size={13}/> FOUR LITTLE CHAPTERS. ALL FOR YOU.</div>
      </div>
      <div className="hero-signature">FOR MY FAVOURITE PERSON <span>✦</span> WITH ALL MY HEART</div>
    </section>}

    {scene === 1 && <section className="scene cake-scene-room" key="cake">
      <div className="scene-heading"><p className="eyebrow dark"><span>01</span> / MAKE A WISH</p><h2>A little cake.<br/><em>A very big wish.</em></h2><p>Close your eyes for a second. Think of something wonderful.</p></div>
      <div className="cake-room-art"><div className="cake-halo"/><div className="cake-ring ring-one"/><div className="cake-ring ring-two"/><CakeScene blownOut={candleOut} sliceServed={sliceServed}/><div className="cake-room-caption">BAKED WITH A LITTLE BIT OF MAGIC <span>✦</span></div></div>
      <div className="scene-actions">
        {!candleOut ? <><button className="dark-button" onClick={listenForBlow}><Mic size={16}/>{micStatus === 'listening' ? 'Listening… blow now' : 'Blow out the candle'}</button><button className="quiet-button" onClick={blowManually}><Volume2 size={15}/> Tap instead</button></> : !sliceServed ? <button className="dark-button" onClick={() => setSliceServed(true)}><CakeSlice size={16}/> Serve the birthday slice</button> : <p className="scene-feedback">First slice is yours. Birthday rules. <span>♥</span></p>}
        <p className="microcopy">{!candleOut ? (micStatus === 'denied' ? 'Microphone access was blocked. Tapping works too.' : micStatus === 'unsupported' ? 'This browser cannot use the microphone. Tap instead.' : micStatus === 'timeout' ? 'Didn’t catch that breeze. Try again or tap instead.' : micStatus === 'listening' ? 'Listening for a little birthday breeze…' : 'Make a wish first. I promise not to tell.') : !sliceServed ? 'Wish granted. Now, the important part…' : 'Zero calories on birthdays. I don’t make the rules.'}</p>
      </div>
      <button className="scene-back" onClick={() => moveScene(0)}><ArrowLeft size={15}/> BACK TO THE BEGINNING</button><button className="scene-next" onClick={() => moveScene(2)}>NEXT CHAPTER <ArrowRight size={16}/></button>
    </section>}

    {scene === 2 && <section className="scene magazine-scene" key="magazine">
      <div className="magazine-heading"><p className="eyebrow"><span>02</span> / A FEW PAGES ABOUT YOU</p><h2>Your very own<br/><em>little magazine.</em></h2><p>A keepsake for the little things that make you, you.</p></div>
      <div className="magazine-layout">
        <div className="magazine-side-note"><span className="note-star">✳</span><p>THE BIRTHDAY<br/>COLLECTOR'S EDITION</p><i>Volume 01 · Just for you</i></div>
        <div className="magazine-wrap">
          <div className="book" key={page}>
            <article className="page left-page"><span className="page-kicker">A SPECIAL EDITION</span><div className="page-art"><div className="sun"/><div className="hill hill-a"/><div className="hill hill-b"/><span>✦</span><small>FOR YOU, ALWAYS</small></div><div className="page-bottomline">A COLLECTION OF LITTLE LOVES</div><small className="page-number">0{page * 2 + 1}</small></article>
            <article className="page right-page"><span className="page-kicker">{pages[page].label}</span><div className="page-copy"><span className="tiny-heart">♡</span><h3>{pages[page].title}</h3><p>{pages[page].text}</p><div className="page-note">{pages[page].note}</div><div className="flourish">— with love, always —</div></div><small className="page-number">0{page * 2 + 2}</small></article>
          </div>
          <div className="page-controls"><button disabled={page === 0} onClick={() => setPage(p => Math.max(0,p-1))} aria-label="Previous spread"><ArrowLeft size={17}/></button><span>0{page + 1} <i>/</i> 0{pages.length}</span><button disabled={page === pages.length-1} onClick={() => setPage(p => Math.min(pages.length-1,p+1))} aria-label="Next spread"><ArrowRight size={17}/></button></div>
          <p className="microcopy">Turn the pages · a little keepsake, made just for you</p>
        </div>
      </div>
      <button className="scene-back" onClick={() => moveScene(1)}><ArrowLeft size={15}/> BACK TO THE CAKE</button><button className="scene-next" onClick={() => moveScene(3)}>ONE LAST SURPRISE <ArrowRight size={16}/></button>
    </section>}

    {scene === 3 && <section className="scene gift-scene" key="gift">
      <div className="gift-starfield">✦　·　✧　·　✦　·　✧　·　✦</div><p className="eyebrow"><span>03</span> / ONE LAST LITTLE THING</p><h2>There’s a little<br/><em>something for you.</em></h2><p className="gift-copy">Some things are better when you open them slowly.</p>
      <button className={`gift-button ${giftOpen ? 'opened' : ''}`} onClick={() => setGiftOpen(v => !v)} aria-label="Open the birthday gift">
        <span className="gift-aura"/><span className="gift-lid"/><span className="gift-box"><i/></span><span className="gift-ribbon"/>{!giftOpen ? <span className="gift-label"><Gift size={16}/> OPEN YOUR GIFT</span> : <span className="gift-surprise"><Heart size={30} fill="currentColor"/><b>You are my favourite<br/>kind of wonderful.</b><small>Today, tomorrow, and all the days after.</small></span>}
      </button>
      {giftOpen && <p className="gift-after">If I could give you one thing, it would be a chance to see yourself the way I see you.</p>}
      <button className="scene-back" onClick={() => moveScene(2)}><ArrowLeft size={15}/> READ IT AGAIN</button>
      <div className="hero-signature gift-signature">MADE FOR YOU, WITH ALL MY HEART <Heart size={13} fill="currentColor"/></div>
    </section>}
  </main>;
}
