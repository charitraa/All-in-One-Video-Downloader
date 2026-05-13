# VideoMaster API Documentation

## Overview

VideoMaster provides a REST API for downloading videos from various social media platforms. The API is built with Django REST Framework and uses yt-dlp for video downloading.

## Base URL

```
http://127.0.0.1:8000/download/
```

## Authentication

Currently, no authentication is required for the download endpoints. However, some platforms may require cookies for accessing private content.

## Request Format

All endpoints accept POST requests with JSON payload:

```json
{
  "url": "VIDEO_URL_HERE"
}
```

## Response Format

### Success Response
- **Status**: 200 OK
- **Content-Type**: `video/mp4` (or appropriate video format)
- **Headers**: `Content-Disposition: attachment; filename="filename.mp4"`

The video file is returned as a downloadable attachment.

### Error Response
- **Status**: 400 Bad Request or 500 Internal Server Error
- **Content-Type**: `application/json`

```json
{
  "error": "Error message describing what went wrong"
}
```

## Endpoints

### 1. YouTube Downloads

Download videos, shorts, and playlists from YouTube.

**Endpoint:** `POST /download/youtube/`

**Supported URLs:**
- Regular videos: `https://www.youtube.com/watch?v=VIDEO_ID`
- Shorts: `https://www.youtube.com/shorts/SHORT_ID`
- Playlists: `https://www.youtube.com/playlist?list=PLAYLIST_ID`

**Example Request:**
```bash
curl -X POST http://127.0.0.1:8000/download/youtube/ \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  --output video.mp4
```

### 2. Instagram Downloads

#### Regular Posts and Reels
Download Instagram posts, photos, and reels.

**Endpoint:** `POST /download/instagram/`

**Supported URLs:**
- Posts: `https://www.instagram.com/p/POST_ID/`
- Reels: `https://www.instagram.com/reel/REEL_ID/`

#### Stories
Download Instagram story highlights.

**Endpoint:** `POST /download/instagram/story/`

**Supported URLs:**
- Stories: `https://www.instagram.com/stories/USERNAME/STORY_ID/`

### 3. Facebook Downloads

#### Videos and Posts
Download Facebook videos and posts.

**Endpoint:** `POST /download/facebook/`

**Supported URLs:**
- Videos: `https://www.facebook.com/USERNAME/videos/VIDEO_ID/`
- Posts: `https://www.facebook.com/USERNAME/posts/POST_ID/`

#### Stories
Download Facebook story content.

**Endpoint:** `POST /download/facebook/story/`

**Supported URLs:**
- Stories: `https://www.facebook.com/stories/STORY_ID/`

### 4. Twitter/X Downloads

Download videos and media from Twitter/X.

**Endpoint:** `POST /download/twitter/`

**Supported URLs:**
- Tweets: `https://twitter.com/USERNAME/status/TWEET_ID`

### 5. TikTok Downloads

Download videos from TikTok.

**Endpoint:** `POST /download/tiktok/`

**Supported URLs:**
- Videos: `https://www.tiktok.com/@USERNAME/video/VIDEO_ID`

### 6. Reddit Downloads

Download videos and GIFs from Reddit.

**Endpoint:** `POST /download/reddit/`

**Supported URLs:**
- Posts: `https://www.reddit.com/r/SUBREDDIT/comments/POST_ID/TITLE/`

## Error Codes

- **400 Bad Request**: Invalid URL or malformed request
- **500 Internal Server Error**: Download failed or server error

## Cookies Support

For platforms that require authentication, you can provide cookies by placing a `cookies.txt` file in the project root. The API will automatically use these cookies for downloads.

### Creating cookies.txt

1. Install browser extension like "Get cookies.txt" for Chrome/Firefox
2. Log in to the platform in your browser
3. Export cookies to `cookies.txt` format
4. Place the file in the project root directory

## Rate Limiting

Currently, there are no rate limits implemented. However, respect the terms of service of the platforms you're downloading from.

## CORS

The API is configured to accept requests from:
- `http://localhost:3000` (development frontend)
- `http://127.0.0.1:3000` (alternative development)

For production deployment, update the `CORS_ALLOWED_ORIGINS` setting in Django settings.

## Troubleshooting

### Common Issues

1. **"Download failed" error**: Check if the URL is valid and publicly accessible
2. **Private content**: Some content requires authentication - provide cookies
3. **Geo-restricted content**: Some content may not be available in your region
4. **Age-restricted content**: YouTube age-restricted videos may require cookies

### Debug Mode

Enable Django debug mode in settings to get detailed error messages during development.

## Examples

### Python Script
```python
import requests

def download_video(platform, url):
    api_url = f"http://127.0.0.1:8000/download/{platform}/"
    payload = {"url": url}

    response = requests.post(api_url, json=payload)

    if response.status_code == 200:
        filename = f"{platform}_video.mp4"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {filename}")
    else:
        print(f"Error: {response.json().get('error', 'Unknown error')}")

# Example usage
download_video("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
```

### JavaScript (Frontend)
```javascript
const downloadVideo = async (platform, url) => {
  const apiUrl = `http://127.0.0.1:8000/download/${platform}/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${platform}_video.mp4`;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      const error = await response.json();
      console.error('Download failed:', error.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

## Security Considerations

- This API is intended for personal use
- Respect platform terms of service
- Do not use for copyright infringement
- Consider implementing authentication for production use
- Rate limiting may be needed for public deployments

## Support

For issues or questions about the API, please check the main project repository or create an issue.