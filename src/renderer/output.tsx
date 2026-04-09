import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/renderer/styles/globals.css';
import { OutputWindow } from './output/OutputWindow';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <OutputWindow />
    </React.StrictMode>
  );
}
