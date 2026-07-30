/* ============================================================
   WUB MECHANICAL CLUB — MEMBER CARD JS  (fixed & clean)
   ============================================================ */
'use strict';

// ── Canvas setup ──────────────────────────────────────────
const canvas = document.getElementById('card-canvas');
const ctx    = canvas.getContext('2d');
const W = 1080, H = 675;
canvas.width  = W;
canvas.height = H;

// ── DOM refs ──────────────────────────────────────────────
const photoUpload = document.getElementById('photo-upload');
const uploadLabel = document.getElementById('upload-label');
const memberName  = document.getElementById('member-name');
const memberId    = document.getElementById('member-id');
const memberDept  = document.getElementById('member-dept');
const memberBatch = document.getElementById('member-batch');
const memberRole  = document.getElementById('member-role');
const validThru   = document.getElementById('valid-thru');
const cardNumber  = document.getElementById('card-number');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const toast       = document.getElementById('toast');

// ── Palette ───────────────────────────────────────────────
const C = {
  tealDark  : '#0d3f3f',
  teal      : '#1a6b6b',
  tealMid   : '#155c5c',
  tealLight : '#22998f',
  gold      : '#c9a84c',
  goldLight : '#e8c96a',
  cream     : '#f4f0e8',
  offWhite  : '#f8f5ee',
  darkText  : '#1a2828',
  red       : '#8b2020',
  borderTeal: '#2a8888',
  bronze    : '#c98a38',
  bronzeDk  : '#8a5020'
};

// ── State ─────────────────────────────────────────────────
let memberPhoto = null;
let cardReady   = false;

// ── Photo upload ──────────────────────────────────────────
photoUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      memberPhoto = img;
      uploadLabel.classList.add('has-photo');
      uploadLabel.querySelector('span').textContent = '✅ Photo Uploaded';
      uploadLabel.querySelector('small').textContent = 'Click to change photo';
      showToast('📸 Photo ready! Click Generate Card.');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ── Generate ──────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  if (!memberName.value.trim()) {
    showToast('⚠️ Please enter the member name!');
    memberName.focus(); return;
  }
  if (!memberId.value.trim()) {
    showToast('⚠️ Please enter the Member ID!');
    memberId.focus(); return;
  }
  drawCard();
  downloadBtn.disabled = false;
  cardReady = true;
  showToast('✅ Card ready! Click Download to save.');
});

// ── Download ──────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  if (!cardReady) return;
  const safe = (memberName.value.trim() || 'member').replace(/\s+/g,'_');
  const a = document.createElement('a');
  a.download = `WUB_MechClub_${safe}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('⬇️ Downloaded successfully!');
});

// ── Live update ───────────────────────────────────────────
[memberName,memberId,memberDept,memberBatch,memberRole,validThru,cardNumber]
  .forEach(el => el.addEventListener('input', () => { if (cardReady) drawCard(); }));

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Helpers ───────────────────────────────────────────────
function rr(x,y,w,h,r) {           // rounded rect path
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w,y,   x+w,y+h, r);
  ctx.arcTo(x+w,y+h, x,  y+h, r);
  ctx.arcTo(x,  y+h, x,  y,   r);
  ctx.arcTo(x,  y,   x+r,y,   r);
  ctx.closePath();
}

function txt(t, font, color, x, y, align='left', base='top', maxW=0) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (maxW > 0) ctx.fillText(t, x, y, maxW);
  else          ctx.fillText(t, x, y);
  ctx.restore();
}

// ═════════════════════════════════════════════════════════════
//  MAIN DRAW
// ═════════════════════════════════════════════════════════════
function drawCard() {
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawLeftPanel();
  drawRightHeader();
  drawInfoSection();
  drawPhotoBox();
  drawBottomBar();
  drawCardBorder();
}

// ────────────────────────────────────────────────────────────
// 1. BACKGROUND
// ────────────────────────────────────────────────────────────
function drawBackground() {
  // Right side cream
  rr(0,0,W,H,28);
  const bg = ctx.createLinearGradient(0,0,W,0);
  bg.addColorStop(0,    '#e8e4dc');
  bg.addColorStop(1,    C.offWhite);
  ctx.fillStyle = bg;
  ctx.fill();

  // Subtle watermark circle (right)
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = C.teal;
  ctx.lineWidth   = 1.5;
  for (let r=80; r<350; r+=55) {
    ctx.beginPath();
    ctx.arc(W*0.75, H*0.5, r, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 2. LEFT TEAL PANEL (curved)
// ────────────────────────────────────────────────────────────
function drawLeftPanel() {
  const pw = W * 0.415;

  // Panel shape with curved right edge
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(pw - 55, 0);
  ctx.bezierCurveTo(pw+50, H*0.22, pw-80, H*0.78, pw-30, H);
  ctx.lineTo(0, H);
  ctx.arcTo(0, 0, 28, 0, 28);
  ctx.closePath();

  const panelG = ctx.createLinearGradient(0,0,pw,H);
  panelG.addColorStop(0,   '#092e2e');
  panelG.addColorStop(0.4, C.tealDark);
  panelG.addColorStop(0.8, C.tealMid);
  panelG.addColorStop(1,   '#1a5555');
  ctx.fillStyle = panelG;
  ctx.fill();

  // Radial shine on panel
  const shine = ctx.createRadialGradient(pw*0.35, H*0.3, 0, pw*0.4, H*0.4, pw*0.7);
  shine.addColorStop(0,   'rgba(255,255,255,0.06)');
  shine.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = shine;
  ctx.fill();
  ctx.restore();

  // ── Circular decorations on panel ──
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(pw - 55, 0);
  ctx.bezierCurveTo(pw+50, H*0.22, pw-80, H*0.78, pw-30, H);
  ctx.lineTo(0, H);
  ctx.arcTo(0, 0, 28, 0, 28);
  ctx.closePath();
  ctx.clip();

  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let r=40; r<260; r+=42) {
    ctx.beginPath();
    ctx.arc(0, H, r, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();

  // ── Logo emblem ──
  drawEmblem(pw * 0.43, H * 0.45, 118);

  // ── ESTD text ──
  txt('ESTD. 2024', 'bold 14px Inter,Arial', 'rgba(255,255,255,0.45)',
    pw*0.43, H-36, 'center', 'middle');
}

// ────────────────────────────────────────────────────────────
// 3. EMBLEM / LOGO
// ────────────────────────────────────────────────────────────
function drawEmblem(cx, cy, R) {
  // Outer gold ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R+5, 0, Math.PI*2);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth   = 3;
  ctx.stroke();
  ctx.restore();

  // Gear teeth around ring
  drawGearTeeth(cx, cy, R+5, 28, 7, C.gold);

  // Bronze circle fill
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI*2);
  const bronzeG = ctx.createRadialGradient(cx-20, cy-20, 0, cx, cy, R);
  bronzeG.addColorStop(0, '#e0b870');
  bronzeG.addColorStop(0.5, C.bronze);
  bronzeG.addColorStop(1, C.bronzeDk);
  ctx.fillStyle = bronzeG;
  ctx.fill();
  ctx.restore();

  // Inner ring border
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R-14, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(60,25,0,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Inner circle (darker bronze)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R-18, 0, Math.PI*2);
  const innerG = ctx.createRadialGradient(cx-8,cy-8,0,cx,cy,R-18);
  innerG.addColorStop(0, '#d4aa60');
  innerG.addColorStop(1, '#8a6030');
  ctx.fillStyle = innerG;
  ctx.fill();
  ctx.restore();

  // 4 Crossed wrenches
  drawCrossedWrenches(cx, cy-8, 50);

  // Piston below wrenches
  drawPiston(cx, cy+42, 28);

  // Circular text (top arc)
  drawArcText('WUB MECHANICAL CLUB', cx, cy, R-8, -Math.PI*0.85, Math.PI*0.85, C.red, 'bold 12px Inter,Arial');

  // Bottom arc text
  drawArcText('⚙  ⚙  ⚙', cx, cy, R-10, Math.PI*0.15, Math.PI*0.85, C.gold, 'bold 14px Arial');
}

function drawGearTeeth(cx, cy, r, n, toothLen, color) {
  ctx.save();
  ctx.fillStyle = color;
  const step = (Math.PI*2)/n;
  for (let i=0; i<n; i++) {
    const a = i*step;
    ctx.save();
    ctx.translate(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
    ctx.rotate(a);
    ctx.fillRect(-2, -toothLen/2, toothLen, 4);
    ctx.restore();
  }
  ctx.restore();
}

function drawCrossedWrenches(cx, cy, size) {
  ctx.save();
  ctx.fillStyle = 'rgba(40,15,5,0.85)';

  // Two wrenches crossing (diagonal lines)
  [[45],[135]].forEach(([deg]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((deg * Math.PI)/180);
    const len=size*0.95, thick=size*0.14;

    // Handle
    rr(-thick/2, -len*0.55, thick, len*1.1, thick*0.4);
    ctx.fill();

    // Left jaw
    ctx.beginPath();
    ctx.arc(-thick*0.9, -len*0.5, thick*0.85, Math.PI*0.5, Math.PI*1.5);
    ctx.fill();

    // Right jaw
    ctx.beginPath();
    ctx.arc(thick*0.9, -len*0.5, thick*0.85, -Math.PI*0.5, Math.PI*0.5);
    ctx.fill();

    // Bottom head (round end)
    ctx.beginPath();
    ctx.arc(0, len*0.52, thick*0.8, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  });
  ctx.restore();
}

function drawPiston(cx, cy, size) {
  ctx.save();
  ctx.fillStyle = 'rgba(40,15,5,0.8)';
  // Piston head (horizontal rect)
  rr(cx - size*0.85, cy - size*0.18, size*1.7, size*0.36, 4);
  ctx.fill();
  // Shaft
  rr(cx - size*0.18, cy - size*0.7, size*0.36, size*0.55, 3);
  ctx.fill();
  ctx.restore();
}

function drawArcText(text, cx, cy, r, startAngle, endAngle, color, font) {
  ctx.save();
  ctx.font         = font;
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const total = endAngle - startAngle;
  const step  = total / Math.max(chars.length - 1, 1);

  chars.forEach((ch, i) => {
    const a = startAngle + i * step;
    ctx.save();
    ctx.translate(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
    ctx.rotate(a + Math.PI/2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 4. RIGHT HEADER (WUB / MECHANICAL CLUB / MEMBER ID CARD)
// ────────────────────────────────────────────────────────────
function drawRightHeader() {
  const startX = W * 0.43;
  const cx     = startX + (W - startX) / 2;

  // "WUB" big title
  ctx.save();
  ctx.font         = 'bold 108px Georgia,serif';
  ctx.fillStyle    = C.tealDark;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor  = 'rgba(13,63,63,0.25)';
  ctx.shadowBlur   = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText('WUB', cx, 28);
  ctx.restore();

  // "MECHANICAL CLUB"
  ctx.save();
  ctx.font         = 'bold 30px Inter,Arial';
  ctx.fillStyle    = C.darkText;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('MECHANICAL CLUB', cx, 144);
  ctx.restore();

  // Three dots divider
  ctx.save();
  ctx.fillStyle = C.teal;
  [-20,0,20].forEach(dx => {
    ctx.beginPath();
    ctx.arc(cx+dx, 194, 4.5, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.restore();

  // "MEMBER ID CARD" banner
  const bW=340, bH=44, bX=cx-bW/2, bY=203;
  const bG = ctx.createLinearGradient(bX,bY,bX+bW,bY);
  bG.addColorStop(0,   C.tealDark);
  bG.addColorStop(0.5, C.teal);
  bG.addColorStop(1,   C.tealDark);
  rr(bX, bY, bW, bH, 5);
  ctx.fillStyle = bG;
  ctx.fill();

  txt('MEMBER ID CARD', 'bold 16px Inter,Arial', '#ffffff', cx, bY+22, 'center', 'middle');
}

// ────────────────────────────────────────────────────────────
// 5. INFO FIELDS
// ────────────────────────────────────────────────────────────
function drawInfoSection() {
  const sx  = W * 0.44 + 10;
  const fw  = W * 0.34;
  const sy  = 268;
  const lh  = 70;

  const name  = (memberName.value  || 'YOUR NAME').toUpperCase();
  const id    = (memberId.value    || 'WUBMC2024001').toUpperCase();
  const dept  = (memberDept.value  || 'MECHANICAL ENGINEERING').toUpperCase();
  const role  = (memberRole.value  || 'GENERAL MEMBER').toUpperCase();
  const batch = (memberBatch.value || '').toUpperCase();
  const valid = (validThru.value   || 'DEC 2026').toUpperCase();

  const fields = [
    { lbl:'MEMBER NAME', val: name  },
    { lbl:'MEMBER ID',   val: id    },
    { lbl:'DEPARTMENT',  val: dept  },
    { lbl:'ROLE',        val: role  },
    { lbl:'VALID THRU',  val: valid + (batch ? `   •   BATCH ${batch}` : '') },
  ];

  fields.forEach((f, i) => drawField(sx, sy + i*lh, fw, f.lbl, f.val));
}

function drawField(x, y, w, label, value) {
  // Label
  txt(label, 'bold 11px Inter,Arial', C.teal, x, y, 'left', 'top', w);

  // Value — auto-shrink
  ctx.save();
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle    = C.darkText;
  let fs = 20;
  ctx.font = `bold ${fs}px Inter,Arial`;
  while (ctx.measureText(value).width > w && fs > 11) {
    fs--;
    ctx.font = `bold ${fs}px Inter,Arial`;
  }
  ctx.fillText(value, x, y+16, w);
  ctx.restore();

  // Divider line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y+46);
  ctx.lineTo(x+w, y+46);
  ctx.strokeStyle = 'rgba(26,107,107,0.22)';
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 6. PHOTO BOX
// ────────────────────────────────────────────────────────────
function drawPhotoBox() {
  const pw=148, ph=178;
  const px=W-pw-42, py=265;

  // Shadow
  ctx.save();
  ctx.shadowColor  = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur   = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;
  rr(px, py, pw, ph, 8);
  ctx.fillStyle = '#bbbbbb';
  ctx.fill();
  ctx.restore();

  // Photo or placeholder
  ctx.save();
  rr(px, py, pw, ph, 8);
  ctx.clip();

  if (memberPhoto) {
    const sc = Math.max(pw/memberPhoto.width, ph/memberPhoto.height);
    const dw = memberPhoto.width * sc,  dh = memberPhoto.height * sc;
    ctx.drawImage(memberPhoto, px+(pw-dw)/2, py+(ph-dh)/2, dw, dh);
  } else {
    // Placeholder gradient
    const pg = ctx.createLinearGradient(px, py, px, py+ph);
    pg.addColorStop(0, '#d5d2ca');
    pg.addColorStop(1, '#b8b5ae');
    ctx.fillStyle = pg;
    ctx.fillRect(px, py, pw, ph);

    // Silhouette head
    ctx.fillStyle = '#a0a09a';
    ctx.beginPath();
    ctx.arc(px+pw/2, py+60, 30, 0, Math.PI*2);
    ctx.fill();

    // Silhouette body
    ctx.beginPath();
    ctx.ellipse(px+pw/2, py+ph+10, 58, 45, 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // Border
  ctx.save();
  rr(px, py, pw, ph, 8);
  ctx.strokeStyle = C.borderTeal;
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();

  // Signature area below photo
  const sigY = py + ph + 10;

  // Decorative signature scrawl
  ctx.save();
  ctx.strokeStyle = C.darkText;
  ctx.lineWidth   = 1.8;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  const sx2 = px+18, sy2 = sigY+16;
  ctx.moveTo(sx2,      sy2+6);
  ctx.bezierCurveTo(sx2+10, sy2-10, sx2+24, sy2+14, sx2+36, sy2);
  ctx.bezierCurveTo(sx2+42, sy2-8,  sx2+54, sy2+10, sx2+66, sy2+2);
  ctx.stroke();
  ctx.restore();

  // Signature line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px+10, sigY+24);
  ctx.lineTo(px+pw-10, sigY+24);
  ctx.strokeStyle = 'rgba(26,40,40,0.35)';
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();

  txt('CLUB PRESIDENT', 'bold 11px Inter,Arial', 'rgba(26,40,40,0.5)',
    px+pw/2, sigY+28, 'center', 'top');
}

// ────────────────────────────────────────────────────────────
// 7. BOTTOM BAR
// ────────────────────────────────────────────────────────────
function drawBottomBar() {
  const cn = (cardNumber.value || '001').toUpperCase();

  // Card number (left, inside teal panel)
  txt('No. ' + cn, 'bold 13px Inter,Arial', 'rgba(255,255,255,0.4)',
    20, H-20, 'left', 'bottom');

  // University name (right)
  txt('World University of Bangladesh', '600 11px Inter,Arial',
    'rgba(26,40,40,0.4)', W-18, H-18, 'right', 'bottom');
}

// ────────────────────────────────────────────────────────────
// 8. CARD BORDER
// ────────────────────────────────────────────────────────────
function drawCardBorder() {
  ctx.save();
  rr(1, 1, W-2, H-2, 28);
  ctx.strokeStyle = 'rgba(26,107,107,0.45)';
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();
}

// ── Initial draw (shows blank card template) ──────────────
drawCard();
