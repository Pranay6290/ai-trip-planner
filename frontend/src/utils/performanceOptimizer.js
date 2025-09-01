// Performance Optimization Utilities
// Made by Pranay Gupta

import React from 'react';

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility
export const lazyLoad = (importFunc) => {
  return React.lazy(importFunc);
};

// Image optimization
export const optimizeImage = (src, width = 800, quality = 80) => {
  if (!src) return '';
  
  // If it's a Google Places photo reference
  if (src.includes('photo_reference')) {
    return `${src}&maxwidth=${width}`;
  }
  
  // If it's a regular URL, you could use a service like Cloudinary
  return src;
};

// Memory cleanup for components
export const useCleanup = (cleanupFn) => {
  React.useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// Memoization helper
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Local storage with expiration
export const localStorageWithExpiry = {
  set: (key, value, ttl = 3600000) => { // 1 hour default
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label) => {
    performance.mark(`${label}-start`);
  },
  
  endTiming: (label) => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    
    // Clean up marks
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
    
    return measure.duration;
  }
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    console.log('📦 Bundle Analysis:');
    console.log('- React:', React);
    console.log('- Firebase modules loaded:', Object.keys(window).filter(key => key.includes('firebase')));
    
    // Estimate bundle size
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      if (script.src.includes('node_modules') || script.src.includes('vite')) {
        console.log('📄 Script:', script.src);
      }
    });
  }
};

// Error tracking and reporting
export const errorTracker = {
  track: (error, context = {}) => {
    console.error('🚨 Error tracked:', error);
    console.log('📍 Context:', context);
    
    // In production, you would send this to an error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry, LogRocket, etc.
      // errorTrackingService.captureException(error, context);
    }
  },
  
  trackPerformance: (metric, value) => {
    console.log(`📊 Performance metric - ${metric}: ${value}`);
    
    // In production, send to analytics
    if (import.meta.env.PROD) {
      // Example: Google Analytics, Mixpanel, etc.
      // analytics.track(metric, value);
    }
  }
};

// React hooks for optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  console.log('🚀 Performance optimization utilities loaded');
  
  // Monitor initial load time with proper timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 0) {
        console.log(`⚡ Page load time: ${loadTime}ms`);
      }
    }, 100);
  });
  
  // Make utilities available globally for debugging
  window.performanceUtils = {
    debounce,
    throttle,
    memoize,
    performanceMonitor,
    errorTracker,
    analyzeBundleSize
  };
}
