import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/renderer/styles/globals.css';
import { StageDisplay } from './stage/StageDisplay';

const root = document.getElementById('stage-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <StageDisplay />
    </React.StrictMode>
  );
}
