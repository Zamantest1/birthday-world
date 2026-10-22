import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Configurable photo slots for Amina's birthday magazine
export const magazinePhotoSlots = {
  p1_cover: '/images/amina_photo_1.jpg',
  p2_celebrate: '/images/amina_photo_3.jpg',
  p3_journey: '/images/amina_photo_7.jpg',
  p4_spirit: '/images/amina_photo_8.jpg',
  p5_details: '/images/amina_photo_5.jpg',
  p6_scorpio: '/images/amina_photo_11.jpg',
  p7_seasons: '/images/amina_photo_2.jpg',
  p8_future: '/images/amina_photo_6.jpg',
  p9_note: '/images/amina_photo_9.jpg',
  p10_finale: '/images/amina_photo_10.jpg',
  alt_mirror: '/images/amina_photo_4.jpg',
};

export const spreads = [
  {
    label: 'THE COVER',
    title: 'In her own little world',
    badge: 'KIND HEART · CUTE CHARM · A LITTLE FIRE',
    subBadge: '7 November · The Birthday Edition',
    caption: '7 November · The Birthday Edition',
    paragraphs: [
      'Seven November. Another year of being you.',
      'A kind heart, a little stubbornness, and a spark that is unmistakably yours.',
    ],
    note: 'The Birthday Edition',
    closing: 'Made with love, especially for you.',
    photo: magazinePhotoSlots.p1_cover,
    archetype: 'cover',
  },
  {
    label: '01 / A REASON TO CELEBRATE',
    title: 'The way you make a room feel different',
    caption: 'A soft heart and a smile that feels like you.',
    paragraphs: [
      'There is something lovely about the way you can be completely yourself. You can be sweet one moment, stubborn the next, and funny without even trying.',
      'It is not about always getting things right. It is about the little things that make you you, and the warmth people get to know when they spend time with you.',
    ],
    note: 'Happy Birthday, Amina ♡',
    closing: 'Keep finding reasons to smile.',
    photo: magazinePhotoSlots.p2_celebrate,
    archetype: 'polaroid',
  },
  {
    label: '02 / SIX YEARS & COUNTING',
    title: 'Finding our way through the years',
    watermark: '6+',
    caption: 'More than six years of shared steps.',
    paragraphs: [
      'More than six years is a lot of life to share with someone.',
      'We have had good days, difficult days, moments when things felt simple, and others when they really didn\'t. We have both had things to figure out along the way.',
      'Whatever those years have looked like, they matter to me. I will always value the time we have shared and everything it has taught me.',
    ],
    note: 'More than six years, and a story that has meant a lot.',
    closing: 'Some chapters stay important, whatever comes next.',
    photo: magazinePhotoSlots.p3_journey,
    archetype: 'journey',
  },
  {
    label: '03 / HER SPIRIT',
    title: 'A little fire, a whole lot of heart',
    caption: 'Softness, spirit, and plenty of personality.',
    paragraphs: [
      'You have a gentle side, a caring heart, and a stubborn streak that definitely makes an appearance when you feel strongly about something.',
      'Honestly, that mix is part of what makes you so recognisably you. You don\'t have to make yourself smaller or change the things that make you different just to fit someone else\'s idea of who you should be.',
    ],
    note: 'Never stop being yourself.',
    closing: 'Your own kind of charm is more than enough.',
    photo: magazinePhotoSlots.p4_spirit,
    archetype: 'traits',
  },
  {
    label: '04 / ORDINARY DAYS',
    title: 'The little things that matter',
    caption: 'Not every meaningful moment needs a big occasion.',
    paragraphs: [
      'Sometimes, it is the ordinary parts of life that mean the most.',
      'The conversations that go on longer than expected. The laughter over something silly. The comfort of being able to talk about a completely unimportant thing and still enjoy the moment.',
      'Not everything meaningful has to be grand. Sometimes, the smallest moments are the ones that make a time in your life feel special.',
    ],
    note: 'It is often the little things.',
    closing: 'And the feelings attached to them.',
    photo: magazinePhotoSlots.p5_details,
    archetype: 'candid',
  },
  {
    label: '05 / A NOVEMBER SOUL',
    title: 'A little November magic',
    theme: 'scorpio',
    astrologicalMark: '♏',
    caption: '♏ 7 November · A birthday with its own little identity.',
    paragraphs: [
      'November will always have a special place on the calendar because it is the month you were born.',
      'The Scorpio theme gives this little edition its own character: a hint of mystery, a little intensity, and a reminder that everyone has their own way of seeing and feeling the world.',
      'But more than any star sign, I hope you keep discovering what matters to you and making room for the things that make you happy.',
    ],
    note: 'Born on 7 November.',
    closing: 'A day worth celebrating, simply because it is yours.',
    photo: magazinePhotoSlots.p6_scorpio,
    archetype: 'scorpio',
  },
  {
    label: '06 / THROUGH EVERY SEASON',
    title: 'Growing up along the way',
    caption: 'Every year brings a little more perspective.',
    paragraphs: [
      'We were younger when our story began. Six years later, there is more life behind us and more to learn about the people we are becoming.',
      'Growing up is not always straightforward. Plans change, perspectives shift, and sometimes we understand things differently than we once did.',
      'I hope you keep growing into a life that feels right for you. I respect that journey, and I hope the years ahead bring you plenty to feel proud of.',
    ],
    note: 'There is still so much ahead.',
    closing: 'Keep becoming the person you want to be.',
    photo: magazinePhotoSlots.p7_seasons,
    archetype: 'seasons',
  },
  {
    label: '07 / THE HORIZON',
    title: 'A future full of possibilities',
    caption: 'Your next chapter belongs to you.',
    paragraphs: [
      'There will be decisions to make and things that take time to figure out. Life rarely gives us every answer at once.',
      'Whatever the coming months bring, especially as December approaches, I hope you give yourself the time and space to choose what feels right.',
      'I want to see you happy, doing well in your work, and building a life you can genuinely feel proud of. You deserve the chance to grow in your own direction.',
    ],
    note: 'Take your time. Trust yourself.',
    closing: 'May the road ahead bring you clarity and peace.',
    photo: magazinePhotoSlots.p8_future,
    archetype: 'horizon',
  },
  {
    label: '08 / A NOTE FOR YOU',
    title: 'What I truly wish for you',
    caption: 'A few wishes, from the heart.',
    paragraphs: [
      'I hope this next year brings you more reasons to feel good about your life.',
      'I hope your efforts pay off, your worries become easier to carry, and you find people and places where you can be completely comfortable being yourself.',
      'I hope you have good health, meaningful opportunities, peaceful days, and moments that remind you how much there is to look forward to.',
      'Most of all, I hope you are happy in a way that feels real to you.',
    ],
    note: 'You deserve good things, too.',
    closing: 'Wishing you the very best, always.',
    photo: magazinePhotoSlots.p9_note,
    archetype: 'stationery',
  },
  {
    label: 'THE FINALE',
    title: 'Today is all about you',
    caption: 'Happy Birthday, Amina ♡',
    paragraphs: [
      'Today, you don\'t need to have everything figured out.',
      'It is your birthday. Take a moment to enjoy it, do something that makes you smile, and appreciate another year of being here and becoming who you are.',
      'I hope you feel celebrated, cared for, and excited about the possibilities waiting for you.',
      'You deserve a lovely birthday and a year filled with things worth looking forward to.',
    ],
    note: 'With genuine warmth and care.',
    closing: 'Happy Birthday, Amina. Enjoy your day.',
    photo: magazinePhotoSlots.p10_finale,
    archetype: 'finale',
  },
];

// Helper to draw an image with object-fit: cover inside [dx, dy, dw, dh]
function drawCoverImage(c, image, dx, dy, dw, dh) {
  if (!image || !(image.naturalWidth || image.width)) return;
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  c.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Text word wrap helper for canvas
function wrapText(c, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (c.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Paragraph block renderer for canvas
function drawParagraphs(c, paragraphs, x, startY, maxWidth, lineHeight, paragraphSpacing, align = 'center') {
  c.textAlign = align;
  let y = startY;
  for (const p of paragraphs) {
    const lines = wrapText(c, p, maxWidth);
    for (const line of lines) {
      c.fillText(line, x, y);
      y += lineHeight;
    }
    y += paragraphSpacing;
  }
  return y;
}

function makePage(page, left, image) {
  const canvas = document.createElement('canvas');
  canvas.width = 1152;
  canvas.height = 1536;
  const c = canvas.getContext('2d');
  c.scale(1.5, 1.5);
  const data = spreads[page];
  const isScorpio = data.theme === 'scorpio';
  const arch = data.archetype || 'default';

  // 1. Base paper backgrounds with organic texture
  if (isScorpio) {
    // Light & elegant celestial palette: soft lavender, cream, and lilac
    const grad = c.createLinearGradient(0, 0, 768, 1024);
    grad.addColorStop(0, '#fbf5fd');
    grad.addColorStop(0.5, '#f4eaf9');
    grad.addColorStop(1, '#f8eff5');
    c.fillStyle = grad;
    c.fillRect(0, 0, 768, 1024);

    // Subtle golden and lavender celestial dust
    for (let i = 0; i < 55; i++) {
      const sx = ((i * 123.45) % 740) + 14;
      const sy = ((i * 321.67) % 996) + 14;
      const r = (i % 6 === 0) ? 1.5 : 0.8;
      c.fillStyle = (i % 8 === 0) ? 'rgba(215, 175, 110, 0.45)' : 'rgba(165, 125, 185, 0.35)';
      c.beginPath();
      c.arc(sx, sy, r, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    // Warm ivory / linen
    c.fillStyle = arch === 'stationery' && !left ? '#faf4eb' : '#fcf8f3';
    c.fillRect(0, 0, 768, 1024);

    // Warm organic paper grain
    for (let i = 0; i < 80; i++) {
      c.fillStyle = `rgba(90, 60, 75, ${(i % 3) * 0.009})`;
      c.fillRect((i * 83.13) % 768, (i * 37.31) % 1024, 3, 3);
    }
  }

  // 2. Editorial Header
  if (arch !== 'cover' || !left) {
    c.fillStyle = isScorpio ? '#6b4a7e' : '#8b6a7a';
    c.font = '15px sans-serif';
    c.textAlign = 'center';
    const headerTitle = left
      ? (page === 0 ? 'THE BIRTHDAY EDITION' : 'AMINA · THE BIRTHDAY ISSUE')
      : data.label;
    c.fillText(headerTitle, 384, 76);

    // Hairline divider rule under header
    c.strokeStyle = isScorpio ? 'rgba(107, 74, 126, 0.25)' : 'rgba(217, 194, 172, 0.55)';
    c.beginPath();
    c.moveTo(60, 102);
    c.lineTo(708, 102);
    c.stroke();
  }

  // ==========================================
  // LEFT PAGE (PHOTO / VISUAL ESSAY)
  // ==========================================
  if (left) {
    if (arch === 'cover') {
      // High-fashion cover spread
      c.fillStyle = '#2d1f3d';
      c.font = 'bold 64px Georgia';
      c.textAlign = 'center';
      c.fillText('A M I N A', 384, 96);

      c.font = '12px sans-serif';
      c.fillStyle = '#7a526e';
      c.fillText('THE BIRTHDAY ISSUE · NOVEMBER 2026 · NO. 07', 384, 126);

      const dx = 72, dy = 150, dw = 624, dh = 670;
      drawCoverImage(c, image, dx, dy, dw, dh);

      // Gold & Plum double frame
      c.strokeStyle = 'rgba(225, 185, 140, 0.6)';
      c.lineWidth = 3;
      c.strokeRect(dx - 6, dy - 6, dw + 12, dh + 12);
      c.strokeStyle = 'rgba(74, 44, 66, 0.35)';
      c.lineWidth = 1;
      c.strokeRect(dx, dy, dw, dh);

      // Editorial badge at bottom
      c.fillStyle = '#fff9f5';
      c.fillRect(140, 848, 488, 54);
      c.strokeStyle = 'rgba(217, 185, 120, 0.7)';
      c.lineWidth = 1.5;
      c.strokeRect(140, 848, 488, 54);

      c.fillStyle = '#4a2c42';
      c.font = 'bold 13px sans-serif';
      c.textAlign = 'center';
      c.fillText('KIND HEART  ·  CUTE CHARM  ·  A LITTLE FIRE', 384, 881);

      c.fillStyle = '#8b6a7a';
      c.font = 'italic 16px Georgia';
      c.fillText('7 November  ·  The Birthday Edition', 384, 935);
    } else if (arch === 'polaroid') {
      // Polaroid-style fine-art mounted photo
      const px = 100, py = 140, pw = 568, ph = 710;
      c.save();
      c.shadowColor = 'rgba(50, 25, 45, 0.15)';
      c.shadowBlur = 18;
      c.shadowOffsetY = 10;
      c.fillStyle = '#ffffff';
      c.fillRect(px, py, pw, ph);
      c.restore();

      // Faux washi tape at top
      c.fillStyle = 'rgba(230, 210, 195, 0.65)';
      c.fillRect(334, 124, 100, 24);

      // Photo inside
      const ix = px + 24, iy = py + 24, iw = pw - 48, ih = ph - 130;
      drawCoverImage(c, image, ix, iy, iw, ih);

      // Polaroid caption
      c.fillStyle = '#5c3d4b';
      c.font = 'italic 25px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, py + ph - 55);

      c.fillStyle = '#c9a0b8';
      c.font = '18px Georgia';
      c.fillText('♡ Happy Birthday Amina ♡', 384, py + ph - 22);
    } else if (arch === 'journey') {
      // Architectural vertical crop with gold crosshairs
      const dx = 94, dy = 142, dw = 580, dh = 700;
      drawCoverImage(c, image, dx, dy, dw, dh);

      c.strokeStyle = 'rgba(215, 185, 140, 0.45)';
      c.lineWidth = 1.5;
      c.strokeRect(dx, dy, dw, dh);

      // Corner crosshairs (+)
      const len = 12;
      [[dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh]].forEach(([cx, cy]) => {
        c.beginPath();
        c.moveTo(cx - len, cy); c.lineTo(cx + len, cy);
        c.moveTo(cx, cy - len); c.lineTo(cx, cy + len);
        c.stroke();
      });

      c.fillStyle = '#5c3d4b';
      c.font = 'italic 27px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, 888);

      c.fillStyle = '#8b6a7a';
      c.font = '13px sans-serif';
      c.fillText('02 / SIX YEARS & COUNTING', 384, 922);
    } else if (arch === 'scorpio') {
      // Light & elegant celestial photo frame with subtle gold corner flourishes
      const dx = 84, dy = 140, dw = 600, dh = 700;
      drawCoverImage(c, image, dx, dy, dw, dh);

      c.strokeStyle = 'rgba(201, 165, 120, 0.65)';
      c.lineWidth = 2;
      c.strokeRect(dx, dy, dw, dh);

      // Constellation node lines
      c.strokeStyle = 'rgba(180, 140, 170, 0.45)';
      c.setLineDash([4, 4]);
      c.beginPath();
      c.moveTo(dx + 20, dy + 20); c.lineTo(dx + 70, dy + 50); c.lineTo(dx + 110, dy + 30);
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = '#5c3d4b';
      c.font = 'italic 26px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, 890);

      c.fillStyle = '#ad8b5d';
      c.font = '22px Georgia';
      c.fillText('✦  ♏  ✦', 384, 928);
    } else if (arch === 'seasons') {
      // Arched top photo crop
      const dx = 90, dy = 145, dw = 588, dh = 690;
      c.save();
      c.beginPath();
      c.moveTo(dx, dy + 60);
      c.quadraticCurveTo(dx, dy, dx + 60, dy);
      c.lineTo(dx + dw - 60, dy);
      c.quadraticCurveTo(dx + dw, dy, dx + dw, dy + 60);
      c.lineTo(dx + dw, dy + dh);
      c.lineTo(dx, dy + dh);
      c.closePath();
      c.clip();
      drawCoverImage(c, image, dx, dy, dw, dh);
      c.restore();

      c.strokeStyle = 'rgba(180, 140, 150, 0.35)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(dx, dy + 60);
      c.quadraticCurveTo(dx, dy, dx + 60, dy);
      c.lineTo(dx + dw - 60, dy);
      c.quadraticCurveTo(dx + dw, dy, dx + dw, dy + 60);
      c.lineTo(dx + dw, dy + dh);
      c.lineTo(dx, dy + dh);
      c.closePath();
      c.stroke();

      c.fillStyle = '#5c3d4b';
      c.font = 'italic 27px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, 888);

      c.fillStyle = '#ad8b5d';
      c.font = '12px sans-serif';
      c.fillText('SPRING  ·  SUMMER  ·  AUTUMN  ·  WINTER', 384, 924);
    } else {
      // Refined editorial gallery crop
      const dx = 76, dy = 142, dw = 616, dh = 705;
      drawCoverImage(c, image, dx, dy, dw, dh);

      c.strokeStyle = 'rgba(180, 150, 160, 0.35)';
      c.lineWidth = 1.5;
      c.strokeRect(dx, dy, dw, dh);

      c.fillStyle = '#5c3d4b';
      c.font = 'italic 28px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, 895);

      c.fillStyle = '#b787b5';
      c.font = '20px Georgia';
      c.fillText('♡', 384, 932);
    }
  }

  // ==========================================
  // RIGHT PAGE (EDITORIAL ESSAY / TEXT)
  // ==========================================
  else {
    if (arch === 'cover') {
      // Cover prologue / Frontispiece
      c.fillStyle = '#a77c83';
      c.font = '36px Georgia';
      c.textAlign = 'center';
      c.fillText('✦', 384, 210);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 46px Georgia';
      c.fillText('In her own', 384, 290);
      c.fillText('little world', 384, 348);

      c.strokeStyle = '#d4c2ac';
      c.beginPath();
      c.moveTo(260, 395);
      c.lineTo(508, 395);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 24px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 465, 580, 38, 24);

      c.strokeStyle = 'rgba(217, 194, 172, 0.45)';
      c.beginPath();
      c.moveTo(280, 650);
      c.lineTo(488, 650);
      c.stroke();

      c.fillStyle = '#8d787c';
      c.font = '22px sans-serif';
      c.fillText(data.note, 384, 715);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 26px Georgia';
      c.fillText(data.closing, 384, 765);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 22px Georgia';
      c.fillText('— 7 November · Made with love —', 384, 875);
    } else if (arch === 'journey') {
      // 6+ Years Journey spread with huge watermark numeral
      c.save();
      c.font = 'bold italic 260px Georgia';
      c.fillStyle = 'rgba(107, 74, 126, 0.055)';
      c.textAlign = 'center';
      c.fillText(data.watermark || '6+', 384, 570);
      c.restore();

      c.fillStyle = '#9b7cc4';
      c.font = '13px sans-serif';
      c.textAlign = 'center';
      c.fillText('02 / SIX YEARS & COUNTING', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 42px Georgia';
      c.fillText('Finding our way', 384, 275);
      c.fillText('through the years', 384, 330);

      c.strokeStyle = 'rgba(217, 194, 172, 0.6)';
      c.beginPath();
      c.moveTo(240, 375);
      c.lineTo(528, 375);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 20.5px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 430, 580, 32, 16);

      c.strokeStyle = 'rgba(217, 194, 172, 0.45)';
      c.beginPath();
      c.moveTo(280, 740);
      c.lineTo(488, 740);
      c.stroke();

      c.fillStyle = '#8d787c';
      c.font = '19px sans-serif';
      c.fillText(data.note, 384, 780);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 22px Georgia';
      c.fillText(data.closing, 384, 820);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 22px Georgia';
      c.fillText('— six years & counting —', 384, 890);
    } else if (arch === 'traits') {
      // Personality & Spirit layout
      c.fillStyle = '#b787b5';
      c.font = '36px Georgia';
      c.textAlign = 'center';
      c.fillText('♡', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 42px Georgia';
      c.fillText('A little fire,', 384, 275);
      c.fillText('a whole lot of heart', 384, 330);

      c.strokeStyle = 'rgba(217, 194, 172, 0.55)';
      c.beginPath();
      c.moveTo(240, 375);
      c.lineTo(528, 375);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 21px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 435, 580, 33, 20);

      c.strokeStyle = 'rgba(217, 194, 172, 0.45)';
      c.beginPath();
      c.moveTo(280, 715);
      c.lineTo(488, 715);
      c.stroke();

      c.fillStyle = '#8d787c';
      c.font = '20px sans-serif';
      c.fillText(data.note, 384, 760);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 23px Georgia';
      c.fillText(data.closing, 384, 800);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 22px Georgia';
      c.fillText('— so uniquely you —', 384, 890);
    } else if (arch === 'scorpio') {
      // Scorpio celestial spread (light & elegant aesthetic)
      c.fillStyle = '#ad8b5d';
      c.font = '46px Georgia';
      c.textAlign = 'center';
      c.fillText('♏', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 42px Georgia';
      c.fillText('A little November', 384, 275);
      c.fillText('magic', 384, 330);

      c.strokeStyle = 'rgba(107, 74, 126, 0.25)';
      c.beginPath();
      c.moveTo(240, 375);
      c.lineTo(528, 375);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 20.5px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 430, 580, 32, 16);

      c.strokeStyle = 'rgba(107, 74, 126, 0.2)';
      c.beginPath();
      c.moveTo(280, 735);
      c.lineTo(488, 735);
      c.stroke();

      c.fillStyle = '#6b4a7e';
      c.font = '20px sans-serif';
      c.fillText(data.note, 384, 775);

      c.fillStyle = '#49303f';
      c.font = 'italic 22px Georgia';
      c.fillText(data.closing, 384, 815);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 22px Georgia';
      c.fillText('✦  A date worth remembering  ✦', 384, 890);
    } else if (arch === 'stationery') {
      // Inset letter parchment
      c.strokeStyle = 'rgba(200, 170, 150, 0.4)';
      c.lineWidth = 1.5;
      c.strokeRect(96, 135, 576, 730);

      c.fillStyle = '#9b7cc4';
      c.font = '36px Georgia';
      c.textAlign = 'center';
      c.fillText('✉', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 40px Georgia';
      c.fillText('What I truly wish for you', 384, 268);

      c.strokeStyle = 'rgba(217, 194, 172, 0.5)';
      c.beginPath();
      c.moveTo(240, 312);
      c.lineTo(528, 312);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 19px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 360, 560, 29, 14);

      c.strokeStyle = 'rgba(217, 194, 172, 0.45)';
      c.beginPath();
      c.moveTo(280, 725);
      c.lineTo(488, 725);
      c.stroke();

      c.fillStyle = '#8d787c';
      c.font = '19px sans-serif';
      c.fillText(data.note, 384, 762);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 22px Georgia';
      c.fillText(data.closing, 384, 798);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 21px Georgia';
      c.fillText('— wishing you the very best, always —', 384, 840);
    } else if (arch === 'finale') {
      // Commemorative Finale
      c.fillStyle = '#e8c4a0';
      c.font = '36px Georgia';
      c.textAlign = 'center';
      c.fillText('✦', 384, 190);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 42px Georgia';
      c.fillText('Today is all', 384, 260);
      c.fillText('about you', 384, 312);

      c.strokeStyle = 'rgba(217, 194, 172, 0.6)';
      c.beginPath();
      c.moveTo(240, 350);
      c.lineTo(528, 350);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 19.5px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 395, 580, 30, 14);

      // Commemorative Seal
      c.beginPath();
      c.arc(384, 720, 48, 0, Math.PI * 2);
      c.fillStyle = 'rgba(245, 235, 220, 0.85)';
      c.fill();
      c.strokeStyle = 'rgba(217, 185, 120, 0.7)';
      c.lineWidth = 1.5;
      c.stroke();

      c.fillStyle = '#6b4a7e';
      c.font = 'bold 10px sans-serif';
      c.fillText('CELEBRATING AMINA', 384, 714);
      c.font = '9px sans-serif';
      c.fillStyle = '#8b6a7a';
      c.fillText('HAPPY BIRTHDAY', 384, 730);

      c.fillStyle = '#8d787c';
      c.font = '19px sans-serif';
      c.fillText(data.note, 384, 805);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 22px Georgia';
      c.fillText(data.closing, 384, 842);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 22px Georgia';
      c.fillText('— Happy Birthday, Amina ♡ —', 384, 895);
    } else {
      // Default refined layout (Polaroid, Candid, Seasons, Horizon)
      c.fillStyle = '#b787b5';
      c.font = '36px Georgia';
      c.textAlign = 'center';
      c.fillText('♡', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 40px Georgia';
      const words = data.title.split(' ');
      const split = Math.ceil(words.length / 2);
      if (words.length > 3) {
        c.fillText(words.slice(0, split).join(' '), 384, 275);
        c.fillText(words.slice(split).join(' '), 384, 328);
      } else {
        c.fillText(data.title, 384, 300);
      }

      c.strokeStyle = 'rgba(217, 194, 172, 0.5)';
      c.beginPath();
      c.moveTo(240, 365);
      c.lineTo(528, 365);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 20.5px Georgia';
      drawParagraphs(c, data.paragraphs, 384, 420, 580, 32, 16);

      c.strokeStyle = 'rgba(217, 194, 172, 0.45)';
      c.beginPath();
      c.moveTo(280, 735);
      c.lineTo(488, 735);
      c.stroke();

      c.fillStyle = '#8d787c';
      c.font = '19.5px sans-serif';
      c.fillText(data.note, 384, 780);

      c.fillStyle = '#6b4a7e';
      c.font = 'italic 23px Georgia';
      c.fillText(data.closing, 384, 820);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 22px Georgia';
      c.fillText('— with love & warmth —', 384, 890);
    }
  }

  // 3. Page numbering at bottom
  c.fillStyle = isScorpio ? '#6b4a7e' : '#8b6a7a';
  c.font = '16px sans-serif';
  c.textAlign = 'center';
  c.fillText(String(page * 2 + (left ? 1 : 2)).padStart(2, '0'), 384, 980);

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

function TurningPage({ from, to, textures, onDone, reduced }) {
  const group = useRef();
  const progress = useRef(0);
  const done = useRef(false);
  const forward = to > from;
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.75, 2.35, 40, 1);
    g.translate(0.875, 0, 0);
    return g;
  }, []);

  const frontMap = forward ? textures[from][1] : textures[to][1];
  const backMap = useMemo(() => {
    const t = (forward ? textures[to][0] : textures[from][0]).clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    t.offset.x = 1;
    t.needsUpdate = true;
    return t;
  }, [forward, from, to, textures]);

  useEffect(() => () => {
    geometry.dispose();
    backMap.dispose();
  }, [geometry, backMap]);

  useFrame((_, dt) => {
    if (!group.current) return;
    progress.current = Math.min(1, progress.current + dt / (reduced ? 0.05 : 1.65));
    const p = progress.current;
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    group.current.rotation.y = forward ? -eased * Math.PI : -Math.PI + eased * Math.PI;
    const lift = Math.sin(eased * Math.PI);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const u = positions.getX(i) / 1.75;
      positions.setZ(i, (Math.sin(u * Math.PI * 0.9) * 0.22 + u * u * (forward ? -0.18 : 0.18)) * lift);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    if (p === 1 && !done.current) {
      done.current = true;
      onDone();
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.05]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial map={frontMap} side={THREE.FrontSide} roughness={0.96} />
      </mesh>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial map={backMap} side={THREE.BackSide} roughness={0.96} />
      </mesh>
    </group>
  );
}

export default function MagazineScene({ page, turn, onTurnDone, reduced }) {
  const photoPaths = useMemo(() => spreads.map((spread) => spread.photo), []);
  const images = useTexture(photoPaths);
  const textures = useMemo(
    () =>
      spreads.map((_, i) => [
        makePage(i, true, images[i]?.image || images[0].image),
        makePage(i, false, images[i]?.image || images[0].image),
      ]),
    [images]
  );

  useEffect(() => () => textures.flat().forEach((t) => t.dispose()), [textures]);

  const leftPage = turn ? (turn.to < turn.from ? turn.to : turn.from) : page;
  const rightPage = turn ? (turn.to > turn.from ? turn.to : turn.from) : page;

  return (
    <group position={[0, 0.05, 0]} rotation={[-0.48, -0.08, -0.04]}>
      <mesh position={[0, 0, -0.07]} castShadow>
        <boxGeometry args={[3.66, 2.48, 0.1]} />
        <meshStandardMaterial color="#6b4a7e" roughness={0.8} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.89, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.75, 2.35, 0.09]} />
            <meshStandardMaterial color="#e4d7c5" roughness={0.95} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 0, -0.04 + i * 0.013]}>
              <boxGeometry args={[1.76, 2.36, 0.002]} />
              <meshStandardMaterial color="#bbae9e" />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.048]} receiveShadow>
            <planeGeometry args={[1.75, 2.35]} />
            <meshStandardMaterial
              map={textures[side === -1 ? leftPage : rightPage][side === -1 ? 0 : 1]}
              roughness={0.96}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.025]}>
        <cylinderGeometry args={[0.025, 0.025, 2.38, 12]} />
        <meshStandardMaterial color="#a59582" />
      </mesh>
      {turn && <TurningPage key={`${turn.from}-${turn.to}`} {...turn} textures={textures} onDone={onTurnDone} reduced={reduced} />}
    </group>
  );
}

try {
  useTexture.preload(Object.values(magazinePhotoSlots));
} catch (_) {}
