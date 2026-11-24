let selectedType = "icon"; 
let selectedIcon = "🪷";
const MAX_KRATHONG = 6;

let launchCount = parseInt(localStorage.getItem('t2_krathong_count')) || 0;

const canvas = document.getElementById('krathongCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentColor = '#16a34a';
let hasDrawn = false; 

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function startDraw(e) {
    isDrawing = true;
    hasDrawn = true;
    const pos = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault(); 
    const pos = getCoordinates(e);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDraw() {
    isDrawing = false;
    ctx.closePath();
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw);

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', function() {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
        currentColor = this.getAttribute('data-color');
    });
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
}

document.querySelectorAll('.krathong-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.krathong-option').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        
        selectedType = this.getAttribute('data-type');
        const drawArea = document.getElementById('drawArea');

        if (selectedType === 'draw') {
            drawArea.style.display = 'flex';
        } else {
            drawArea.style.display = 'none';
            selectedIcon = this.getAttribute('data-icon');
        }
    });
});

function updateQuotaDisplay() {
    const btn = document.querySelector('.launch-btn');
    let quotaText = document.getElementById('quotaInfo');
    
    if (!quotaText) {
        quotaText = document.createElement('div');
        quotaText.id = 'quotaInfo';
        quotaText.style.marginTop = '6px';
        quotaText.style.fontSize = '0.8rem';
        btn.parentNode.appendChild(quotaText);
    }

    const remaining = MAX_KRATHONG - launchCount;

    if (remaining > 0) {
        quotaText.style.color = '#ffea9f';
        quotaText.innerText = `✨ คุณสามารถลอยกระทงได้อีก ${remaining} ใบ (จากทั้งหมด ${MAX_KRATHONG} ใบ)`;
    } else {
        quotaText.style.color = '#ff7b7b';
        quotaText.innerText = `🚫 คุณใช้สิทธิ์ลอยกระทงครบ ${MAX_KRATHONG} ใบแล้ว ขอบคุณที่ร่วมกิจกรรมครับ`;
        btn.disabled = true;
        btn.style.background = '#555';
        btn.style.color = '#aaa';
        btn.style.cursor = 'not-allowed';
        btn.style.boxShadow = 'none';
        btn.innerText = 'ลอยกระทงครบโควตาแล้ว';
    }
}

function createFirework() {
    const container = document.getElementById('fireworksContainer');
    if (!container) return;

    const firework = document.createElement('div');
    firework.className = 'firework';

    const randomX = Math.floor(Math.random() * 85) + 8;
    const randomY = Math.floor(Math.random() * 45) + 10;
    const colors = ['#ff4d4d', '#ffdf00', '#00ffcc', '#ff66b2', '#9933ff', '#ffffff', '#ff9900'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    firework.style.left = randomX + '%';
    firework.style.top = randomY + '%';
    firework.style.setProperty('--firework-color', randomColor);

    container.appendChild(firework);

    setTimeout(() => {
        firework.remove();
    }, 1600);
}

function createKrathongElement(name, wish, visualContent, isCustomDrawing = false) {
    const river = document.getElementById('river');
    const item = document.createElement('div');
    item.className = 'floating-item';

    const randomTop = Math.floor(Math.random() * 55) + 8;
    const randomDuration = Math.floor(Math.random() * 10) + 18;
    const loops = 2;

    item.style.top = randomTop + '%';
    item.style.animationDuration = `${randomDuration}s, 2.5s`;
    item.style.animationIterationCount = `${loops}, infinite`;

    const isSafeImg = isCustomDrawing && typeof visualContent === 'string'
        && visualContent.startsWith('data:image/png;base64,');

    item.innerHTML = `
        <div class="wish-bubble">
            <span class="wish-name"></span>
            <span class="wish-text"></span>
        </div>
        <div class="krathong-visual"></div>
        <div class="krathong-glow"></div>
    `;
    item.querySelector('.wish-name').textContent = name;
    item.querySelector('.wish-text').textContent = wish;

    const visual = item.querySelector('.krathong-visual');
    if (isSafeImg) {
        const img = document.createElement('img');
        img.src = visualContent;
        img.className = 'krathong-drawn-img';
        img.alt = 'กระทงวาดเอง';
        visual.appendChild(img);
    } else {
        visual.className = 'krathong-icon';
        visual.textContent = isCustomDrawing ? '🪷' : visualContent;
    }

    river.appendChild(item);

    setTimeout(() => {
        item.remove();
    }, randomDuration * loops * 1000);
}
function launchKrathong() {
    if (launchCount >= MAX_KRATHONG) {
        alert(`ขออภัยครับ จำกัดการลอยกระทงไม่เกิน ${MAX_KRATHONG} ครั้งต่อคนครับ`);
        return;
    }

    if (selectedType === 'draw' && !hasDrawn) {
        alert("กรุณาวาดรูปกระทงก่อนปล่อยลงน้ำนะครับ 🎨");
        return;
    }

    const nameInput = document.getElementById('userName');
    const wishInput = document.getElementById('userWish');

    const name = nameInput.value.trim() || "นักเรียน ท.๒";
    const wish = wishInput.value.trim() || "ขอให้มีความสุข สุขภาพแข็งแรง";

    let visualContent = selectedIcon;
    let isCustom = false;

    if (selectedType === 'draw') {
        visualContent = canvas.toDataURL('image/png');
        isCustom = true;
        clearCanvas();
    }

    // ส่งข้อมูลขึ้น Firebase กลาง (ระบบ Real-time จะสร้างกระทงขึ้นมาให้เองโดยอัตโนมัติรอบเดียว ไม่สร้างซ้ำซ้อน)
    if (window.sendKrathongToFirebase) {
        window.sendKrathongToFirebase(name, wish, visualContent, isCustom);
    } else {
        // กรณีเผื่อยังไม่ได้ต่อ Firebase ให้แสดงผลในเครื่องตัวเองรอบเดียว
        createKrathongElement(name, wish, visualContent, isCustom);
    }

    wishInput.value = "";
    launchCount++;
    localStorage.setItem('t2_krathong_count', launchCount);
    updateQuotaDisplay();
}
window.onload = () => {
    updateQuotaDisplay(); 
    setTimeout(() => createKrathongElement("ตัวแทนสภานักเรียนโรงเรียนเทศบาล๒", "สืบสานประเพณีไทย ร่วมใจรักษ์สายน้ำ", "🪷", false), 400);
    setInterval(createFirework, 600);
};