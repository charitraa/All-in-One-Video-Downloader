import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [platform, setPlatform] = useState<string>('youtube');
  const [url, setUrl] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Toggle dark mode and store the preference in local storage
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, []);

  const platforms = [
    {
      name: 'YouTube',
      icon: '▶️',
      key: 'youtube',
      description: 'Download videos, shorts & playlists',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      name: 'TikTok',
      icon: '🎵',
      key: 'tiktok',
      description: 'Download trending videos',
      color: 'from-pink-500 to-purple-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      name: 'Instagram',
      icon: '📸',
      key: 'instagram',
      description: 'Download posts & reels',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      name: 'Twitter/X',
      icon: '🐦',
      key: 'twitter',
      description: 'Download tweets with media',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Facebook',
      icon: '📘',
      key: 'facebook',
      description: 'Download videos & posts',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Instagram Stories',
      icon: '📱',
      key: 'instagram_story',
      description: 'Download story highlights',
      color: 'from-orange-500 to-pink-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      name: 'Facebook Stories',
      icon: '👥',
      key: 'facebook_story',
      description: 'Download story content',
      color: 'from-blue-700 to-indigo-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
  ];

  // URL validation patterns for each platform
  const validateUrlForPlatform = (url: string, platform: string): boolean => {
    const patterns = {
      youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/[\w-]+/,
      instagram_story: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/stories\/[\w.-]+/,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w]+\/status\/\d+/,
      facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:[\w.-]+\/videos\/|[\w.-]+\/posts\/)/,
      facebook_story: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/stories\/\d+/,
      reddit: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+/
    };

    const pattern = patterns[platform as keyof typeof patterns];
    return pattern ? pattern.test(url) : false;
  };

  const downloadVideo = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDownloadProgress(0);

    if (!url) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    // Platform-specific URL validation
    if (!validateUrlForPlatform(url, platform)) {
      const platformNames = {
        youtube: 'YouTube',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        instagram_story: 'Instagram Stories',
        twitter: 'Twitter/X',
        facebook: 'Facebook',
        facebook_story: 'Facebook Stories',
        reddit: 'Reddit'
      };
      setErrorMessage(`Please enter a valid ${platformNames[platform as keyof typeof platformNames]} URL.`);
      return;
    }

    setIsDownloading(true);
    const apiUrl = `http://127.0.0.1:8000/download/${platform}/`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setDownloadProgress(progress);
      }
    };

    xhr.onload = () => {
      setIsDownloading(false);
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'video/mp4' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${platform}_video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        setDownloadProgress(0);
        setSuccessMessage('Video downloaded successfully!');
        setUrl(''); // Clear the URL after successful download
      } else {
        setErrorMessage('Download failed. Please check the URL and try again.');
      }
    };

    xhr.onerror = () => {
      setIsDownloading(false);
      setErrorMessage('Network error occurred. Please try again.');
    };

    xhr.send(JSON.stringify({ url }));
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      {/* Navigation Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VD</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VideoMaster
              </h1>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Download Videos from
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Any Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Fast, secure, and unlimited video downloads from YouTube, TikTok, Instagram, Twitter, and more.
            No ads, no limits, just pure downloading power.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Forever</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-blue-500">⚡</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-purple-500">🔒</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Main Download Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12">
          {/* Platform Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose Your Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {platforms.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPlatform(item.key)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    platform === item.key
                      ? 'border-blue-500 bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-600 ' + item.bgColor + ' text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className={`font-semibold text-sm mb-1 ${platform === item.key ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {item.name}
                    </h3>
                    <p className={`text-xs ${platform === item.key ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input Section */}
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label htmlFor="url" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Paste Video URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  placeholder={`Enter ${platforms.find(p => p.key === platform)?.name} video URL...`}
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isDownloading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className={`w-2 h-2 rounded-full ${url ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <p className="text-red-700 dark:text-red-400 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">✅</span>
                  <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {downloadProgress > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Downloading...</span>
                  <span>{downloadProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={downloadVideo}
              disabled={isDownloading || !url}
              className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                isDownloading
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : url
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isDownloading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">⬇️</span>
                  <span>Download Video</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-300">Download videos in seconds with our optimized servers and advanced algorithms.</p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
            <p className="text-gray-600 dark:text-gray-300">Your downloads are private. No logs, no tracking, just secure video downloads.</p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">High Quality</h3>
            <p className="text-gray-600 dark:text-gray-300">Get the best available quality for your downloads, from HD to 4K resolution.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">VD</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VideoMaster
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2026 VideoMaster. Built with ❤️ for content creators and viewers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
