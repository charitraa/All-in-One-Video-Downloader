import React, { useState } from 'react';

const Home: React.FC = () => {
  const [platform, setPlatform] = useState<string>('twitter');
  const [url, setUrl] = useState<string>('');

  const platforms = [
    { name: 'Twitter Downloader', icon: '🐦', key: 'twitter' },
    { name: 'Youtube Downloader', icon: '📹', key: 'any' },
    { name: 'Facebook Downloader', icon: '📘', key: 'facebook' },
    { name: 'Instagram Downloader', icon: '📷', key: 'instagram' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">All in One Video Downloader</h1>
        <p className="text-center text-gray-600 mb-8">
          Download videos from multiple platforms with one click. Paste the video URL and save it directly to your device.
        </p>

        <div className="flex justify-around mb-6">
          {platforms.map((item) => (
            <button
              key={item.key}
              onClick={() => setPlatform(item.key)}
              className={`px-4 py-3 w-48 rounded-lg text-base font-semibold transition duration-300 border-2 ${
                platform === item.key
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg'
                  : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-100'
              } flex items-center justify-center space-x-2 hover:shadow-md`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="url" className="block text-lg font-medium text-gray-700 mb-2">
            Enter Video URL
          </label>
          <input
            type="text"
            id="url"
            placeholder="Enter URL & Click Download"
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-base shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 transition duration-200"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button
          onClick={() => console.log(`Downloading from ${platform}`)}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold transition duration-300 hover:bg-blue-600 hover:shadow-2xl"
        >
          Download Video
        </button>
      </div>
    </div>
  );
};

export default Home;
