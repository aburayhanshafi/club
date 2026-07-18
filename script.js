const canvas = document.getElementById('facecard-canvas');
const ctx = canvas.getContext('2d');

// Form inputs
const imageUpload = document.getElementById('image-upload');
const zoomSlider = document.getElementById('zoom-slider');
const topLeftInput = document.getElementById('top-left-text');
const topRightInput = document.getElementById('top-right-text');
const bigTextInput = document.getElementById('big-text');
const bottomTitleInput = document.getElementById('bottom-title');
const bottomBodyInput = document.getElementById('bottom-body');
const downloadBtn = document.getElementById('download-btn');

// State
let userImage = null;
let imgX = 0;
let imgY = 0;
let imgScale = 1;
let isDragging = false;
let startX, startY;

// Constants for layout
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const BEIGE_COLOR = '#e3d5c5'; // Matched from reference
const DARK_TEXT = '#1a1a1a';

// Offscreen canvas for the overlay mask
const overlayCanvas = document.createElement('canvas');
overlayCanvas.width = CANVAS_WIDTH;
overlayCanvas.height = CANVAS_HEIGHT;
const overlayCtx = overlayCanvas.getContext('2d');

// Initial draw
draw();

// Event Listeners for controls
imageUpload.addEventListener('change', handleImageUpload);
zoomSlider.addEventListener('input', (e) => {
    imgScale = parseFloat(e.target.value);
    draw();
});
topLeftInput.addEventListener('input', draw);
topRightInput.addEventListener('input', draw);
bigTextInput.addEventListener('input', draw);
bottomTitleInput.addEventListener('input', draw);
bottomBodyInput.addEventListener('input', draw);
downloadBtn.addEventListener('click', downloadCanvas);

// Canvas Drag Events
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
window.addEventListener('mouseup', endDrag);

canvas.addEventListener('touchstart', (e) => {
    if(e.touches.length === 1) {
        startDrag(e.touches[0]);
    }
}, {passive: false});
canvas.addEventListener('touchmove', (e) => {
    if(e.touches.length === 1) {
        e.preventDefault(); // Prevent scrolling
        drag(e.touches[0]);
    }
}, {passive: false});
window.addEventListener('touchend', endDrag);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            userImage = img;
            
            // Calculate initial scale to cover the canvas
            const scaleX = CANVAS_WIDTH / img.width;
            const scaleY = CANVAS_HEIGHT / img.height;
            imgScale = Math.max(scaleX, scaleY);
            
            // Center image
            imgX = (CANVAS_WIDTH - img.width * imgScale) / 2;
            imgY = (CANVAS_HEIGHT - img.height * imgScale) / 2;
            
            // Reset slider
            zoomSlider.min = imgScale * 0.5;
            zoomSlider.max = imgScale * 3;
            zoomSlider.value = imgScale;

            document.querySelector('.canvas-overlay-hint').style.display = 'none';
            draw();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function startDrag(e) {
    if (!userImage) return;
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    startX = (e.clientX - rect.left) * scaleX - imgX;
    startY = (e.clientY - rect.top) * scaleY - imgY;
}

function drag(e) {
    if (!isDragging || !userImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    imgX = (e.clientX - rect.left) * scaleX - startX;
    imgY = (e.clientY - rect.top) * scaleY - startY;
    
    draw();
}

function endDrag() {
    isDragging = false;
}

function draw() {
    // 1. Clear Main Canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Draw User Image
    if (userImage) {
        ctx.save();
        ctx.translate(imgX, imgY);
        ctx.scale(imgScale, imgScale);
        ctx.drawImage(userImage, 0, 0);
        ctx.restore();
    } else {
        // Placeholder background if no image
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#444';
        ctx.font = '40px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image', CANVAS_WIDTH/2 - 150, CANVAS_HEIGHT/2);
    }

    // Add a subtle dark gradient on the left side to make white text readable
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH * 0.6, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const bottomGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.5, 0, CANVAS_HEIGHT);
    bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 3. Prepare Overlay Canvas (The beige mask)
    overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const boxWidth = 320;
    const boxX = CANVAS_WIDTH - boxWidth;
    
    // Draw the solid beige block
    overlayCtx.globalCompositeOperation = 'source-over';
    overlayCtx.fillStyle = BEIGE_COLOR;
    // We add a little margin or maybe it's flush to the right. Looks flush in reference.
    // Wait, the reference has some spacing? No, flush right.
    // Wait, the reference has some weird shapes at the top and bottom of the beige box? 
    // Actually, looking at the image, the beige box is a bit separated from the top/bottom?
    // Let's just draw it full height. But maybe add some padding for the "It's My" text.
    overlayCtx.fillRect(boxX, 0, boxWidth, CANVAS_HEIGHT);

    // 4. Punch out the big text
    overlayCtx.globalCompositeOperation = 'destination-out';
    
    const bigText = bigTextInput.value.toUpperCase();
    const chars = bigText.split('');
    
    // Font settings for big text
    // We need an extremely bold, condensed font if possible. 'Arial Black' or 'Impact'
    overlayCtx.font = '900 280px "Inter", "Arial Black", sans-serif';
    overlayCtx.textAlign = 'center';
    overlayCtx.textBaseline = 'middle';
    
    // Calculate vertical spacing
    // We have height = 1350. Let's say top padding 300, bottom padding 100.
    const startYPos = 350; 
    const endYPos = CANVAS_HEIGHT - 150;
    const availableHeight = endYPos - startYPos;
    
    let step = 0;
    if (chars.length > 1) {
        step = availableHeight / (chars.length - 1);
    } else {
        step = availableHeight;
    }

    const centerX = boxX + (boxWidth / 2);
    
    chars.forEach((char, index) => {
        const y = startYPos + (index * step);
        // If chars are too many, we might need to reduce font size. Let's assume ~5 chars like DREAM.
        overlayCtx.fillText(char, centerX, y);
    });

    // 5. Draw "It's My" on overlay in dark text
    overlayCtx.globalCompositeOperation = 'source-over';
    overlayCtx.fillStyle = DARK_TEXT;
    overlayCtx.font = '500 48px Inter';
    overlayCtx.textAlign = 'center';
    overlayCtx.fillText(topRightInput.value, centerX, 150);

    // 6. Draw Overlay onto Main Canvas
    ctx.drawImage(overlayCanvas, 0, 0);

    // 7. Draw other texts directly on Main Canvas (over image, left side)
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Top Left: "A NETFLIX ORIGINAL SERIES"
    ctx.font = '600 24px Inter';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = '#e50914'; // Netflix red for the "A NETFLIX" part maybe? Or just white. Let's stick to white or custom.
    // The reference has "A NETFLIX ORIGINAL SERIES" with NETFLIX in red.
    // To make it simple, let's just make it all white as before. Or I can do it!
    // Actually, setting letterSpacing on ctx works in modern browsers.
    ctx.fillStyle = '#ffffff';
    ctx.fillText(topLeftInput.value, 80, 150);
    ctx.letterSpacing = '0px'; // reset

    // Bottom Left Title
    const titleLines = bottomTitleInput.value.split('\\n'); // Allow user to use \n? Or just split by newline if it's textarea. It's input, so maybe we auto-wrap or just print.
    // The reference has "SETIAP ORANG \n PASTI PUNYA MIMPI"
    ctx.font = '900 36px "Times New Roman", Times, serif'; // Looks like a serif font in the reference!
    
    // Let's split title by hardcoded words or just take input.
    let titleY = CANVAS_HEIGHT - 380;
    const titles = bottomTitleInput.value.split('\n'); // if textarea. We used input, so let's check for \n
    // Actually let's use a function to split text if needed, but for simplicity, we can just split by "PASTI" or let the user type lines?
    // Let's replace literal '\n' with actual newline
    const parsedTitles = bottomTitleInput.value.replace(/\\n/g, '\n').split('\n');
    parsedTitles.forEach(line => {
        ctx.fillText(line, 80, titleY);
        titleY += 45;
    });

    // Bottom Body
    ctx.font = '400 24px Inter';
    let bodyY = titleY + 20;
    const bodyLines = bottomBodyInput.value.split('\n');
    bodyLines.forEach(line => {
        ctx.fillText(line, 80, bodyY);
        bodyY += 35;
    });
}

function downloadCanvas() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'facecard_july_award.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
