# 190E Media Player

A retro-styled media player with YouTube music integration, inspired by the Mercedes-Benz 190E dashboard.

## Features

- 🎵 YouTube music search and playback
- 🎛️ Retro dashboard interface
- 📻 Radio-style controls
- 🎨 Authentic 190E styling

## Security Setup

This project uses a backend proxy to keep your YouTube API key secure. The API key is never exposed in the frontend code.

### Prerequisites

- Node.js (v14 or higher)
- YouTube Data API v3 key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/190E-media-player.git
   cd 190E-media-player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   
   Create a `.env` file in the root directory:
   ```bash
   # Create .env file
   echo "YOUTUBE_API_KEY=your_actual_api_key_here" > .env
   ```
   
   **Important**: Replace `your_actual_api_key_here` with your actual YouTube Data API v3 key.
   
   You can get a YouTube API key from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

4. **Start the development server**
   ```bash
   npm run dev-server
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev-server` - Start the development server with hot reload
- `npm run server` - Start the production server
- `npm start` - Start the Electron app
- `npm run dev` - Start the static file server (for development without backend)

### Project Structure

```
├── src/                 # Frontend source files
│   ├── index.html      # Main HTML file
│   ├── renderer.js     # Main JavaScript file
│   ├── styles.css      # Styling
│   └── assets/         # Images and other assets
├── server.js           # Backend proxy server
├── .env               # Environment variables (not in git)
├── .gitignore         # Git ignore rules
└── package.json       # Project configuration
```

## Deployment

### For GitHub Pages (Static Hosting)

Since GitHub Pages only serves static files, you'll need to deploy the backend separately. Here are your options:

1. **Deploy backend to a service like Heroku, Vercel, or Railway**
2. **Use a different hosting service that supports Node.js**
3. **Use a serverless function (AWS Lambda, Vercel Functions, etc.)**

### Environment Variables for Production

Make sure to set the `YOUTUBE_API_KEY` environment variable in your production environment.

## Security Notes

- ✅ API key is stored in environment variables
- ✅ API key is never exposed in frontend code
- ✅ All API calls are proxied through the backend
- ✅ `.env` file is excluded from version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### API Key Issues

If you're getting API errors:
1. Make sure your `.env` file exists and contains the correct API key
2. Verify your YouTube API key is valid and has the necessary permissions
3. Check that the YouTube Data API v3 is enabled in your Google Cloud Console

### CORS Issues

If you're getting CORS errors:
1. Make sure you're running the backend server (`npm run dev-server`)
2. Check that the frontend is making requests to the correct backend URL
3. Verify the CORS configuration in `server.js`
