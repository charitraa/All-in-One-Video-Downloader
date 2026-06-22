import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home  from '../Home';

const Router: React.FC = () => {
  return (
    <Routes>
      {/* The app is a single shell that picks its page from the URL,
          so every known route renders <Home /> (see PAGE_PATHS in Home.tsx). */}
      <Route path="/" element={<Home />} />
      <Route path="/download" element={<Home />} />
      <Route path="/about" element={<Home />} />
      <Route path="/settings" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default Router;
