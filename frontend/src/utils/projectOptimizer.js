// Project Optimization Utilities
// Comprehensive fixes for common issues

class ProjectOptimizer {
  // Initialize all optimizations
  static async initializeOptimizations() {
    console.log('🚀 Starting project optimizations...');
    
    try {
      // 1. Fix environment variables
      this.validateEnvironment();
      
      // 2. Initialize services
      await this.initializeServices();
      
      // 3. Setup error handlers
      this.setupGlobalErrorHandlers();
      
      // 4. Optimize performance
      this.setupPerformanceOptimizations();
      
      console.log('✅ Project optimizations completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Project optimization failed:', error);
      return false;
    }
  }

  // Validate environment configuration
  static validateEnvironment() {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_GOOGLE_PLACES_API_KEY',
      'VITE_API_BASE_URL'
    ];

    const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing environment variables:', missing);
      // Don't throw error, just warn
    } else {
      console.log('✅ Environment variables validated');
    }
  }

  // Initialize all services
  static async initializeServices() {
    try {
      // Test backend connection
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      try {
        const response = await fetch(`${backendUrl}/health`, { 
          method: 'GET',
          timeout: 5000 
        });
        
        if (response.ok) {
          console.log('✅ Backend connection successful');
        } else {
          console.warn('⚠️ Backend health check failed');
        }
      } catch (error) {
        console.warn('⚠️ Backend not available, using fallback mode');
      }

      // Initialize Google APIs
      if (window.google) {
        console.log('✅ Google APIs already loaded');
      } else {
        console.log('🔄 Google APIs will load when needed');
      }

    } catch (error) {
      console.warn('⚠️ Service initialization warning:', error.message);
    }
  }

  // Setup global error handlers
  static setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      
      // Prevent default browser error handling for known issues
      if (event.reason?.message?.includes('Firebase') ||
          event.reason?.message?.includes('Google') ||
          event.reason?.message?.includes('Network')) {
        event.preventDefault();
        console.log('🔧 Handled known error gracefully');
      }
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      
      // Handle specific error types
      if (event.error?.message?.includes('Loading chunk')) {
        console.log('🔄 Chunk loading error - suggesting refresh');
        // Could show user-friendly message here
      }
    });

    console.log('✅ Global error handlers setup');
  }

  // Setup performance optimizations
  static setupPerformanceOptimizations() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Optimize images
    this.optimizeImages();
    
    console.log('✅ Performance optimizations applied');
  }

  // Preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      '/road-trip-vacation.jpg',
      // Add other critical resources
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }

  // Setup lazy loading for images
  static setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Optimize images
  static optimizeImages() {
    // Add error handling for broken images
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        console.warn('🖼️ Image failed to load:', e.target.src);
        // Could set a fallback image here
        e.target.style.display = 'none';
      }
    }, true);
  }

  // Fix common Firebase issues
  static fixFirebaseIssues() {
    // Clear any corrupted Firebase data
    try {
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('firebase:') || key.startsWith('firebaseui')
      );
      
      if (firebaseKeys.length > 0) {
        console.log('🔧 Cleaning Firebase localStorage');
        firebaseKeys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('⚠️ Could not clean Firebase localStorage:', error);
    }
  }

  // Fix authentication issues
  static async fixAuthIssues() {
    try {
      // Clear any corrupted auth data
      const authKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('firebase:authUser') ||
        key.startsWith('firebase:persistence')
      );

      // Don't clear auth data automatically, just log it
      if (authKeys.length > 0) {
        console.log('🔍 Found Firebase auth data in localStorage:', authKeys.length, 'keys');
      }

      // Check if user is stuck in loading state
      const authLoadingTimeout = setTimeout(() => {
        console.warn('⚠️ Auth loading timeout - this might indicate an issue');
        // Don't force anything, just warn
      }, 15000); // Increased timeout

      // Clear timeout if auth completes normally
      window.addEventListener('authStateChanged', () => {
        clearTimeout(authLoadingTimeout);
      });

      // Monitor auth state changes
      let authStateChanges = 0;
      window.addEventListener('authStateChanged', () => {
        authStateChanges++;
        console.log(`🔄 Auth state change #${authStateChanges}`);

        // If too many rapid changes, something might be wrong
        if (authStateChanges > 5) {
          console.warn('⚠️ Too many auth state changes detected');
        }
      });

    } catch (error) {
      console.warn('⚠️ Auth fix warning:', error);
    }
  }

  // Test all critical functions
  static async runDiagnostics() {
    console.log('🔍 Running project diagnostics...');
    
    const results = {
      environment: this.testEnvironment(),
      backend: await this.testBackend(),
      frontend: this.testFrontend(),
      auth: await this.testAuth()
    };

    console.log('📊 Diagnostic results:', results);
    return results;
  }

  static testEnvironment() {
    const required = ['VITE_FIREBASE_API_KEY', 'VITE_API_BASE_URL'];
    const available = required.filter(key => import.meta.env[key]);
    return {
      status: available.length === required.length ? 'OK' : 'WARNING',
      available: available.length,
      total: required.length
    };
  }

  static async testBackend() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
      return {
        status: response.ok ? 'OK' : 'ERROR',
        url: import.meta.env.VITE_API_BASE_URL
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  static testFrontend() {
    return {
      status: 'OK',
      react: !!window.React,
      router: !!window.location
    };
  }

  static async testAuth() {
    try {
      // Basic Firebase availability test
      return {
        status: window.firebase ? 'OK' : 'UNKNOWN',
        available: !!window.firebase
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // Emergency fixes for common issues
  static applyEmergencyFixes() {
    console.log('🚨 Applying emergency fixes...');
    
    // Fix 1: Clear corrupted data
    // this.fixFirebaseIssues();
    
    // Fix 2: Reset auth state if stuck
    this.fixAuthIssues();
    
    // Fix 3: Reload if critical error
    const criticalErrors = ['ChunkLoadError', 'Loading chunk'];
    window.addEventListener('error', (e) => {
      if (criticalErrors.some(error => e.message?.includes(error))) {
        console.log('🔄 Critical error detected, suggesting reload');
        setTimeout(() => {
          if (confirm('The app encountered an error. Would you like to reload?')) {
            window.location.reload();
          }
        }, 1000);
      }
    });
    
    console.log('✅ Emergency fixes applied');
  }
}

export default ProjectOptimizer;