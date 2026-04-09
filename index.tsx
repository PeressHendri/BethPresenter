import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/renderer/App';
import './src/renderer/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
