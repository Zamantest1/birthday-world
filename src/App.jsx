import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CakeSlice, Gift, Heart, Mic, Sparkles, Volume2, X } from 'lucide-react';
import CakeScene from './CakeScene.jsx';

const pages = [
  { label: 'THE COVER', title: 'Birthday girl', text: 'A whole universe, in one extraordinary person.', note: 'THE SPECIAL BIRTHDAY ISSUE · MADE ONLY FOR YOU' },
  { label: '01 / A LITTLE INTRODUCTION', title: 'The prettiest kind of magic', text: 'Some people make a room brighter just by being in it. You have that kind of light.', note: 'A little reminder of how lovely you are.' },
  { label: '02 / THE LITTLE THINGS', title: 'Things that make you, you', text: 'Your expressions. Your tiny habits. The way you care. The things you probably do not even notice about yourself.', note: 'It is the little things that become the biggest memories.' },
  { label: '03 / YOUR KIND OF DAY', title: 'A day worth celebrating', text: 'Today is not just another date on the calendar. It is the day the world got you.', note: 'More laughter, more adventures, more moments to keep.' },
  { label: '04 / A NOTE FOR YOU', title: 'If you ever forget', text: 'You are appreciated more than you know. You deserve gentleness, joy, and all the beautiful things you give to others.', note: 'Keep this page for the days you need a little reminder.' },
  { label: 'THE END', title: 'And the story goes on', text: 'In a world full of temporary things, some people become a favourite part of the story.', note: 'This is not the end. It is another lovely beginning.' },
];

export default function App() {
  const [scene, setScene] = useState(0);
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [page, setPage] = useState(0);
  const [pageDirection, setPageDirection] = useState('');
  const [pageAnimating, setPageAnimating] = useState(false);
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
  const turnPage = (direction) => {
    if (pageAnimating || page + direction < 0 || page + direction >= pages.length) return;
    setPageDirection(direction > 0 ? 'turn-forward' : 'turn-backward');
    setPageAnimating(true);
    window.setTimeout(() => {
      setPage(current => current + direction);
      setPageDirection('');
      setPageAnimating(false);
    }, 520);
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
      <div className="magazine-heading"><p className="eyebrow"><span>02</span> / THE BIRTHDAY EDITION</p><h2>A whole magazine.<br/><em>All about you.</em></h2><p>Every spread is a tiny love letter. Turn slowly.</p></div>
      <div className="magazine-layout magazine-layout-rich">
        <aside className="magazine-side-note"><span className="note-star">✳</span><p>THE BIRTHDAY<br/>COLLECTOR'S EDITION</p><i>Vol. 01 · Made just for you</i><div className="side-edition-line"/><small>6 LITTLE CHAPTERS<br/>ONE VERY SPECIAL PERSON</small></aside>
        <div className="magazine-wrap">
          <div className={`book book-rich ${pageDirection}`} key={page}>
            <article className={`page left-page spread-left spread-kind-${page}`}>
              {page === 0 ? <>
                <div className="cover-photo portrait-art portrait-cover"><span className="photo-grain"/><span className="cover-plant plant-one"/><span className="cover-plant plant-two"/><div className="portrait-silhouette"><i/><b/></div><div className="cover-type"><small>THE BIRTHDAY</small><strong>GIRL</strong><i>special edition</i></div><span className="cover-date">A DAY TO REMEMBER</span></div><div className="cover-bottom"><span>VOLUME 01</span><span>MADE WITH LOVE ♥</span></div>
              </> : page === 1 ? <>
                <div className="spread-label">A LITTLE INTRODUCTION</div><div className="full-portrait-art"><div className="portrait-silhouette portrait-sitting"><i/><b/></div><span className="portrait-caption">her kind of magic</span></div><div className="handwritten">simply, wonderfully you ♡</div>
              </> : page === 2 ? <>
                <div className="spread-label">THE LITTLE THINGS</div><div className="scrap-collage"><div className="scrap scrap-one"><span className="scrap-photo photo-flowers">✿</span><small>little joys</small></div><div className="scrap scrap-two"><span className="scrap-photo photo-sunset">☼</span><small>golden hours</small></div><div className="scrap scrap-three"><span className="scrap-photo photo-notes">♡</span><small>tiny moments</small></div><span className="tape tape-one"/><span className="tape tape-two"/><span className="doodle-heart">♡</span></div><div className="handwritten">collecting little reasons to smile</div>
              </> : page === 3 ? <>
                <div className="spread-label">A DAY WORTH CELEBRATING</div><div className="birthday-collage"><div className="birthday-photo main-photo"><span>✦</span><b>YOUR DAY</b></div><div className="birthday-photo mini-photo"><span>♡</span></div><div className="birthday-sticker">HAPPY<br/>BIRTHDAY!</div></div><div className="page-bottomline">MORE LIFE. MORE LIGHT. MORE YOU.</div>
              </> : page === 4 ? <>
                <div className="spread-label">A NOTE, JUST FOR YOU</div><div className="letter-paper"><span className="letter-heart">♡</span><p>Hey you,</p><p>Never forget how much goodness you bring into the world. I hope this new chapter is kind to you, surprises you in the best ways, and gives you reasons to feel proud of the person you are becoming.</p><p className="letter-signoff">always cheering for you, <b>♥</b></p><span className="letter-stamp">FOR YOU<br/>ALWAYS</span></div>
              </> : <>
                <div className="end-landscape"><div className="end-sun"/><div className="end-grass grass-a"/><div className="end-grass grass-b"/><div className="end-person"><i/><b/></div><span>THE END</span><small>...for this chapter.</small></div>
              </>}
              <small className="page-number">0{page * 2 + 1}</small>
            </article>
            <article className={`page right-page spread-right spread-kind-${page}`}>
              {page === 0 ? <>
                <div className="cover-inside"><span className="issue-label">A LOVE NOTE IN PRINT</span><span className="inside-star">✦</span><h3>Someone<br/><em>extraordinary.</em></h3><p>A little collection of memories, little things, and all the reasons today deserves to be celebrated.</p><div className="cover-seal">ONE OF<br/>A KIND</div><div className="cover-index"><span>01 — THE LITTLE THINGS</span><span>02 — YOUR KIND OF MAGIC</span><span>03 — A NOTE FOR YOU</span></div></div>
              </> : <>
                <div className="spread-label">{pages[page].label}</div><div className="editorial-copy"><span className="editorial-mark">{page===1?'✳':page===2?'♡':page===3?'✦':page===4?'♥':'✧'}</span><h3>{pages[page].title}</h3><p>{pages[page].text}</p><div className="page-note">{pages[page].note}</div><div className="flourish">— with love, always —</div></div>
                {page === 1 && <div className="tiny-photo-strip"><span/><span/><span/></div>}
                {page === 2 && <div className="margin-doodle">you make<br/>life sweeter <b>♡</b></div>}
                {page === 3 && <div className="birthday-ticket"><span>ADMIT ONE</span><b>YOUR<br/>BIRTHDAY</b><small>THE BEST DAY OF THE YEAR</small></div>}
                {page === 4 && <div className="letter-postmark">SEALED WITH<br/>LOVE <span>♥</span></div>}
                {page === 5 && <div className="end-quote">“The best stories<br/>keep going.”</div>}
              </>}
              <small className="page-number">{page === 5 ? '∞' : '0'+(page*2+2)}</small>
            </article>
          </div>
          <div className="page-controls magazine-controls"><button disabled={page===0 || pageAnimating} onClick={() => turnPage(-1)} aria-label="Previous spread"><ArrowLeft size={17}/></button><span><b>0{page+1}</b><i>/</i> 0{pages.length}</span><button disabled={page===pages.length-1 || pageAnimating} onClick={() => turnPage(1)} aria-label="Next spread"><ArrowRight size={17}/></button></div>
          <div className="magazine-bottom-meta"><span>TURN THE PAGE, KEEP THE MOMENT</span><span>♥</span><span>MADE JUST FOR YOU</span></div>
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
