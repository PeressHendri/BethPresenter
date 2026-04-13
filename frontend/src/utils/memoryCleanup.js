export const cleanupUnusedPreviews = () => {
   console.log('Memory Cleanup: Clearing unused caches');
   if (window.gc) window.gc();
};

export const clearOldHistory = (historyArr, limit = 20) => {
   if (Array.isArray(historyArr) && historyArr.length > limit) {
      console.log(`Memory Cleanup: Truncating history from ${historyArr.length} to ${limit}`);
      return historyArr.slice(-limit);
   }
   return historyArr;
};

export const unloadHiddenVideos = () => {
   const videos = document.querySelectorAll('video:not(.visible-video)');
   videos.forEach(v => {
      if (v.src && !v.dataset.unloaded) {
          v.dataset.originalSrc = v.src;
          v.pause();
          v.removeAttribute('src');
          v.load();
          v.dataset.unloaded = 'true';
      }
   });
   console.log(`Memory Cleanup: Unloaded ${videos.length} hidden videos`);
};
