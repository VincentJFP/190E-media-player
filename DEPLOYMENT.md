# Deployment Guide for GitHub Pages

Since GitHub Pages only serves static files, you'll need to deploy the backend separately. Here are the best options:

## Option 1: Deploy Backend to Vercel (Recommended)

Vercel offers free hosting for Node.js applications and is very easy to set up.

### Steps:

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy the backend**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add `YOUTUBE_API_KEY` with your actual API key

5. **Update frontend to use Vercel URL**
   - Replace `/api/` calls with your Vercel URL
   - Example: `https://your-app.vercel.app/api/youtube/search`

## Option 2: Deploy Backend to Railway

Railway is another great option for Node.js hosting.

### Steps:

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Connect your GitHub repository**

3. **Set environment variables**
   - Add `YOUTUBE_API_KEY` in the Railway dashboard

4. **Deploy automatically**
   - Railway will deploy automatically when you push to GitHub

## Option 3: Use Serverless Functions

### Vercel Functions

Create a `api` folder in your project root:

```
api/
├── youtube/
│   ├── search.js
│   ├── videos.js
│   └── video-status.js
```

Example `api/youtube/search.js`:
```javascript
export default async function handler(req, res) {
  const { q, maxResults = 25 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(q)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=${maxResults}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}
```

## Option 4: Use a Different Hosting Service

### Netlify Functions

Similar to Vercel, Netlify supports serverless functions.

### Heroku

Deploy the full Node.js application to Heroku.

## GitHub Pages Setup

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Secure API key setup with backend proxy"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and `/src` folder

3. **Update API endpoints**
   - Change all `/api/` calls to point to your backend URL
   - Example: `https://your-backend.vercel.app/api/youtube/search`

## Security Checklist

- ✅ API key is in environment variables
- ✅ `.env` file is in `.gitignore`
- ✅ Backend is deployed separately
- ✅ Frontend doesn't contain API key
- ✅ CORS is properly configured

## Testing Your Deployment

1. **Test the backend**
   ```bash
   curl "https://your-backend.vercel.app/api/youtube/search?q=test"
   ```

2. **Test the frontend**
   - Open your GitHub Pages URL
   - Try searching for music
   - Check browser console for errors

## Troubleshooting

### CORS Errors
- Make sure your backend allows requests from your GitHub Pages domain
- Update CORS configuration in your backend

### API Key Issues
- Verify the environment variable is set correctly in your hosting platform
- Check that the API key has the necessary permissions

### 404 Errors
- Ensure your API routes are correctly configured
- Check that the backend URL is correct in your frontend code
