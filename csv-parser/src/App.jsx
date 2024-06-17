// src/App.jsx
import React from 'react';
import { BrowserRouter as Router,Route,Routes,Link } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import CsvViewer from './components/CsvViewer';
import './App.css'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Upload CSV</Link>
            </li>
            <li>
              <Link to="/view">View CSV</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/view" element={<CsvViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
