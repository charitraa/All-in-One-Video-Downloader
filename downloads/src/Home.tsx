import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [platform, setPlatform] = useState<string>('twitter');
  const [url, setUrl] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
    { name: 'Twitter Downloader', icon: '🐦', key: 'twitter' },
    { name: 'YouTube Downloader', icon: '📹', key: 'youtube' },
    { name: 'Facebook Downloader', icon: '📘', key: 'facebook' },
    { name: 'Instagram Downloader', icon: '📷', key: 'instagram' },
    // { name: 'Reddit Downloader', icon: '👽', key: 'reddit' },
    // { name: 'LinkedIn Downloader', icon: '💼', key: 'linkedin' },
    { name: 'TikTok Downloader', icon: '🎵', key: 'tiktok' },
    { name: 'Instagram Story Downloader', icon: '📷', key: 'instagram_story' },
    { name: 'Facebook Story Downloader', icon: '📘', key: 'facebook_story' },
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition duration-300">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-10 rounded-3xl shadow-xl w-full max-w-4xl transition duration-300 relative">
          
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full focus:outline-none transition duration-300"
          >
            {darkMode ? '🌞' : '🌙'}
          </button>

          <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 dark:text-gray-100">
            All in One Video Downloader
          </h1>

          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Download videos from multiple platforms with one click. Paste the video URL and save it directly to your device.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {platforms.map((item) => (
              <button
                key={item.key}
                onClick={() => setPlatform(item.key)}
                className={`px-4 py-3 w-48 rounded-lg text-base font-semibold transition duration-300 border-2 ${
                  platform === item.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                } flex items-center justify-center space-x-2 hover:shadow-md`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="url" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Video URL
            </label>
            <input
              type="text"
              id="url"
              placeholder="Enter URL & Click Download"
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base shadow-sm focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-600 transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <button
            onClick={() => console.log(`Downloading from ${platform}`)}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold transition duration-300 hover:bg-blue-600 hover:shadow-2xl dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Download Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
