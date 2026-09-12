import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HeritageProvider } from './context/HeritageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeritageProvider>
        <App />
      </HeritageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
