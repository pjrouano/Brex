// src/App.jsx
import React from 'react';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import LandingPage from './landing-page/LandingPage';
import TakeQuiz from './landing-page/components/takeQuiz';
import UploadPage from './components/UploadPage';

function App() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Assessment/:id" element={<TakeQuiz />} />
          <Route path="/Upload-Assessment" element={<UploadPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
