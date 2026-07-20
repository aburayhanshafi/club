const canvas = document.getElementById('facecard-canvas');
const ctx = canvas.getContext('2d');

// Form inputs
const imageUpload = document.getElementById('image-upload');
const zoomSlider  = document.getElementById('zoom-slider');
const downloadBtn = document.getElementById('download-btn');
const activeLayerHint = document.getElementById('active-layer-indicator');
const overlayHint = document.getElementById('overlay-hint');
const photoControls = document.getElementById('photo-controls');
const uploadLabel = document.getElementById('upload-label');

// =====================================================
// STATE
// =====================================================
let userPhoto  = null;
let photoX     = 0, photoY = 0, photoScale = 1;
let isDragging = false;
let startX, startY;

// Frame image
let frameImage = null;

// =====================================================
// CANVAS SIZE — matches the frame image aspect ratio (1279:1600)
// =====================================================
const CANVAS_W = 960;
const CANVAS_H = 1200;
canvas.width  = CANVAS_W;
canvas.height = CANVAS_H;

// =====================================================
// WHITE BOX COORDINATES inside the Mechanical Carnival frame
// Frame original: 1279 × 1600
// Canvas: 960 × 1200 (scale = 960/1279 = 0.75, 1200/1600 = 0.75)
// White area in original: approx x=168, y=352, w=958, h=680
// Scaled to canvas: x*0.75, y*0.75
// =====================================================
const PHOTO_BOX = {
    x: 126,   // 168 * 0.75
    y: 264,   // 352 * 0.75
    w: 718,   // 958 * 0.75
    h: 510,   // 680 * 0.75
    radius: 16
};

// =====================================================
// LOAD FRAME IMAGE
// =====================================================
function loadFrame() {
    frameImage = new Image();
    frameImage.onload = () => {
        draw();
    };
    frameImage.onerror = () => {
        console.warn('Frame image failed to load');
        draw();
    };
    // Use base64 embedded data URL (works with file:// protocol, no CORS issues)
    if (typeof FRAME_DATA_URL !== 'undefined') {
        frameImage.src = FRAME_DATA_URL;
    } else {
        // Fallback: try loading from file
        frameImage.src = 'frame.jpg';
    }
}

// =====================================================
// MAIN DRAW FUNCTION
// =====================================================
function draw() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 1. Draw background (dark blue matching the frame)
    const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bg.addColorStop(0, '#0e1f4a');
    bg.addColorStop(0.5, '#132060');
    bg.addColorStop(1, '#0a1535');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 2. Draw user photo FIRST (it goes BEHIND the frame)
    if (userPhoto) {
        ctx.save();
        // Clip to the white box area
        roundRectPath(PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        ctx.clip();
        ctx.drawImage(
            userPhoto,
            photoX, photoY,
            userPhoto.width  * photoScale,
            userPhoto.height * photoScale
        );
        ctx.restore();
    } else {
        // Placeholder when no photo uploaded
        drawPlaceholder();
    }

    // 3. Draw the frame ON TOP of the photo
    if (frameImage && frameImage.complete && frameImage.naturalWidth > 0) {
        ctx.drawImage(frameImage, 0, 0, CANVAS_W, CANVAS_H);
    } else {
        // Fallback: draw a minimal frame outline so the tool is still usable
        drawFallbackFrame();
    }
}

// =====================================================
// PLACEHOLDER (before photo is uploaded)
// =====================================================
function drawPlaceholder() {
    ctx.save();
    roundRectPath(PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);

    // Subtle fill
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();

    // Dashed border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(247,201,72,0.5)';
    ctx.setLineDash([12, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Upload icon
    const cx = PHOTO_BOX.x + PHOTO_BOX.w / 2;
    const cy = PHOTO_BOX.y + PHOTO_BOX.h / 2;

    ctx.fillStyle = 'rgba(247,201,72,0.7)';
    ctx.font = '700 52px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', cx, cy - 30);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '700 22px Inter, Arial';
    ctx.fillText('আপনার ছবি এখানে বসবে', cx, cy + 30);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '500 16px Inter, Arial';
    ctx.fillText('নিজের বা গ্রুপ ছবি আপলোড করুন', cx, cy + 62);

    ctx.restore();
}

// =====================================================
// FALLBACK FRAME (if frame.png not loaded)
// =====================================================
function drawFallbackFrame() {
    // Dark navy border panels
    ctx.fillStyle = '#0e1f4a';
    // Top bar
    ctx.fillRect(0, 0, CANVAS_W, 135);
    // Bottom bar
    ctx.fillRect(0, CANVAS_H - 175, CANVAS_W, 175);
    // Left strip
    ctx.fillRect(0, 135, 148, CANVAS_H - 310);
    // Right strip
    ctx.fillRect(CANVAS_W - 148, 135, 148, CANVAS_H - 310);

    // White photo box border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    roundRectPath(PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
    ctx.stroke();

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MECHANICAL', CANVAS_W / 2, 48);

    ctx.fillStyle = '#c0392b';
    ctx.font = '900 58px Inter, Arial';
    ctx.fillText('CARNIVAL', CANVAS_W / 2, 96);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px Inter, Arial';
    ctx.fillText('2026', CANVAS_W / 2, 126);

    // Bottom hashtag
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px Inter, Arial';
    ctx.fillText('SHARE YOUR', CANVAS_W / 2, CANVAS_H - 105);
    ctx.fillStyle = '#f7c948';
    ctx.font = '700 20px Inter, Arial';
    ctx.fillText('#MECHANICALCARNIVAL2026 MOMENT!', CANVAS_W / 2, CANVAS_H - 70);
}

// =====================================================
// ROUNDED RECT PATH HELPER
// =====================================================
function roundRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
}

// =====================================================
// IMAGE UPLOAD
// =====================================================
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            userPhoto = img;

            // Auto-fit the photo to fill the photo box
            const scaleX = PHOTO_BOX.w / img.width;
            const scaleY = PHOTO_BOX.h / img.height;
            photoScale = Math.max(scaleX, scaleY);

            // Center inside the box
            photoX = PHOTO_BOX.x + (PHOTO_BOX.w - img.width  * photoScale) / 2;
            photoY = PHOTO_BOX.y + (PHOTO_BOX.h - img.height * photoScale) / 2;

            // Update zoom slider range
            zoomSlider.min   = (photoScale * 0.3).toFixed(3);
            zoomSlider.max   = (photoScale * 5).toFixed(3);
            zoomSlider.value = photoScale;
            zoomSlider.step  = (photoScale * 0.01).toFixed(4);

            // Show controls
            photoControls.style.display = 'flex';
            overlayHint.style.display   = 'none';
            uploadLabel.classList.add('has-image');

            // Change upload label text
            uploadLabel.querySelector('span').textContent = '✅ ছবি আপলোড হয়েছে';
            uploadLabel.querySelector('small').textContent = 'নতুন ছবি দিতে আবার ক্লিক করুন';

            showHint('📸 ছবি drag করে সরান, zoom করুন');
            draw();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

// =====================================================
// ZOOM
// =====================================================
zoomSlider.addEventListener('input', (e) => {
    const newScale = parseFloat(e.target.value);
    // Keep centered while zooming
    const centerX = photoX + (userPhoto.width  * photoScale) / 2;
    const centerY = photoY + (userPhoto.height * photoScale) / 2;
    photoScale = newScale;
    photoX = centerX - (userPhoto.width  * photoScale) / 2;
    photoY = centerY - (userPhoto.height * photoScale) / 2;
    draw();
});

// =====================================================
// DRAG TO REPOSITION
// =====================================================
function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
        y: (e.clientY - rect.top)  * (CANVAS_H / rect.height)
    };
}

canvas.addEventListener('mousedown', (e) => {
    if (!userPhoto) return;
    const {x, y} = getCanvasCoords(e);
    // Allow drag anywhere on canvas
    isDragging = true;
    startX = x - photoX;
    startY = y - photoY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !userPhoto) return;
    const {x, y} = getCanvasCoords(e);
    photoX = x - startX;
    photoY = y - startY;
    draw();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    if (!userPhoto || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const {x, y} = getCanvasCoords(touch);
    isDragging = true;
    startX = x - photoX;
    startY = y - photoY;
}, {passive: false});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const {x, y} = getCanvasCoords(touch);
    photoX = x - startX;
    photoY = y - startY;
    draw();
}, {passive: false});

window.addEventListener('touchend', () => { isDragging = false; });

// =====================================================
// HINT INDICATOR
// =====================================================
function showHint(msg) {
    activeLayerHint.textContent = msg;
    activeLayerHint.classList.add('show');
    setTimeout(() => activeLayerHint.classList.remove('show'), 2500);
}

// =====================================================
// DOWNLOAD
// =====================================================
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'MechanicalCarnival2026_Frame.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showHint('✅ Download সম্পন্ন হয়েছে!');
});

// =====================================================
// INIT — load frame then draw
// =====================================================
loadFrame();
