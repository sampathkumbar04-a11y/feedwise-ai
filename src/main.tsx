import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'lenis/dist/lenis.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Register service worker for instant offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, refreshing...');
  },
  onOfflineReady() {
    console.log('FeedWise AI is offline-ready.');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
