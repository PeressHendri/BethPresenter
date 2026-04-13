const isDev = import.meta.env ? import.meta.env.MODE === 'development' : process.env.NODE_ENV === 'development';

export const logRenderTime = (componentName, startTime) => {
  if (!isDev) return;
  const time = performance.now() - startTime;
  if(time > 16) { 
      console.warn(`[Slow Render] ${componentName} took ${time.toFixed(2)}ms`);
  }
};

export const logQueryTime = (queryName, ms) => {
  if (!isDev) return;
  if (ms > 50) {
      console.warn(`[Slow Query] ${queryName} took ${ms}ms`);
  }
};
