# 190E Player - YouTube Music Integration

## Overview
The 190E Player now includes a fully functional YouTube Music integration that allows you to search for and play music directly from YouTube while maintaining the classic 190E aesthetic.

## Features

### 🎵 YouTube Music Tab
- **Real YouTube Search**: Actual YouTube Data API integration (no more mock data!)
- **Music-Focused Results**: Automatically filters for music content
- **Embedded Player**: Full YouTube video player embedded in the interface
- **Playlist Management**: View search results as a clickable playlist
- **Full Controls**: Play, pause, stop, seek, and volume controls
- **Auto-play**: Automatically plays the next track when one ends

### 🎛️ Local Audio Tab
- **File Support**: Open and play local audio files
- **Audio Visualization**: Real-time 3D visualization using Three.js
- **Equalizer Controls**: Adjust bass, mids, and highs
- **Volume Control**: Master volume adjustment

## Setup Instructions

### 1. YouTube Data API Setup (REQUIRED for YouTube Music)

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "190E Player")
4. Click "Create"

**Step 2: Enable YouTube Data API**
1. In your project, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and click "Enable"

**Step 3: Create API Key**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your new API key

**Step 4: Configure API Key**
1. Open `src/renderer.js`
2. Find the line: `const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key
4. Save the file

**Step 5: Set API Key Restrictions (Optional but Recommended)**
1. In Google Cloud Console, click on your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain or localhost
4. Under "API restrictions", select "Restrict key" and choose "YouTube Data API v3"

### 2. Running the Application
```bash
# Navigate to the project directory
cd webapp-exploration

# Install dependencies (if using npm)
npm install

# Run the application
npm start
```

## Usage

### Switching Between Tabs
- Click on "Local Audio" or "YouTube Music" tabs to switch between modes
- Each tab maintains its own state and controls

### YouTube Music
1. **Search**: Type a music query in the search bar and click the search button
2. **Real Results**: Get actual YouTube search results (no more mock data!)
3. **Play**: Click on any track in the playlist to start playing
4. **Controls**: Use the transport buttons to control playback
5. **Search Tips**: 
   - Try artist names: "Taylor Swift"
   - Song titles: "Bohemian Rhapsody"
   - Genres: "jazz", "rock", "classical"
   - The search automatically adds "music" to focus results

### Local Audio
1. **Open File**: Click the folder button to select an audio file
2. **Playback**: Use play/pause buttons to control audio
3. **Visualization**: Watch the real-time 3D visualization
4. **Equalizer**: Adjust audio parameters using the sliders

## Technical Details

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript with Three.js for visualization
- **YouTube Integration**: Real YouTube Data API v3 with embedded iframe player
- **Audio Processing**: Web Audio API for real-time analysis
- **Responsive Design**: Maintains 190E aesthetic across different screen sizes

### YouTube API Features
- **Real Search**: Actual YouTube search results, not mock data
- **Music Category**: Automatically filters for music content (category ID 10)
- **Thumbnail Support**: Real video thumbnails from YouTube
- **Error Handling**: Proper error messages for API issues
- **No Results**: Shows helpful message when searches return no results

### Browser Compatibility
- Modern browsers with Web Audio API support
- YouTube iframe embedding requires internet connection
- Local file playback works offline

## Troubleshooting

### YouTube Player Issues
- **"API key not configured"**: Follow the setup instructions above
- **"No results found"**: Try different search terms or check your internet connection
- **"API quota exceeded"**: YouTube API has daily limits, try again tomorrow
- **Embedding disabled**: Some videos may not be available for embedding

### Audio Issues
- Check browser permissions for audio playback
- Ensure audio files are in supported formats (MP3, WAV, OGG)
- Web Audio API may not work in some older browsers

## API Quotas and Limits

YouTube Data API v3 has daily quotas:
- **Free tier**: 10,000 units per day
- **Search requests**: 100 units per search
- **Each search returns up to 20 results**

**Note**: The free tier is sufficient for personal use. For heavy usage, consider upgrading to a paid plan.

## Future Enhancements

- [ ] User authentication and personal playlists
- [ ] Video duration fetching (requires additional API calls)
- [ ] Related videos suggestions
- [ ] Audio equalizer for YouTube tracks
- [ ] Crossfade between tracks
- [ ] Keyboard shortcuts
- [ ] Mini-player mode

## License
This project is open source and available under the MIT License.


