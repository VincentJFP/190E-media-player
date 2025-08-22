// Configuration for API endpoints
const config = {
  // Use local backend for development, Vercel backend for production
  apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://190e-media-player-backend.vercel.app',
  
  // API endpoints
  endpoints: {
    search: '/api/youtube/search',
    videos: '/api/youtube/videos',
    videoStatus: '/api/youtube/video-status'
  }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return `${config.apiBaseUrl}${endpoint}`;
}

// Export for use in other files
window.config = config;
window.getApiUrl = getApiUrl;
