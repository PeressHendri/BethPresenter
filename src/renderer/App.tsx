import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import GPresenterApp from './GPresenterApp';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <GPresenterApp />
      </Router>
    </ErrorBoundary>
  );
}
