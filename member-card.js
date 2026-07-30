/* ============================================================
   WUB MECHANICAL CLUB — MEMBER CARD JS (New Design)
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
  tealDark  : '#0f4444',
  teal      : '#1a6b6b',
  tealMid   : '#185c5c',
  tealLight : '#22998f',
  gold      : '#c9a84c',
  white     : '#ffffff',
  offWhite  : '#fcfcfc',
  darkText  : '#2c3333',
  red       : '#b2302a',
  borderTeal: '#1a6b6b',
  bronze    : '#d09f60',
  bronzeDk  : '#a36d32',
  gray      : '#e2e2e2'
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
  drawLeftGearPanel();
  drawRightHeader();
  drawInfoSection();
  drawPhotoBox();
  drawCardBorder();
}

// ────────────────────────────────────────────────────────────
// 1. BACKGROUND
// ────────────────────────────────────────────────────────────
function drawBackground() {
  // Main background (white/off-white)
  ctx.fillStyle = C.offWhite;
  ctx.fillRect(0,0,W,H);

  // Faint watermark gears on the right
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#000000';
  drawGearPath(W*0.6, H*0.1, 150, 120, 10);
  ctx.fill();
  drawGearPath(W*0.9, H*0.8, 200, 160, 12);
  ctx.fill();
  drawGearPath(W*0.95, H*0.2, 100, 80, 8);
  ctx.fill();
  
  // Radial subtle gradient overlay to give depth
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
  grad.addColorStop(0, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(230,230,230,0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 2. LEFT GEAR PANEL
// ────────────────────────────────────────────────────────────
function drawLeftGearPanel() {
  const cx = 180, cy = H/2;
  const outerR = 400;
  const innerR = 330;
  
  // 1. Draw large teal gear background
  ctx.save();
  drawGearPath(cx, cy, outerR, innerR, 12);
  const panelG = ctx.createLinearGradient(0,0,cx+outerR,H);
  panelG.addColorStop(0,   C.tealDark);
  panelG.addColorStop(0.5, C.teal);
  panelG.addColorStop(1,   '#0d3636');
  
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = panelG;
  ctx.fill();
  
  // Teal gear inner stroke
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#329999';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 2. White circle inside the teal gear
  const whiteCircleR = 195;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, whiteCircleR, 0, Math.PI*2);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = C.white;
  ctx.fill();
  
  // Inner teal rim for the white circle
  ctx.strokeStyle = C.tealDark;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. Draw Emblem inside the white circle
  drawEmblem(cx, cy, 105);
  
  // Text curving top "WUB MECHANICAL CLUB"
  drawArcText('WUB MECHANICAL CLUB', cx, cy, 155, -Math.PI*0.82, Math.PI*0.82, C.red, '900 28px Georgia, serif');
  
  // Text curving bottom "ESTD. 2024"
  drawArcTextBottom('ESTD. 2024', cx, cy, 145, Math.PI*0.35, Math.PI*0.65, '#222222', '900 22px Georgia, serif');
}

// Helper to draw a gear path with rounded inner corners
function drawGearPath(cx, cy, outerR, innerR, teeth) {
  ctx.beginPath();
  const step = (Math.PI * 2) / teeth;
  const toothAngle = step * 0.35; 
  const gapAngle = step * 0.45;   
  const slant = (step - toothAngle - gapAngle) / 2; 

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + toothAngle;
    const a2 = a1 + slant;
    const a3 = a2 + gapAngle;
    const a4 = a3 + slant;

    ctx.arc(cx, cy, outerR, a0, a1);
    ctx.lineTo(cx + Math.cos(a2)*innerR, cy + Math.sin(a2)*innerR);
    ctx.arc(cx, cy, innerR, a2, a3);
    ctx.lineTo(cx + Math.cos(a4)*outerR, cy + Math.sin(a4)*outerR);
  }
  ctx.closePath();
}

// ────────────────────────────────────────────────────────────
// 3. EMBLEM (Center Bronze)
// ────────────────────────────────────────────────────────────
function drawEmblem(cx, cy, R) {
  // Bronze gear teeth (outer)
  ctx.save();
  ctx.fillStyle = C.bronzeDk;
  drawGearPath(cx, cy, R+12, R, 24);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Bronze circle fill
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI*2);
  const bronzeG = ctx.createRadialGradient(cx-30, cy-30, 0, cx, cy, R);
  bronzeG.addColorStop(0, '#f2d8a7');
  bronzeG.addColorStop(0.4, C.bronze);
  bronzeG.addColorStop(1, '#824e13');
  ctx.fillStyle = bronzeG;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#5a340a';
  ctx.stroke();
  ctx.restore();

  // Inner rings for detail
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R-8, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(60,25,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(cx, cy, R-25, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(60,25,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 4 Crossed wrenches
  drawCrossedWrenches(cx, cy, R*0.65);

  // Piston
  drawPiston(cx, cy+15, R*0.4);
}

function drawArcText(text, cx, cy, r, startAngle, endAngle, color, font) {
  ctx.save();
  ctx.font         = font;
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  
  // Optional shadow for the text
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;

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

function drawArcTextBottom(text, cx, cy, r, startAngle, endAngle, color, font) {
  ctx.save();
  ctx.font         = font;
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const total = endAngle - startAngle;
  const step  = total / Math.max(chars.length - 1, 1);

  chars.forEach((ch, i) => {
    const a = endAngle - i * step;
    ctx.save();
    ctx.translate(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
    // rotate so the text stands upright at the bottom
    ctx.rotate(a - Math.PI/2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function drawCrossedWrenches(cx, cy, size) {
  ctx.save();
  
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Silver gradient for tools
  const silver = ctx.createLinearGradient(cx-size, cy-size, cx+size, cy+size);
  silver.addColorStop(0, '#ffffff');
  silver.addColorStop(0.5, '#b0b0b0');
  silver.addColorStop(1, '#666666');
  
  ctx.fillStyle = silver;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;

  [[45],[135]].forEach(([deg]) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((deg * Math.PI)/180);
    const len = size*1.3, thick = size*0.25;

    // Handle
    rr(-thick/2, -len*0.6, thick, len*1.2, thick*0.2);
    ctx.fill(); ctx.stroke();

    // Left jaw
    ctx.beginPath();
    ctx.arc(-thick*0.8, -len*0.6, thick*0.9, Math.PI*0.5, Math.PI*1.5);
    ctx.fill(); ctx.stroke();

    // Right jaw
    ctx.beginPath();
    ctx.arc(thick*0.8, -len*0.6, thick*0.9, -Math.PI*0.5, Math.PI*0.5);
    ctx.fill(); ctx.stroke();
    
    // Bottom end
    ctx.beginPath();
    ctx.arc(0, len*0.6, thick*0.85, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // Hole in bottom end
    ctx.beginPath();
    ctx.arc(0, len*0.6, thick*0.4, 0, Math.PI*2);
    ctx.fillStyle = C.bronzeDk;
    ctx.fill(); ctx.stroke();

    ctx.restore();
  });
  ctx.restore();
}

function drawPiston(cx, cy, size) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;

  const silver = ctx.createLinearGradient(cx-size, cy-size, cx+size, cy+size);
  silver.addColorStop(0, '#f0f0f0');
  silver.addColorStop(1, '#888888');
  ctx.fillStyle = silver;
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;

  // Piston head
  rr(cx - size, cy - size*1.5, size*2, size*0.8, 3);
  ctx.fill(); ctx.stroke();
  
  // Piston rings (lines across head)
  ctx.beginPath();
  ctx.moveTo(cx - size, cy - size*1.2); ctx.lineTo(cx + size, cy - size*1.2);
  ctx.moveTo(cx - size, cy - size*0.9); ctx.lineTo(cx + size, cy - size*0.9);
  ctx.stroke();

  // Shaft
  rr(cx - size*0.3, cy - size*0.7, size*0.6, size*1.5, 2);
  ctx.fill(); ctx.stroke();
  
  // Pin hole in shaft
  ctx.beginPath();
  ctx.arc(cx, cy + size*0.4, size*0.15, 0, Math.PI*2);
  ctx.fillStyle = '#333';
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
// 4. RIGHT HEADER
// ────────────────────────────────────────────────────────────
function drawRightHeader() {
  const startX = 420;
  const cx = startX + (W - startX) / 2;

  // "WUB" big title
  ctx.save();
  ctx.font = '900 110px "Arial Black", Orbitron, sans-serif';
  ctx.fillStyle = C.tealDark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // Shadow effect for WUB
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 2;
  ctx.fillText('WUB', cx, 40);
  ctx.restore();

  // "MECHANICAL CLUB"
  ctx.save();
  ctx.font = '800 36px "Arial Black", Inter, sans-serif';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.letterSpacing = '2px'; 
  ctx.fillText('MECHANICAL CLUB', cx, 160);
  ctx.restore();

  // Three gears divider
  drawSmallGear(cx - 30, 220, 10, C.teal);
  drawSmallGear(cx,      220, 12, C.tealDark);
  drawSmallGear(cx + 30, 220, 10, C.teal);

  // "MEMBER ID CARD" banner
  const bW = 420, bH = 46, bY = 250;
  const bX = cx - bW/2;
  
  ctx.save();
  ctx.fillStyle = C.tealDark;
  ctx.beginPath();
  // Banner with slanted edges
  ctx.moveTo(bX + 15, bY);
  ctx.lineTo(bX + bW, bY);
  ctx.lineTo(bX + bW - 15, bY + bH);
  ctx.lineTo(bX, bY + bH);
  ctx.closePath();
  ctx.fill();
  
  // Left decorative slants
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.tealDark;
  ctx.beginPath(); ctx.moveTo(bX - 10, bY); ctx.lineTo(bX - 25, bY + bH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bX - 20, bY); ctx.lineTo(bX - 35, bY + bH); ctx.stroke();
  
  // Right decorative slants
  ctx.beginPath(); ctx.moveTo(bX + bW + 10, bY); ctx.lineTo(bX + bW - 5, bY + bH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bX + bW + 20, bY); ctx.lineTo(bX + bW + 5, bY + bH); ctx.stroke();
  
  ctx.restore();

  txt('MEMBER ID CARD', '800 22px "Arial Black", Inter', C.white, cx, bY + 23, 'center', 'middle');
}

function drawSmallGear(cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  drawGearPath(cx, cy, r, r*0.7, 8);
  ctx.fill();
  ctx.fillStyle = C.offWhite;
  ctx.beginPath(); ctx.arc(cx, cy, r*0.3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 5. INFO FIELDS
// ────────────────────────────────────────────────────────────
function drawInfoSection() {
  const sx = 460;
  const fw = 320; 
  const sy = 330;
  const lh = 75;

  const name  = (memberName.value  || 'YOUR NAME').toUpperCase();
  const id    = (memberId.value    || 'WUBMC2024001').toUpperCase();
  const dept  = (memberDept.value  || 'MECHANICAL ENGINEERING').toUpperCase();
  const valid = (validThru.value   || 'DEC 2025').toUpperCase();

  const fields = [
    { lbl: 'MEMBER NAME', val: name  },
    { lbl: 'MEMBER ID',   val: id    },
    { lbl: 'DEPARTMENT',  val: dept  },
    { lbl: 'VALID THRU',  val: valid },
  ];

  fields.forEach((f, i) => drawField(sx, sy + i*lh, fw, f.lbl, f.val));
}

function drawField(x, y, w, label, value) {
  // Label
  txt(label, 'bold 12px Inter,Arial', C.teal, x, y, 'left', 'top', w);

  // Value — auto-shrink
  ctx.save();
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle    = '#111111';
  let fs = 22;
  ctx.font = `800 ${fs}px Inter,Arial`;
  while (ctx.measureText(value).width > w && fs > 12) {
    fs--;
    ctx.font = `800 ${fs}px Inter,Arial`;
  }
  ctx.fillText(value, x, y+18, w);
  ctx.restore();

  // Divider line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y+50);
  ctx.lineTo(x+w, y+50);
  ctx.strokeStyle = C.teal;
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();
}

// ────────────────────────────────────────────────────────────
// 6. PHOTO BOX
// ────────────────────────────────────────────────────────────
function drawPhotoBox() {
  const pw = 160, ph = 200;
  const px = W - pw - 60, py = 320;

  // Photo Box Background/Border
  ctx.save();
  rr(px, py, pw, ph, 12);
  ctx.fillStyle = '#e8e8e8';
  ctx.fill();
  
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.tealDark;
  ctx.stroke();
  
  ctx.clip(); // clip photo to rounded rect

  if (memberPhoto) {
    const sc = Math.max(pw/memberPhoto.width, ph/memberPhoto.height);
    const dw = memberPhoto.width * sc,  dh = memberPhoto.height * sc;
    ctx.drawImage(memberPhoto, px+(pw-dw)/2, py+(ph-dh)/2, dw, dh);
  } else {
    // Silhouette head
    ctx.fillStyle = '#b0b0b0';
    ctx.beginPath();
    ctx.arc(px+pw/2, py+70, 35, 0, Math.PI*2);
    ctx.fill();

    // Silhouette body
    ctx.beginPath();
    ctx.ellipse(px+pw/2, py+ph+20, 65, 55, 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // Signature area below photo
  const sigY = py + ph + 25;

  // Decorative signature scrawl
  ctx.save();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  const sx2 = px+10, sy2 = sigY+10;
  ctx.moveTo(sx2, sy2);
  ctx.bezierCurveTo(sx2+20, sy2-25, sx2+30, sy2+20, sx2+50, sy2);
  ctx.bezierCurveTo(sx2+70, sy2-20, sx2+90, sy2+15, sx2+120, sy2-5);
  ctx.lineTo(sx2+140, sy2-5);
  ctx.stroke();
  ctx.restore();

  // Signature line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px, sigY + 25);
  ctx.lineTo(px+pw, sigY + 25);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.restore();

  txt('CLUB PRESIDENT', 'bold 12px Inter,Arial', C.teal, px+pw/2, sigY+32, 'center', 'top');
}

// ────────────────────────────────────────────────────────────
// 7. CARD BORDER
// ────────────────────────────────────────────────────────────
function drawCardBorder() {
  ctx.save();
  rr(2, 2, W-4, H-4, 28);
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth   = 4;
  ctx.stroke();
  ctx.restore();
}

// ── Initial draw ──────────────
// Ensure fonts are loaded before first draw if possible, or just draw immediately.
document.fonts.ready.then(() => drawCard());
drawCard();
