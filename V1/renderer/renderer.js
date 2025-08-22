const audio = document.getElementById('audio');
const statusEl = document.getElementById('status');
const seek = document.getElementById('seek');
const carShell = document.querySelector('.car-shell');

document.getElementById('min-btn').addEventListener('click', () => window.api.minimize());
document.getElementById('close-btn').addEventListener('click', () => window.api.close());

document.getElementById('ytm-open').addEventListener('click', (e) => {
  e.preventDefault();
  window.api.openExternal('https://music.youtube.com');
});

// Demo audio to exercise the animations (royalty-free placeholder)
audio.src = 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav';

const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');

playBtn.addEventListener('click', async () => {
  try {
    await audio.play();
    statusEl.textContent = 'Playing';
    carShell.classList.add('lights-on');
  } catch (e) {
    statusEl.textContent = 'Playback blocked';
  }
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
  statusEl.textContent = 'Paused';
  carShell.classList.remove('lights-on');
});

// Simulate bass bounce using timeupdate amplitude sampling (very rough)
let lastBounce = 0;
audio.addEventListener('timeupdate', () => {
  const now = performance.now();
  if (now - lastBounce > 360) {
    carShell.classList.add('bass-bounce');
    setTimeout(() => carShell.classList.remove('bass-bounce'), 380);
    lastBounce = now;
  }
  const pct = (audio.currentTime / (audio.duration || 1)) * 100;
  seek.value = String(Math.floor(pct));
});

seek.addEventListener('input', () => {
  const pct = Number(seek.value) / 100;
  audio.currentTime = pct * (audio.duration || 0);
});

// Minimal YTM integration placeholder: user logs in within the webview
const ytmView = document.getElementById('ytm-view');
document.getElementById('ytm-login').addEventListener('click', () => {
  ytmView.loadURL('https://music.youtube.com');
});



