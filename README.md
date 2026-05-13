# VideoMaster - All-in-One Video Downloader

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178c6.svg)](https://www.typescriptlang.org/)

VideoMaster is a powerful, user-friendly web application that allows you to download videos from multiple social media platforms including YouTube, TikTok, Instagram, Twitter (X), Facebook, and Reddit. Built with Django REST Framework backend and React frontend, it provides a seamless downloading experience with a beautiful, responsive interface.

## ✨ Features

- **Multi-Platform Support**: Download videos from YouTube, TikTok, Instagram (posts, reels, stories), Twitter, Facebook (videos, stories), and Reddit
- **High-Quality Downloads**: Get the best available quality, including HD and 4K resolution
- **Lightning Fast**: Optimized servers and advanced algorithms for quick downloads
- **Secure & Private**: No logs, no tracking - your downloads remain private
- **User-Friendly Interface**: Clean, modern UI with dark mode support
- **Progress Tracking**: Real-time download progress with visual indicators
- **Cross-Platform**: Works on desktop and mobile devices
- **No Ads, No Limits**: Free forever with unlimited downloads

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup (Django)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/videomaster.git
   cd videomaster
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional, for admin access)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the Django server**
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://127.0.0.1:8000`

### Frontend Setup (React)

1. **Navigate to the frontend directory**
   ```bash
   cd downloads
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 📖 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select your desired platform from the available options
3. Paste the video URL in the input field
4. Click "Download Video" and wait for the download to complete
5. The video will be automatically downloaded to your device

## 🛠️ API Documentation

The VideoMaster API provides endpoints for downloading videos from various platforms. All endpoints accept POST requests with a JSON payload containing the video URL.

### Base URL
```
http://127.0.0.1:8000/download/
```

### Endpoints

#### YouTube
- **Endpoint**: `POST /download/youtube/`
- **Description**: Download YouTube videos, shorts, and playlists
- **Payload**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
  ```

#### Instagram
- **Endpoint**: `POST /download/instagram/`
- **Description**: Download Instagram posts and reels
- **Payload**:
  ```json
  {
    "url": "https://www.instagram.com/p/POST_ID/"
  }
  ```

- **Endpoint**: `POST /download/instagram/story/`
- **Description**: Download Instagram story highlights
- **Payload**:
  ```json
  {
    "url": "https://www.instagram.com/stories/USERNAME/STORY_ID/"
  }
  ```

#### Facebook
- **Endpoint**: `POST /download/facebook/`
- **Description**: Download Facebook videos and posts
- **Payload**:
  ```json
  {
    "url": "https://www.facebook.com/USERNAME/posts/POST_ID/"
  }
  ```

- **Endpoint**: `POST /download/facebook/story/`
- **Description**: Download Facebook story content
- **Payload**:
  ```json
  {
    "url": "https://www.facebook.com/stories/STORY_ID/"
  }
  ```

#### Twitter/X
- **Endpoint**: `POST /download/twitter/`
- **Description**: Download Twitter/X videos and media
- **Payload**:
  ```json
  {
    "url": "https://twitter.com/USERNAME/status/TWEET_ID"
  }
  ```

#### TikTok
- **Endpoint**: `POST /download/tiktok/`
- **Description**: Download TikTok videos
- **Payload**:
  ```json
  {
    "url": "https://www.tiktok.com/@USERNAME/video/VIDEO_ID"
  }
  ```

#### Reddit
- **Endpoint**: `POST /download/reddit/`
- **Description**: Download Reddit videos and GIFs
- **Payload**:
  ```json
  {
    "url": "https://www.reddit.com/r/SUBREDDIT/comments/POST_ID/TITLE/"
  }
  ```

### Response
All endpoints return the video file as a downloadable attachment on success, or an error message in JSON format on failure.

## 🔧 Configuration

### Cookies Support
For platforms that require authentication, place your cookies in a `cookies.txt` file in the project root. The application will automatically use these cookies for downloads.

### CORS Settings
The backend is configured to allow requests from `http://localhost:3000` (development) by default. For production deployment, update the `CORS_ALLOWED_ORIGINS` in `Video/settings.py`.

## 🏗️ Project Structure

```
videomaster/
├── Video/                          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── downloads/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── Home.tsx
│   │   └── ...
│   ├── package.json
│   └── ...
├── youtube/                        # YouTube download app
├── instagram/                      # Instagram download app
├── facebook/                       # Facebook download app
├── twitter/                        # Twitter download app
├── tiktok/                         # TikTok download app
├── reddit/                         # Reddit download app
├── manage.py
├── requirements.txt
├── db.sqlite3
└── cookies.txt (optional)
```

## 📦 Dependencies

### Backend
- Django 5.1+
- Django REST Framework
- yt-dlp (for video downloading)
- django-cors-headers

### Frontend
- React 18.3+
- TypeScript 5.5+
- Material-UI 6.1+
- Tailwind CSS 3.4+
- Axios 1.7+
- React Router DOM 6.26+

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please respect the terms of service of the platforms you download from and ensure you have the right to download and use the content. The developers are not responsible for any misuse of this application.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the powerful video downloading capabilities
- [Django](https://www.djangoproject.com/) for the robust backend framework
- [React](https://reactjs.org/) for the amazing frontend library
- All the contributors and maintainers of the open-source libraries used in this project

---

Built with ❤️ for content creators and viewers.</content>
<parameter name="filePath">/home/meow/Desktop/All-in-One-Video-Downloader/README.md