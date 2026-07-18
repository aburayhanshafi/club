const canvas = document.getElementById('facecard-canvas');
const ctx = canvas.getContext('2d');

// Form inputs
const imageUpload = document.getElementById('image-upload');
const zoomSlider = document.getElementById('zoom-slider');
const userNameInput = document.getElementById('user-name');
const downloadBtn = document.getElementById('download-btn');
const activeLayerHint = document.getElementById('active-layer-indicator');

// State
let userPhoto = null;
let photoX = 0, photoY = 0, photoScale = 1;
let isDragging = false;
let startX, startY;

// Constants for layout
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// =====================================================
// LAYOUT COORDINATES - Adjust these to match template
// =====================================================
const PHOTO_BOX = { x: 68, y: 255, w: 480, h: 590, radius: 22 };
const NAME_BOX  = { x: 62, y: 875, w: 490, h: 80 };

// Initial draw
drawBackground();

// Event Listeners
imageUpload.addEventListener('change', handleImageUpload);
zoomSlider.addEventListener('input', (e) => { photoScale = parseFloat(e.target.value); draw(); });
userNameInput.addEventListener('input', draw);
downloadBtn.addEventListener('click', downloadCanvas);

// Drag
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', endDrag);
canvas.addEventListener('touchstart', (e) => { if(e.touches.length===1) startDrag(e.touches[0]); }, {passive:false});
canvas.addEventListener('touchmove', (e) => { if(e.touches.length===1){ e.preventDefault(); doDrag(e.touches[0]); } }, {passive:false});
window.addEventListener('touchend', endDrag);

// ===========================
// DRAW BACKGROUND (No image)
// ===========================
function drawBackground() {
    // Main dark purple background
    const bg = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.addColorStop(0,   '#0d0630');
    bg.addColorStop(0.5, '#130a40');
    bg.addColorStop(1,   '#0a051e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Decorative glowing circles (background orbs)
    drawOrb(800, 200, 280, 'rgba(120,40,255,0.18)');
    drawOrb(100, 1100, 320, 'rgba(80,20,200,0.14)');
    drawOrb(900, 900, 200, 'rgba(247,210,58,0.06)');

    // Top: Robolution logo text area
    // Yellow top bar
    ctx.fillStyle = '#f7d23a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 14);

    // "ROBOLUTION" title
    ctx.save();
    ctx.font = '900 96px Inter, Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('ROBOLUTION', 60, 120);
    // "2025" in yellow
    ctx.fillStyle = '#f7d23a';
    ctx.font = '900 96px Inter, Arial';
    ctx.fillText('2025', 60, 210);
    ctx.restore();

    // Horizontal divider line
    ctx.strokeStyle = '#f7d23a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 230);
    ctx.lineTo(520, 230);
    ctx.stroke();

    // "Club Representative" text
    ctx.save();
    ctx.font = '500 28px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'left';
    ctx.fillText('Club Representative Card', 60, 265);
    ctx.restore();

    // Right side decorative panel
    const panelGrad = ctx.createLinearGradient(580, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    panelGrad.addColorStop(0, 'rgba(247,210,58,0.08)');
    panelGrad.addColorStop(1, 'rgba(120,40,255,0.12)');
    ctx.fillStyle = panelGrad;
    roundRect(ctx, 580, 240, 460, 860, 24);
    ctx.fill();

    ctx.strokeStyle = 'rgba(247,210,58,0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, 580, 240, 460, 860, 24);
    ctx.stroke();

    // Right side "WUB ROBOLUTION" watermark text (vertical)
    ctx.save();
    ctx.font = '700 34px Inter, Arial';
    ctx.fillStyle = 'rgba(247,210,58,0.35)';
    ctx.textAlign = 'center';
    ctx.translate(810, 680);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('ROBOLUTION 2025', 0, 0);
    ctx.restore();

    // Bottom footer bar
    const footerGrad = ctx.createLinearGradient(0, 1260, 0, 1350);
    footerGrad.addColorStop(0, 'rgba(247,210,58,0.0)');
    footerGrad.addColorStop(1, 'rgba(247,210,58,0.15)');
    ctx.fillStyle = footerGrad;
    ctx.fillRect(0, 1260, CANVAS_WIDTH, 90);

    ctx.fillStyle = '#f7d23a';
    ctx.fillRect(0, 1336, CANVAS_WIDTH, 14);

    // "POWERED BY WUB" footer
    ctx.save();
    ctx.font = '600 22px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD UNIVERSITY OF BANGLADESH', CANVAS_WIDTH / 2, 1315);
    ctx.restore();

    // Name placeholder area
    ctx.strokeStyle = 'rgba(247,210,58,0.3)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, NAME_BOX.x - 10, NAME_BOX.y - 12, NAME_BOX.w + 20, NAME_BOX.h + 24, 8);
    ctx.stroke();
}

function drawOrb(cx, cy, r, color) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

// ===========================
// MAIN DRAW FUNCTION
// ===========================
function draw() {
    // Always redraw background first
    drawBackground();

    // Draw photo (masked to PHOTO_BOX)
    if (userPhoto) {
        ctx.save();
        roundRect(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        ctx.clip();
        ctx.translate(photoX, photoY);
        ctx.scale(photoScale, photoScale);
        ctx.drawImage(userPhoto, 0, 0);
        ctx.restore();

        // White border around photo
        ctx.save();
        roundRect(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        // Gold inner glow
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(247,210,58,0.6)';
        ctx.stroke();
        ctx.restore();
    } else {
        // Placeholder area for photo
        ctx.save();
        roundRect(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.setLineDash([10, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '500 26px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Upload your photo', PHOTO_BOX.x + PHOTO_BOX.w/2, PHOTO_BOX.y + PHOTO_BOX.h/2);
        ctx.restore();
    }

    // Draw Name
    const name = userNameInput.value.trim();
    if (name !== '') {
        ctx.save();
        // Clear old name area
        ctx.fillStyle = '#0f0838';
        ctx.fillRect(NAME_BOX.x - 12, NAME_BOX.y - 14, NAME_BOX.w + 24, NAME_BOX.h + 28);

        // Glow border
        ctx.strokeStyle = '#f7d23a';
        ctx.lineWidth = 2;
        roundRect(ctx, NAME_BOX.x - 10, NAME_BOX.y - 12, NAME_BOX.w + 20, NAME_BOX.h + 24, 8);
        ctx.stroke();

        // Draw name text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Auto-fit font size
        let fontSize = 52;
        ctx.font = `900 ${fontSize}px Inter, Arial`;
        while (ctx.measureText(name).width > NAME_BOX.w - 20 && fontSize > 24) {
            fontSize -= 2;
            ctx.font = `900 ${fontSize}px Inter, Arial`;
        }
        ctx.fillText(name, NAME_BOX.x + NAME_BOX.w / 2, NAME_BOX.y + NAME_BOX.h / 2);

        // Small "NAME" label above
        ctx.font = '600 18px Inter, Arial';
        ctx.fillStyle = '#f7d23a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('NAME', NAME_BOX.x, NAME_BOX.y - 38);

        ctx.restore();
    }
}

// ===========================
// IMAGE UPLOAD
// ===========================
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            userPhoto = img;
            const scaleX = PHOTO_BOX.w / img.width;
            const scaleY = PHOTO_BOX.h / img.height;
            photoScale = Math.max(scaleX, scaleY);
            photoX = PHOTO_BOX.x + (PHOTO_BOX.w - img.width * photoScale) / 2;
            photoY = PHOTO_BOX.y + (PHOTO_BOX.h - img.height * photoScale) / 2;
            zoomSlider.min = photoScale * 0.3;
            zoomSlider.max = photoScale * 5;
            zoomSlider.value = photoScale;
            document.querySelector('.canvas-overlay-hint').style.display = 'none';
            showHint();
            draw();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function showHint() {
    activeLayerHint.textContent = 'Drag to reposition photo';
    activeLayerHint.classList.add('show');
    setTimeout(() => activeLayerHint.classList.remove('show'), 2000);
}

// ===========================
// DRAG
// ===========================
function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function startDrag(e) {
    if (!userPhoto) return;
    const {x, y} = getCoords(e);
    if (x >= PHOTO_BOX.x && x <= PHOTO_BOX.x + PHOTO_BOX.w &&
        y >= PHOTO_BOX.y && y <= PHOTO_BOX.y + PHOTO_BOX.h) {
        isDragging = true;
        startX = x - photoX;
        startY = y - photoY;
    }
}

function doDrag(e) {
    if (!isDragging) return;
    const {x, y} = getCoords(e);
    photoX = x - startX;
    photoY = y - startY;
    draw();
}

function endDrag() { isDragging = false; }

// ===========================
// DOWNLOAD
// ===========================
function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'robolution_card.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
