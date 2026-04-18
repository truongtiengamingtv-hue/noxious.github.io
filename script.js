// ===== Real-time Clock =====
function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);
updateClock();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const icon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ===== Custom Cursor =====
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let trailTimeout;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Cursor dot follows immediately
    cursorDot.style.left = mouseX - 4 + 'px';
    cursorDot.style.top = mouseY - 4 + 'px';

    // Create trail effect
    clearTimeout(trailTimeout);
    createTrail(mouseX, mouseY);
});

// Smooth cursor animation
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Trail effect
let trailCount = 0;
function createTrail(x, y) {
    if (trailCount > 5) return; // Limit trails

    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x - 5 + 'px';
    trail.style.top = y - 5 + 'px';
    document.body.appendChild(trail);
    trailCount++;

    setTimeout(() => {
        trail.remove();
        trailCount--;
    }, 500);
}

// Cursor hover effect on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .tag, input');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.backgroundColor = 'rgba(108, 92, 231, 0.3)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'transparent';
    });
});

// ===== Particle Effect =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        const theme = document.documentElement.getAttribute('data-theme');
        const color = theme === 'dark' ?
            `rgba(162, 155, 254, ${this.opacity})` :
            `rgba(108, 92, 231, ${this.opacity})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

const particles = [];
const particleCount = 50;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Connect nearby particles
    particles.forEach((a, index) => {
        particles.slice(index + 1).forEach(b => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const theme = document.documentElement.getAttribute('data-theme');
                const color = theme === 'dark' ?
                    `rgba(162, 155, 254, ${0.1 * (1 - distance / 100)})` :
                    `rgba(108, 92, 231, ${0.1 * (1 - distance / 100)})`;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== Music Player =====
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeSlider = document.getElementById('volume');
const musicProgress = document.getElementById('music-progress');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const discIcon = document.querySelector('.music-art .spinning');

let isPlaying = false;
let currentTime = 0;
const totalTime = 225; // 3:45 in seconds

// Simulate music playing
let progressInterval;

playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        discIcon.classList.remove('paused');
        startProgress();
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        discIcon.classList.add('paused');
        stopProgress();
    }
});

function startProgress() {
    progressInterval = setInterval(() => {
        currentTime++;
        if (currentTime >= totalTime) {
            currentTime = 0;
        }
        updateProgress();
    }, 1000);
}

function stopProgress() {
    clearInterval(progressInterval);
}

function updateProgress() {
    const percent = (currentTime / totalTime) * 100;
    musicProgress.style.width = percent + '%';

    const mins = Math.floor(currentTime / 60);
    const secs = String(currentTime % 60).padStart(2, '0');
    currentTimeEl.textContent = `${mins}:${secs}`;
}

// Next/Prev buttons (demo)
const songs = [
    { title: 'Lofi Beats', artist: 'Chill Vibes', duration: '3:45' },
    { title: 'Synthwave Dreams', artist: 'RetroWave', duration: '4:20' },
    { title: 'Pixel Journey', artist: '8-Bit Master', duration: '2:55' },
    { title: 'Night Drive', artist: 'Neon City', duration: '5:10' }
];
let currentSongIndex = 0;

nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    updateSongDisplay();
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    updateSongDisplay();
});

function updateSongDisplay() {
    const song = songs[currentSongIndex];
    document.querySelector('.music-title').textContent = song.title;
    document.querySelector('.music-artist').textContent = song.artist;
    totalTimeEl.textContent = song.duration;
    currentTime = 0;
    updateProgress();
}

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    // Would control actual audio volume here
    console.log('Volume:', volume);
});

// ===== Quotes Rotation =====
const quotes = [
    { text: '"Code is like humor. When you have to explain it, it\'s bad."', author: '- Cory House' },
    { text: '"First, solve the problem. Then, write the code."', author: '- John Johnson' },
    { text: '"Talk is cheap. Show me the code."', author: '- Linus Torvalds' },
    { text: '"The best error message is the one that never shows up."', author: '- Thomas Fuchs' },
    { text: '"It works on my machine."', author: '- Every Developer' }
];

let currentQuoteIndex = 0;
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.querySelector('.quote-author');

function rotateQuote() {
    // Fade out
    quoteText.style.opacity = 0;
    quoteAuthor.style.opacity = 0;

    setTimeout(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        quoteText.textContent = quotes[currentQuoteIndex].text;
        quoteAuthor.textContent = quotes[currentQuoteIndex].author;

        // Fade in
        quoteText.style.opacity = 1;
        quoteAuthor.style.opacity = 1;
    }, 500);
}

// Add transition to quote elements
quoteText.style.transition = 'opacity 0.5s ease';
quoteAuthor.style.transition = 'opacity 0.5s ease';

// Rotate quotes every 8 seconds
setInterval(rotateQuote, 8000);

// ===== Progress Bar Animation on Load =====
function animateProgressBars() {
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
        const width = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = width;
        }, 100);
    });
}

// Run when page loads
window.addEventListener('load', () => {
    setTimeout(animateProgressBars, 500);
});

// ===== Typing Effect for Mood =====
const moodElement = document.querySelector('.mood');
const moods = ['Coding... 💻', 'Gaming... 🎮', 'Listening to music... 🎧', 'Chilling... 😎', 'Learning AI... 🤖'];
let currentMoodIndex = 0;

function changeMood() {
    moodElement.style.opacity = 0;

    setTimeout(() => {
        currentMoodIndex = (currentMoodIndex + 1) % moods.length;
        moodElement.textContent = moods[currentMoodIndex];
        moodElement.style.opacity = 1;
    }, 300);
}

moodElement.style.transition = 'opacity 0.3s ease';
setInterval(changeMood, 5000);

// ===== Add hover sound effect (visual feedback) =====
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 0 20px var(--glow-color)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '';
    });
});

// ===== Easter Egg: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s linear infinite';

    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 5000);

    alert('🎉 You found the Easter Egg! 🎉');
}

console.log('%c🦆 Tienz Profile Loaded!', 'color: #6c5ce7; font-size: 20px; font-weight: bold;');
console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'color: #a29bfe; font-size: 14px;');
