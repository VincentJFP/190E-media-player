// Pioneer 190E Player - YouTube Music Player
// Volume buttons
const volDownBtn = document.getElementById('vol-down');
const volUpBtn = document.getElementById('vol-up');
const muteBtn = document.getElementById('mute-btn');

// YouTube Music Integration
const youtubeSearchInput = document.getElementById('youtube-search-input');
const youtubeSearchBtn = document.getElementById('search-btn');
const youtubeVideoContainer = document.getElementById('youtube-video-container');
const youtubePlaceholder = document.getElementById('youtube-placeholder');
const ytPlayBtn = document.getElementById('yt-play-btn');
const ytPauseBtn = document.getElementById('yt-pause-btn');
const ytStopBtn = document.getElementById('yt-stop-btn');
const ytPrevBtn = document.getElementById('yt-prev-btn');
const ytNextBtn = document.getElementById('yt-next-btn');
const ytTrackTitle = document.getElementById('yt-track-title');
const ytTrackArtist = document.getElementById('yt-track-artist');
const ytCurrentTime = document.getElementById('yt-current-time');
const ytTotalTime = document.getElementById('yt-total-time');
const ytStatus = document.getElementById('yt-status');
const youtubePlaylist = document.getElementById('youtube-playlist');
const youtubeSeek = null;
const youtubeSeekProgress = null;
const vizEq = document.getElementById('viz-eq');
// YouTube container now integrated into status overlay

// YouTube Music state
let currentPlaylist = [];
let currentTrackIndex = 0;
let isPlaying = false;
let currentVideoId = null;
let isYouTubePlayer = false;
let ytPlayer = null; // YouTube Iframe API player instance
// UI sound effects
let sfxCtx = null;
function ensureSfxCtx() {
  if (!sfxCtx) {
    try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
  }
}
// Mechanical click composed of a short high click, a low thud, and a tiny noise burst
function playMechanicalClick(intensity = 1) {
  ensureSfxCtx();
  if (!sfxCtx) return;
  const now = sfxCtx.currentTime;

  // High click
  const oscHi = sfxCtx.createOscillator();
  const gainHi = sfxCtx.createGain();
  oscHi.type = 'square';
  oscHi.frequency.setValueAtTime(1800, now);
  gainHi.gain.setValueAtTime(0, now);
  gainHi.gain.linearRampToValueAtTime(0.18 * intensity, now + 0.003);
  gainHi.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  oscHi.connect(gainHi).connect(sfxCtx.destination);
  oscHi.start(now);
  oscHi.stop(now + 0.05);

  // Low thud
  const oscLo = sfxCtx.createOscillator();
  const gainLo = sfxCtx.createGain();
  oscLo.type = 'triangle';
  oscLo.frequency.setValueAtTime(120, now);
  gainLo.gain.setValueAtTime(0, now);
  gainLo.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.004);
  gainLo.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  oscLo.connect(gainLo).connect(sfxCtx.destination);
  oscLo.start(now);
  oscLo.stop(now + 0.08);

  // Noise burst for mechanical texture
  const bufferSize = 2048;
  const noiseBuffer = sfxCtx.createBuffer(1, bufferSize, sfxCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const noise = sfxCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const hp = sfxCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1500;
  const gainN = sfxCtx.createGain();
  gainN.gain.setValueAtTime(0.05 * intensity, now);
  gainN.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  noise.connect(hp).connect(gainN).connect(sfxCtx.destination);
  noise.start(now);
  noise.stop(now + 0.04);
}

function playButtonClick() { playMechanicalClick(1); }
function playDialTick() { playMechanicalClick(0.6); }

// YouTube API configuration
// Note: API calls are now proxied through a backend service to keep the key secure
// The backend service handles the actual YouTube API calls

// YouTube search functionality
// Simple keyword search (no paging)

async function searchYouTube(query) {
  if (!query.trim()) return;
  
  try {
    console.log('Searching YouTube for:', query);
    
    // Search for videos through our backend proxy
    const searchResponse = await fetch(`${getApiUrl('/api/youtube/search')}?q=${encodeURIComponent(query + ' music')}&maxResults=25`);
    if (!searchResponse.ok) {
      throw new Error(`YT_${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    // keyword results only
    
    if (!searchData.items || searchData.items.length === 0) {
      throw new Error('No results found');
    }
    
    // Get video details for all results through our backend proxy
    const videoIds = searchData.items.map(item => item.id.videoId);
    const detailsResponse = await fetch(`${getApiUrl('/api/youtube/videos')}?ids=${videoIds.join(',')}`);
    const detailsData = await detailsResponse.json();
    
    // Process results and check embeddability (no custom rating)
    const musicResults = await Promise.all(detailsData.items.map(async (video) => {
      const embeddable = await checkVideoEmbeddable(video.id);
      const duration = parseDuration(video.contentDetails.duration);
      
      return {
        id: video.id,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        duration: duration,
        embeddable: embeddable
      };
    }));
    
    // Basic filter: embeddable and short/medium length
    currentPlaylist = musicResults.filter(video => video.embeddable);
                currentTrackIndex = 0;
                
    displayPlaylist(currentPlaylist);
    ytStatus.textContent = `Results for "${query}"`;
    
    // Results displayed in integrated YouTube search area
    
  } catch (error) {
    console.error('YouTube search failed:', error);
    ytStatus.textContent = 'Search failed. Please try again later.';
    youtubePlaylist.innerHTML = '<div class="no-results">No results found</div>';
  }
}

// Check if video is embeddable
async function checkVideoEmbeddable(videoId) {
  try {
    const response = await fetch(`${getApiUrl('/api/youtube/video-status')}?id=${videoId}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return video.status.embeddable !== false;
    }
    return false;
  } catch (error) {
    console.error('Error checking embeddability:', error);
    return false;
  }
}

// Parse YouTube duration format (PT4M13S) to seconds
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Calculate music relevance score
function calculateMusicScore(video) {
  let score = 0;
  const title = video.snippet.title.toLowerCase();
  const channel = video.snippet.channelTitle.toLowerCase();
  
  // Boost for official music channels
  if (isOfficialMusicChannel(video.snippet.channelTitle)) {
    score += 30;
  }
  
  // Boost for music-related keywords in title
  const musicKeywords = ['official', 'music', 'song', 'audio', 'mv', 'video', 'lyrics'];
  musicKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 5;
  });
  
  // Boost for higher view count (logarithmic scale)
  const views = parseInt(video.statistics.viewCount || 0);
  if (views > 0) {
    score += Math.log10(views);
  }
  
  // Penalty for non-music indicators
  const nonMusicKeywords = ['tutorial', 'lesson', 'how to', 'review', 'gameplay', 'vlog'];
  nonMusicKeywords.forEach(keyword => {
    if (title.includes(keyword) || channel.includes(keyword)) score -= 10;
  });
  
  return score;
}

// Check if channel is likely an official music channel
function isOfficialMusicChannel(channelName) {
  const musicChannelIndicators = [
    'records', 'music', 'entertainment', 'official', 'vevo',
    'label', 'studios', 'sound', 'audio', 'hits'
  ];
  
  const lowerChannel = channelName.toLowerCase();
  return musicChannelIndicators.some(indicator => lowerChannel.includes(indicator));
}

// Display playlist in the UI
function displayPlaylist(videos) {
  youtubePlaylist.innerHTML = '';
  
  if (videos.length === 0) {
    youtubePlaylist.innerHTML = '<div class="no-results">No results found</div>';
    return;
  }
  
  videos.forEach((video, index) => {
    const item = document.createElement('div');
    item.className = 'youtube-playlist-item';
    item.addEventListener('click', () => playYouTubeVideo(video.id, index));
    // Tilt interaction
    item.addEventListener('mousemove', (e)=>{
      const r = item.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rx = Math.max(-10, Math.min(10, (dy / (r.height/2)) * 8)); // tilt X opposite to cursor
      const ry = Math.max(-10, Math.min(10, (-dx / (r.width/2)) * 8));  // tilt Y pushing away
      item.style.setProperty('--rx', `${rx}deg`);
      item.style.setProperty('--ry', `${ry}deg`);
      item.style.setProperty('--s', `1.03`);
      item.classList.add('tilt-hover');
    });
    item.addEventListener('mouseleave', ()=>{
      item.style.removeProperty('--rx');
      item.style.removeProperty('--ry');
      item.style.removeProperty('--s');
      item.classList.remove('tilt-hover');
    });
    
    item.innerHTML = `
      <div style="position:relative">
        <img src="${video.thumbnail}" alt="${video.title}" onerror="this.style.display='none'">
        <div class="youtube-playlist-item-duration">${formatTime(video.duration)}</div>
      </div>
      <div class="youtube-playlist-item-info">
        <div class="youtube-playlist-item-title">${video.title}</div>
        <div class="youtube-playlist-item-channel">${video.channel}</div>
      </div>
    `;
    
    youtubePlaylist.appendChild(item);
  });

  // Infinite scroll removed - simplified search
}

// Initialize YouTube Iframe API
function ensureYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
}

// Play YouTube video using Iframe API (for reliable time/seek)
async function playYouTubeVideo(videoId, index = 0) {
  currentVideoId = videoId;
    currentTrackIndex = index;
  isYouTubePlayer = true;
  
  const video = currentPlaylist[index];
  ytTrackTitle.textContent = video.title;
  ytTrackArtist.textContent = video.channel;

  await ensureYouTubeAPI();

  // Create or update the player
  if (ytPlayer) {
    ytPlayer.loadVideoById(videoId);
  } else {
    youtubeVideoContainer.innerHTML = '';
    ytPlayer = new YT.Player(youtubeVideoContainer, {
      videoId,
      playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, fs: 0, disablekb: 1, iv_load_policy: 3, playsinline: 1 },
      events: {
        onReady: () => { isPlaying = true; requestAnimationFrame(syncTimeLoop); },
        onStateChange: onYTStateChange,
        onError: (e) => { console.error('YT error', e); ytStatus.textContent = 'Playback error'; }
      }
    });
  }
    
    // Update button states
    ytPlayBtn.classList.add('active');
    ytPauseBtn.classList.remove('active');
    
  ytStatus.textContent = 'Playing';
  isPlaying = true;
}

function onYTStateChange(e){
  if (e.data === YT.PlayerState.PLAYING){
    isPlaying = true; ytStatus.textContent = 'Playing';
  } else if (e.data === YT.PlayerState.PAUSED){
    isPlaying = false; ytStatus.textContent = 'Paused';
  } else if (e.data === YT.PlayerState.ENDED){
    isPlaying = false; ytStatus.textContent = 'Ended';
    playNext();
  }
}

// Control YouTube video via postMessage
function controlYouTubeVideo(action, value = null) {
  if (ytPlayer && ytPlayer[action]) {
    try {
      if (value !== null) {
        if (action === 'seekTo') ytPlayer.seekTo(value, true);
        else if (action === 'setVolume') ytPlayer.setVolume(value);
        else ytPlayer[action](value);
      } else {
        ytPlayer[action]();
      }
    } catch (_) {}
    return;
  }
  // Fallback to postMessage if API not ready
  const iframe = youtubeVideoContainer.querySelector('iframe');
  if (!iframe) return;
  const message = value !== null ? JSON.stringify({event:'command', func: action, args:[value]}) : JSON.stringify({event:'command', func: action});
  iframe.contentWindow.postMessage(message, 'https://www.youtube.com');
}

// Play next track
function playNext() {
  if (currentPlaylist.length === 0) return;
  
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  const nextVideo = currentPlaylist[currentTrackIndex];
  playYouTubeVideo(nextVideo.id, currentTrackIndex);
}

// Play previous track
function playPrevious() {
  if (currentPlaylist.length === 0) return;
  
  currentTrackIndex = currentTrackIndex === 0 ? currentPlaylist.length - 1 : currentTrackIndex - 1;
  const prevVideo = currentPlaylist[currentTrackIndex];
  playYouTubeVideo(prevVideo.id, currentTrackIndex);
}

// Event listeners
youtubeSearchBtn.addEventListener('click', () => {
  playButtonClick();
  const query = youtubeSearchInput.value.trim();
  if (query) {
    searchYouTube(query);
  }
});

youtubeSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    playButtonClick();
    const query = youtubeSearchInput.value.trim();
    if (query) {
      searchYouTube(query);
    }
  }
});

// YouTube control buttons
ytPlayBtn.addEventListener('click', () => {
  playButtonClick();
  if (currentVideoId) {
    controlYouTubeVideo('playVideo');
    ytPlayBtn.classList.add('active');
    ytPauseBtn.classList.remove('active');
    isPlaying = true;
  }
});

ytPauseBtn.addEventListener('click', () => {
  playButtonClick();
  if (currentVideoId) {
    controlYouTubeVideo('pauseVideo');
    ytPlayBtn.classList.remove('active');
    ytPauseBtn.classList.add('active');
    isPlaying = false;
  }
});

ytStopBtn.addEventListener('click', () => {
  playButtonClick();
  if (currentVideoId) {
    controlYouTubeVideo('stopVideo');
    ytPlayBtn.classList.remove('active');
    ytPauseBtn.classList.remove('active');
    isPlaying = false;
    
    // Reset to placeholder
    youtubeVideoContainer.innerHTML = youtubePlaceholder.outerHTML;
    currentVideoId = null;
    ytTrackTitle.textContent = 'YouTube Music';
    ytTrackArtist.textContent = 'Ready to search';
    ytStatus.textContent = 'Stopped';
  }
});

addButtonEvents(ytNextBtn, playNext);
addButtonEvents(ytPrevBtn, playPrevious);
;[ytNextBtn, ytPrevBtn].forEach(btn => btn && addButtonEvents(btn, playButtonClick));

// Add ripple feedback to all skeu-buttons
document.querySelectorAll('.skeu-button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// Seek bar removed

// Sync time/progress using Iframe API
function syncTimeLoop(){
  if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration){
    const cur = ytPlayer.getCurrentTime();
    const dur = ytPlayer.getDuration() || 0;
    if (dur > 0){
      ytCurrentTime.textContent = formatTime(cur);
      ytTotalTime.textContent = formatTime(dur);
    }
  }
  requestAnimationFrame(syncTimeLoop);
}

// Simple 90s HiFi visual equalizer using WebAudio analyser (silently driven)
let audioCtx, analyser, dataArray, mediaEl;
function ensureAudioAnalyser(){
  try{
    if (!vizEq) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!mediaEl){
      // Create a silent media element to satisfy analyser; we piggyback on YT audio when available via periodic tick
      mediaEl = new Audio();
      const src = audioCtx.createMediaElementSource(mediaEl);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser).connect(audioCtx.destination);
      // Populate bars
      if (vizEq.children.length === 0){
        for (let i=0;i<24;i++){ const b = document.createElement('div'); b.className='bar'; vizEq.appendChild(b); }
      }
    }
  }catch(e){/* ignore */}
}

function renderEq(){
  if (!vizEq) return;
  if (!analyser){ ensureAudioAnalyser(); }
  const bars = vizEq.children;
  if (bars.length){
    // Fake-react to YT time delta since we can't tap YT audio; animate bars with pseudo audio tied to playback
    const t = performance.now() / 1000;
    for (let i=0;i<bars.length;i++){
      const v = (Math.sin(t*2 + i*0.45) + Math.sin(t*3.3 + i*0.27))*0.5 + 1; // 0..2
      const h = 6 + v*22;
      bars[i].style.height = h + 'px';
      bars[i].style.opacity = 0.7 + (v-1)*0.15;
    }
  }
  requestAnimationFrame(renderEq);
}

ensureAudioAnalyser();
requestAnimationFrame(renderEq);

// Volume logic with +/-/mute
let currentVolume = 50;
function setVolume(v){
  currentVolume = Math.max(0, Math.min(100, Math.round(v)));
  if (currentVideoId) controlYouTubeVideo('setVolume', currentVolume);
}

// Helper function to add both click and touch events
function addButtonEvents(element, handler) {
  if (!element) return;
  element.addEventListener('click', handler);
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    handler(e);
  });
}

if (volDownBtn) addButtonEvents(volDownBtn, ()=>{ playButtonClick(); setVolume(currentVolume - 10); });
if (volUpBtn) addButtonEvents(volUpBtn, ()=>{ playButtonClick(); setVolume(currentVolume + 10); });
if (muteBtn){
  let muted=false; let prev=currentVolume;
  addButtonEvents(muteBtn, ()=>{
    playButtonClick();
    muted = !muted;
    muteBtn.classList.toggle('active', muted);
    if (muted){ prev=currentVolume; setVolume(0); if (currentVideoId) controlYouTubeVideo('mute'); }
    else { setVolume(prev); if (currentVideoId){ controlYouTubeVideo('unMute'); controlYouTubeVideo('setVolume', prev); } }
  });
}

console.log('Pioneer 190E YouTube Music Player loaded');