const canvas = document.getElementById('facecard-canvas');
const ctx = canvas.getContext('2d');

// Form inputs
const imageUpload = document.getElementById('image-upload');
const zoomSlider = document.getElementById('zoom-slider');
const userNameInput = document.getElementById('user-name');
const downloadBtn = document.getElementById('download-btn');
const activeLayerHint = document.getElementById('active-layer-indicator');

// State
let templateImg = null;
let userPhoto = null;

let photoX = 0, photoY = 0, photoScale = 1;

let isDragging = false;
let startX, startY;
// 'photo'
let activeLayer = 'photo'; 

// Constants for layout
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Layout coordinates
const PHOTO_BOX = { x: 75, y: 300, w: 460, h: 560, radius: 80 };
const NAME_BOX = { x: 50, y: 880, w: 510, h: 140 };

// Initial setup
loadTemplate();

// Event Listeners
imageUpload.addEventListener('change', (e) => handleImageUpload(e, 'photo'));
zoomSlider.addEventListener('input', (e) => { photoScale = parseFloat(e.target.value); draw(); });
userNameInput.addEventListener('input', draw);
downloadBtn.addEventListener('click', downloadCanvas);

// Drag Events
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
window.addEventListener('mouseup', endDrag);

canvas.addEventListener('touchstart', (e) => { if(e.touches.length === 1) startDrag(e.touches[0]); }, {passive: false});
canvas.addEventListener('touchmove', (e) => { if(e.touches.length === 1) { e.preventDefault(); drag(e.touches[0]); } }, {passive: false});
window.addEventListener('touchend', endDrag);

function loadTemplate() {
    const img = new Image();
    img.onload = () => {
        templateImg = img;
        draw();
    };
    // Tries to load template.jpg from the same directory
    img.src = 'template.jpg';
    
    // Error handling if not found
    img.onerror = () => {
        console.warn("template.jpg not found in the same folder. Waiting for user to upload it.");
        ctx.fillStyle = '#0b0629';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#f7d23a';
        ctx.font = '30px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Please place template.jpg in the folder!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    };
}

function handleImageUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            userPhoto = img;
            const scaleX = PHOTO_BOX.w / img.width;
            const scaleY = PHOTO_BOX.h / img.height;
            photoScale = Math.max(scaleX, scaleY);
            photoX = PHOTO_BOX.x + (PHOTO_BOX.w - img.width * photoScale) / 2;
            photoY = PHOTO_BOX.y + (PHOTO_BOX.h - img.height * photoScale) / 2;
            
            zoomSlider.min = photoScale * 0.2;
            zoomSlider.max = photoScale * 4;
            zoomSlider.value = photoScale;
            
            activeLayer = 'photo';

            document.querySelector('.canvas-overlay-hint').style.display = 'none';
            showActiveLayerIndicator();
            draw();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function showActiveLayerIndicator() {
    activeLayerHint.textContent = `Moving: ${activeLayer === 'photo' ? 'Your Photo' : 'Club Logo'}`;
    activeLayerHint.classList.add('show');
    setTimeout(() => {
        activeLayerHint.classList.remove('show');
    }, 2000);
}

function getEventCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrag(e) {
    const {x, y} = getEventCoords(e);
    
    // Determine which layer user clicked on based on bounding boxes
    if (x >= PHOTO_BOX.x && x <= PHOTO_BOX.x + PHOTO_BOX.w && y >= PHOTO_BOX.y && y <= PHOTO_BOX.y + PHOTO_BOX.h) {
        if (userPhoto) {
            activeLayer = 'photo';
            isDragging = true;
            startX = x - photoX;
            startY = y - photoY;
            showActiveLayerIndicator();
        }
    }
}

function drag(e) {
    if (!isDragging) return;
    const {x, y} = getEventCoords(e);
    
    if (activeLayer === 'photo' && userPhoto) {
        photoX = x - startX;
        photoY = y - startY;
    }
    
    draw();
}

function endDrag() {
    isDragging = false;
}

function drawChamferedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.lineTo(x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.lineTo(x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.closePath();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

function draw() {
    // 1. Draw Template Image
    if (templateImg) {
        ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
        ctx.fillStyle = '#0b0629';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        return; // Don't draw further if no template
    }

    // 2. Draw User Photo (Masked)
    if (userPhoto) {
        ctx.save();
        // Create the chamfered clip path
        drawChamferedRect(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        
        // Fill it with a base color just in case (erases old photo)
        ctx.fillStyle = '#100b46';
        ctx.fill();
        
        ctx.clip();
        
        // Draw the image
        ctx.translate(photoX, photoY);
        ctx.scale(photoScale, photoScale);
        ctx.drawImage(userPhoto, 0, 0);
        ctx.restore();
        
        // Draw White Border around it
        ctx.save();
        drawChamferedRect(ctx, PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h, PHOTO_BOX.radius);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
    }

    // 3. Mask Old Name and Draw New Name
    if (userNameInput.value.trim() !== '') {
        // Erase old name with a gradient or solid color
        // The background color there is a deep purple ~ #1a0f4a
        // Let's use a soft blurred rect or solid fill to blend in.
        ctx.save();
        ctx.fillStyle = '#0e0b3e'; // Approximated from typical Robolution bg
        // Draw a rectangle over the old name
        ctx.fillRect(NAME_BOX.x, NAME_BOX.y, NAME_BOX.w, NAME_BOX.h);
        
        // Soft edges to blend
        ctx.shadowColor = '#0e0b3e';
        ctx.shadowBlur = 20;
        ctx.fillRect(NAME_BOX.x, NAME_BOX.y, NAME_BOX.w, NAME_BOX.h);
        ctx.restore();

        // Draw new name
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '900 48px Inter'; // Very bold font
        
        const nameLines = userNameInput.value.split('\\n');
        let textY = NAME_BOX.y + 15;
        
        nameLines.forEach(line => {
            ctx.fillText(line, PHOTO_BOX.x + (PHOTO_BOX.w / 2), textY);
            textY += 55;
        });
    }

}

function downloadCanvas() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'robolution_card.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
