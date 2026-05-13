# Changelog

All notable changes to VideoMaster will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of VideoMaster
- Support for downloading videos from:
  - YouTube (videos, shorts, playlists)
  - TikTok
  - Instagram (posts, reels, stories)
  - Twitter/X
  - Facebook (videos, stories)
  - Reddit
- Modern React frontend with TypeScript
- Django REST API backend
- Dark mode support
- Real-time download progress
- Responsive design for mobile and desktop
- yt-dlp integration for reliable downloads

### Technical Details
- Backend: Django 5.1.1, Django REST Framework 3.15.2
- Frontend: React 18.3+, TypeScript 5.5+, Material-UI 6.1+
- Video downloading: yt-dlp 2024.12.13
- Styling: Tailwind CSS 3.4+

## [1.0.0] - 2026-05-13

### Added
- Complete video downloader application
- Multi-platform video downloading
- Web-based user interface
- API endpoints for all supported platforms
- Cookie support for authenticated downloads
- CORS configuration for frontend-backend communication

### Changed
- Initial public release

### Fixed
- N/A (initial release)

### Security
- Basic security measures implemented
- Input validation on all endpoints
- CORS protection configured