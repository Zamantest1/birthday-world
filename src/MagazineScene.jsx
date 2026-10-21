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
    title: 'Amina, in her own little world',
    caption: '7 November · Kind Heart, Cute Charm, A Little Fire',
    lines: [
      'A kind heart, a cute little charm,',
      'and a spark that makes her',
      'unmistakably herself.',
    ],
    note: 'The Birthday Edition',
    end: 'A celebration made by hand for you.',
    photo: magazinePhotoSlots.p1_cover,
    archetype: 'cover',
  },
  {
    label: '01 / A REASON TO CELEBRATE',
    title: 'A day worth celebrating',
    caption: 'Today, the world gets another reason to celebrate you.',
    lines: [
      'Some people bring warmth into',
      'the room just by being in it.',
      'You have always had that gentle light.',
    ],
    note: 'Happy Birthday Amina ♡',
    end: 'May your smile stay this bright.',
    photo: magazinePhotoSlots.p2_celebrate,
    archetype: 'polaroid',
  },
  {
    label: '02 / OUR JOURNEY',
    title: 'Some stories keep unfolding',
    caption: 'More than six years of shared moments.',
    lines: [
      'More than six years of laughter,',
      'quiet days, and growing together.',
      'Not every chapter was simple,',
      'yet we kept finding our way back.',
    ],
    note: 'Through every chapter and turn,',
    end: 'I cherish the time we have shared.',
    photo: magazinePhotoSlots.p3_journey,
    archetype: 'journey',
  },
  {
    label: '03 / HER SPIRIT',
    title: 'A little fire, a lot of heart',
    caption: 'So uniquely, wonderfully you.',
    lines: [
      'A little fire in her spirit,',
      'a whole lot of kindness in her heart.',
      'Strong-minded, deeply caring,',
      'and always true to herself.',
    ],
    note: 'Never change who you are,',
    end: 'that spark is what makes you special.',
    photo: magazinePhotoSlots.p4_spirit,
    archetype: 'traits',
  },
  {
    label: '04 / THE LITTLE THINGS',
    title: 'The beauty is in the details',
    caption: 'Little moments, big happiness ♡',
    lines: [
      'Your expressions, your tiny habits,',
      'the sudden bursts of laughter,',
      'and the quiet ways you show care.',
      'It is the little things that stay.',
    ],
    note: 'In between the big days,',
    end: 'are the memories I hold close.',
    photo: magazinePhotoSlots.p5_details,
    archetype: 'candid',
  },
  {
    label: '05 / SCORPIO MAGIC',
    title: 'A Scorpio kind of magic',
    theme: 'scorpio',
    caption: '♏ 7 November · Deep, intuitive, and radiant.',
    lines: [
      'Born under the quiet November sky,',
      'with a mind that feels deeply',
      'and a spirit that burns bright.',
      'A little mystery, a lot of magic.',
    ],
    note: '7 November',
    end: 'A date worth remembering, always.',
    photo: magazinePhotoSlots.p6_scorpio,
    archetype: 'scorpio',
  },
  {
    label: '06 / THROUGH EVERY SEASON',
    title: 'Every chapter has its place',
    caption: 'Different seasons, same us ♡',
    lines: [
      'Through sunny days and quiet storms,',
      'warm summer afternoons and winter chills,',
      'we have weathered so much together.',
      'Every chapter had its own meaning.',
    ],
    note: 'No matter how the seasons change,',
    end: 'gratitude remains constant.',
    photo: magazinePhotoSlots.p7_seasons,
    archetype: 'seasons',
  },
  {
    label: '07 / THE HORIZON',
    title: 'Your story is still becoming',
    caption: 'Happiness · Opportunities · Beautiful Days',
    lines: [
      'You have so much life ahead of you,',
      'so many dreams waiting to unfold.',
      'May this year bring gentle beginnings,',
      'peace of mind, and the strength to fly.',
    ],
    note: 'Keep dreaming, keep growing,',
    end: 'the best is yet to come.',
    photo: magazinePhotoSlots.p8_future,
    archetype: 'horizon',
  },
  {
    label: '08 / A NOTE FOR YOU',
    title: 'A little note for you',
    caption: 'Always wishing you the very best.',
    lines: [
      'In a world that is always rushing,',
      'I hope you always remember your worth.',
      'Whatever choices and paths come next,',
      'I want you to be genuinely happy.',
    ],
    note: 'You deserve peace and gentleness,',
    end: 'and a life full of warmth.',
    photo: magazinePhotoSlots.p9_note,
    archetype: 'stationery',
  },
  {
    label: 'THE FINALE',
    title: 'Wherever life takes you',
    caption: 'Happy Birthday, Amina ♡',
    lines: [
      'Wherever your journey leads,',
      'walk forward with your head held high.',
      'Celebrate today with all your heart.',
      'Happy Birthday, Amina.',
    ],
    note: 'With warmth, respect, and care,',
    end: 'Always wishing you happiness.',
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

function makePage(page, left, image) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const c = canvas.getContext('2d');
  const data = spreads[page];
  const isScorpio = data.theme === 'scorpio';
  const arch = data.archetype || 'default';

  // 1. Base paper backgrounds with organic texture
  if (isScorpio) {
    const grad = c.createLinearGradient(0, 0, 768, 1024);
    grad.addColorStop(0, '#150b20');
    grad.addColorStop(0.5, '#261336');
    grad.addColorStop(1, '#1a0e28');
    c.fillStyle = grad;
    c.fillRect(0, 0, 768, 1024);

    // Starlight dust
    for (let i = 0; i < 450; i++) {
      const sx = ((i * 123.45) % 740) + 14;
      const sy = ((i * 321.67) % 996) + 14;
      const r = (i % 6 === 0) ? 1.7 : 0.85;
      c.fillStyle = (i % 8 === 0) ? 'rgba(235, 200, 165, 0.85)' : 'rgba(215, 165, 205, 0.55)';
      c.beginPath();
      c.arc(sx, sy, r, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    // Warm ivory / linen
    c.fillStyle = arch === 'stationery' && !left ? '#faf4eb' : '#fcf8f3';
    c.fillRect(0, 0, 768, 1024);

    // Warm organic paper grain
    for (let i = 0; i < 5500; i++) {
      c.fillStyle = `rgba(90, 60, 75, ${(i % 3) * 0.007})`;
      c.fillRect((i * 83.13) % 768, (i * 37.31) % 1024, 2, 2);
    }
  }

  // 2. Editorial Header
  if (arch !== 'cover' || !left) {
    c.fillStyle = isScorpio ? '#d4a0c8' : '#8b6a7a';
    c.font = '15px sans-serif';
    c.textAlign = 'center';
    const headerTitle = left
      ? (page === 0 ? 'THE BIRTHDAY EDITION' : 'AMINA · THE BIRTHDAY ISSUE')
      : data.label;
    c.fillText(headerTitle, 384, 76);

    // Hairline divider rule under header
    c.strokeStyle = isScorpio ? 'rgba(212, 160, 200, 0.35)' : 'rgba(217, 194, 172, 0.55)';
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
      c.fillText('CHAPTER 02 · SHARED MEMORIES', 384, 922);
    } else if (arch === 'scorpio') {
      // Celestial starry photo with gold flourishes
      const dx = 84, dy = 140, dw = 600, dh = 700;
      drawCoverImage(c, image, dx, dy, dw, dh);

      c.strokeStyle = 'rgba(235, 195, 140, 0.55)';
      c.lineWidth = 2;
      c.strokeRect(dx, dy, dw, dh);

      // Constellation node lines
      c.strokeStyle = 'rgba(235, 195, 140, 0.4)';
      c.setLineDash([4, 4]);
      c.beginPath();
      c.moveTo(dx + 20, dy + 20); c.lineTo(dx + 70, dy + 50); c.lineTo(dx + 110, dy + 30);
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = '#f5eaff';
      c.font = 'italic 27px Georgia';
      c.textAlign = 'center';
      c.fillText(data.caption, 384, 890);

      c.fillStyle = '#e8c4a0';
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
      // Default / refined editorial gallery crop
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
      c.font = '40px Georgia';
      c.textAlign = 'center';
      c.fillText('✦', 384, 220);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 52px Georgia';
      c.fillText('In her own', 384, 320);
      c.fillText('little world', 384, 385);

      c.strokeStyle = '#d4c2ac';
      c.beginPath();
      c.moveTo(260, 435);
      c.lineTo(508, 435);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 30px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 520 + i * 50);
      });

      c.fillStyle = '#8d787c';
      c.font = '22px sans-serif';
      c.fillText(data.note, 384, 755);
      c.fillText(data.end, 384, 792);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 24px Georgia';
      c.fillText('— 7 November · Made with love —', 384, 895);
    } else if (arch === 'journey') {
      // 6+ Years Journey spread with huge watermark numeral
      c.save();
      c.font = 'bold italic 260px Georgia';
      c.fillStyle = 'rgba(107, 74, 126, 0.055)';
      c.textAlign = 'center';
      c.fillText('6+', 384, 570);
      c.restore();

      c.fillStyle = '#9b7cc4';
      c.font = '13px sans-serif';
      c.textAlign = 'center';
      c.fillText('CHAPTER 02 · 2018 — TODAY', 384, 210);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 46px Georgia';
      c.fillText('Some stories', 384, 310);
      c.fillText('keep unfolding', 384, 370);

      c.strokeStyle = 'rgba(217, 194, 172, 0.6)';
      c.beginPath();
      c.moveTo(240, 420); c.lineTo(528, 420);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 28px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 500 + i * 46);
      });

      c.fillStyle = '#8d787c';
      c.font = '21px sans-serif';
      c.fillText(data.note, 384, 755);
      c.fillText(data.end, 384, 792);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 24px Georgia';
      c.fillText('— six years & counting —', 384, 892);
    } else if (arch === 'traits') {
      // Personality Traits Layout
      c.fillStyle = '#b787b5';
      c.font = '40px Georgia';
      c.textAlign = 'center';
      c.fillText('♡', 384, 195);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 44px Georgia';
      c.fillText('A little fire,', 384, 280);
      c.fillText('a lot of heart', 384, 335);

      // 3 Structured trait cards
      const traits = [
        { no: '01', title: 'KIND HEART', desc: 'A whole lot of kindness in her heart.' },
        { no: '02', title: 'CUTE CHARM', desc: 'A spark that makes her unmistakably herself.' },
        { no: '03', title: 'A LITTLE FIRE', desc: 'Strong-minded, spirited, and always true.' },
      ];

      traits.forEach((t, i) => {
        const ty = 410 + i * 110;
        c.fillStyle = '#f5eef8';
        c.fillRect(140, ty, 488, 86);
        c.strokeStyle = 'rgba(201, 176, 232, 0.5)';
        c.lineWidth = 1;
        c.strokeRect(140, ty, 488, 86);

        c.fillStyle = '#6b4a7e';
        c.font = 'bold 13px sans-serif';
        c.textAlign = 'left';
        c.fillText(`${t.no} · ${t.title}`, 166, ty + 34);

        c.fillStyle = '#49303f';
        c.font = 'italic 21px Georgia';
        c.fillText(t.desc, 166, ty + 64);
      });

      c.fillStyle = '#8d787c';
      c.font = '20px sans-serif';
      c.textAlign = 'center';
      c.fillText(data.note, 384, 785);
      c.fillText(data.end, 384, 818);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 24px Georgia';
      c.fillText('— so uniquely you —', 384, 895);
    } else if (arch === 'scorpio') {
      // Scorpio celestial spread
      c.fillStyle = '#e8c4a0';
      c.font = '54px Georgia';
      c.textAlign = 'center';
      c.fillText('♏', 384, 215);

      c.fillStyle = '#f5eaff';
      c.font = 'italic 46px Georgia';
      c.fillText('A Scorpio kind', 384, 310);
      c.fillText('of magic', 384, 370);

      c.strokeStyle = 'rgba(212, 160, 200, 0.35)';
      c.beginPath();
      c.moveTo(220, 420); c.lineTo(548, 420);
      c.stroke();

      c.fillStyle = '#e8d5f5';
      c.font = 'italic 29px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 505 + i * 48);
      });

      c.fillStyle = '#c9b0e8';
      c.font = '21px sans-serif';
      c.fillText('Born 7 November', 384, 765);
      c.fillText(data.end, 384, 802);

      c.fillStyle = '#e8c4a0';
      c.font = 'italic 25px Georgia';
      c.fillText('✦  A date worth remembering  ✦', 384, 895);
    } else if (arch === 'stationery') {
      // Inset letter parchment
      c.strokeStyle = 'rgba(200, 170, 150, 0.4)';
      c.lineWidth = 1.5;
      c.strokeRect(100, 140, 568, 720);

      c.fillStyle = '#b787b5';
      c.font = '40px Georgia';
      c.textAlign = 'center';
      c.fillText('✉', 384, 215);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 46px Georgia';
      c.fillText('A little note for you', 384, 310);

      c.strokeStyle = 'rgba(217, 194, 172, 0.5)';
      c.beginPath();
      c.moveTo(240, 365); c.lineTo(528, 365);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 28px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 465 + i * 48);
      });

      c.fillStyle = '#8d787c';
      c.font = '21px sans-serif';
      c.fillText(data.note, 384, 720);
      c.fillText(data.end, 384, 755);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 25px Georgia';
      c.fillText('— with gratitude & warmth —', 384, 825);
    } else if (arch === 'finale') {
      // Commemorative Finale
      c.fillStyle = '#e8c4a0';
      c.font = '40px Georgia';
      c.textAlign = 'center';
      c.fillText('✦', 384, 205);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 46px Georgia';
      c.fillText('Wherever life', 384, 295);
      c.fillText('takes you', 384, 355);

      c.strokeStyle = 'rgba(217, 194, 172, 0.6)';
      c.beginPath();
      c.moveTo(220, 405); c.lineTo(548, 405);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 29px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 485 + i * 48);
      });

      // Commemorative Seal
      c.beginPath();
      c.arc(384, 755, 68, 0, Math.PI * 2);
      c.fillStyle = 'rgba(245, 235, 220, 0.8)';
      c.fill();
      c.strokeStyle = 'rgba(217, 185, 120, 0.7)';
      c.lineWidth = 2;
      c.stroke();

      c.fillStyle = '#6b4a7e';
      c.font = 'bold 11px sans-serif';
      c.fillText('CELEBRATING AMINA', 384, 745);
      c.font = '10px sans-serif';
      c.fillStyle = '#8b6a7a';
      c.fillText('ALWAYS IN YOUR CORNER', 384, 768);

      c.fillStyle = '#ad8b5d';
      c.font = 'italic 25px Georgia';
      c.fillText('— Happy Birthday, Amina ♡ —', 384, 895);
    } else {
      // Default refined layout
      c.fillStyle = '#b787b5';
      c.font = '48px Georgia';
      c.textAlign = 'center';
      c.fillText('♡', 384, 235);

      c.fillStyle = '#2d1f3d';
      c.font = 'italic 46px Georgia';
      const words = data.title.split(' ');
      const split = Math.ceil(words.length / 2);
      if (words.length > 3) {
        c.fillText(words.slice(0, split).join(' '), 384, 345);
        c.fillText(words.slice(split).join(' '), 384, 405);
      } else {
        c.fillText(data.title, 384, 370);
      }

      c.strokeStyle = 'rgba(217, 194, 172, 0.5)';
      c.beginPath();
      c.moveTo(220, 450); c.lineTo(548, 450);
      c.stroke();

      c.fillStyle = '#49303f';
      c.font = 'italic 29px Georgia';
      data.lines.forEach((line, i) => {
        c.fillText(line, 384, 520 + i * 46);
      });

      c.fillStyle = '#8d787c';
      c.font = '21px sans-serif';
      c.fillText(data.note, 384, 760);
      c.fillText(data.end, 384, 796);

      c.fillStyle = '#a27a8e';
      c.font = 'italic 25px Georgia';
      c.fillText('— with love & warmth —', 384, 895);
    }
  }

  // 3. Page numbering at bottom
  c.fillStyle = isScorpio ? '#bca5d4' : '#8b6a7a';
  c.font = '16px sans-serif';
  c.textAlign = 'center';
  c.fillText(String(page * 2 + (left ? 1 : 2)).padStart(2, '0'), 384, 980);

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
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
