import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Use environment variable for WebSocket URL
const API_URL = import.meta.env.VITE_API_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App apiUrl={API_URL} />
  </React.StrictMode>
);
