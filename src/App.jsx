import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CakeSlice, Gift, Heart, Sparkles, Volume2 } from 'lucide-react';

const pages = [
  { label: 'CHAPTER 01', title: 'The little things', text: 'The tiny moments that somehow become the biggest memories.' },
  { label: 'CHAPTER 02', title: 'Your kind of magic', text: 'The way you make ordinary days feel a little more golden.' },
  { label: 'CHAPTER 03', title: 'A note for you', text: 'The world got a little brighter on the day you arrived.' },
];

export default function App() {
  const [candleOut, setCandleOut] = useState(false);
  const [sliceServed, setSliceServed] = useState(false);
  const [page, setPage] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);

  const goToCake = () => document.getElementById('cake')?.scrollIntoView({ behavior: 'smooth' });

  return <main>
    <section className="hero" id="home">
      <div className="stars" />
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
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
        <p>Close your eyes, make a wish, and give that tiny candle a little birthday breeze.</p>
      </div>
      <div className="cake-stage">
        <div className="cake-glow" />
        <div className="cake">
          <div className="cake-top">
            <div className="icing-drip" />
            <div className="cake-message">Someone I love<br />was born today <b>♥</b></div>
            {!candleOut && <div className="candle"><i /></div>}
            {candleOut && <div className="smoke">〰</div>}
          </div>
          <div className="cake-side"><span className="frosting-line" /><span className="cake-decoration">✦　♡　✦　♡　✦</span></div>
        </div>
        {sliceServed && <div className="cake-slice"><span>♥</span></div>}
        <div className="cake-shadow" />
      </div>
      <div className="cake-controls">
        {!candleOut ? <button className="dark-button" onClick={() => setCandleOut(true)}><Volume2 size={17} /> Blow out the candle</button> : !sliceServed ? <button className="dark-button" onClick={() => setSliceServed(true)}><CakeSlice size={17} /> Serve me a slice</button> : <p className="cute-note">Birthday rule: the first slice is always yours. 🍰</p>}
        <p className="microcopy">{!candleOut ? 'Make a wish first. I promise not to tell.' : !sliceServed ? 'Wish granted. Now, the important part…' : 'Zero calories on birthdays. I don’t make the rules.'}</p>
      </div>
    </section>

    <section className="magazine-section section-pad" id="magazine">
      <div className="magazine-intro"><p className="eyebrow">02 / A FEW PAGES ABOUT YOU</p><h2>Your very own<br /><em>little magazine.</em></h2><p>A few words, a few memories, and all the things I hope you never forget.</p></div>
      <div className="magazine-wrap">
        <div className="book">
          <article className="page left-page"><span className="page-kicker">A SPECIAL EDITION</span><div className="page-art"><div className="sun" /><div className="hill hill-a" /><div className="hill hill-b" /><span>✦</span></div><small>0{page * 2 + 1}</small></article>
          <article className="page right-page"><span className="page-kicker">{pages[page].label}</span><div className="page-copy"><span className="tiny-heart">♡</span><h3>{pages[page].title}</h3><p>{pages[page].text}</p><div className="flourish">— with love, always —</div></div><small>0{page * 2 + 2}</small></article>
        </div>
        <div className="page-controls"><button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Previous page"><ArrowLeft size={17} /></button><span>0{page + 1} <i>/</i> 0{pages.length}</span><button disabled={page === pages.length - 1} onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))} aria-label="Next page"><ArrowRight size={17} /></button></div>
        <p className="microcopy">Turn the pages · Your personal memories can go here</p>
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