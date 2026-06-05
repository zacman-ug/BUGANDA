import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HeritageProvider } from './context/HeritageContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeritageProvider>
      <App />
    </HeritageProvider>
  </React.StrictMode>,
)