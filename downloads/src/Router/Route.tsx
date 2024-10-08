import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home  from '../Home';

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default Router;
