// Comprehensive Error Detection and Optimization Utility
import { searchIndianDestinations } from '../data/indianDestinations.js';
import workingAIService from '../services/workingAIService.js';

class ErrorDetector {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.optimizations = [];
    this.isRunning = false;
  }

  // Start comprehensive error detection
  async runCompleteErrorDetection() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.errors = [];
    this.warnings = [];
    this.optimizations = [];

    console.log('🔍 Starting comprehensive error detection...');

    try {
      // 1. Check API Connectivity
      await this.checkAPIConnectivity();
      
      // 2. Check Service Functionality
      await this.checkServiceFunctionality();
      
      // 3. Check Component Integrity
      await this.checkComponentIntegrity();
      
      // 4. Check Performance Issues
      await this.checkPerformanceIssues();
      
      // 5. Check Memory Leaks
      await this.checkMemoryLeaks();
      
      // 6. Check Console Errors
      this.checkConsoleErrors();
      
      // 7. Generate Optimization Recommendations
      this.generateOptimizations();

    } catch (error) {
      this.errors.push({
        type: 'CRITICAL',
        message: 'Error detection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isRunning = false;
    }

    return this.generateReport();
  }

  // Check API connectivity
  async checkAPIConnectivity() {
    console.log('🌐 Checking API connectivity...');
    
    const apis = [
      { name: 'Backend Health', url: 'http://localhost:5000/health' },
      { name: 'Backend Status', url: 'http://localhost:5000/api/status' },
      { name: 'Places Search', url: 'http://localhost:5000/api/places/search?query=test&limit=1' }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (!response.ok) {
          this.errors.push({
            type: 'API_ERROR',
            message: `${api.name} returned ${response.status}`,
            url: api.url,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`✅ ${api.name} is working`);
        }
      } catch (error) {
        this.errors.push({
          type: 'API_CONNECTION_ERROR',
          message: `Cannot connect to ${api.name}`,
          url: api.url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Check service functionality
  async checkServiceFunctionality() {
    console.log('🔧 Checking service functionality...');
    
    try {
      // Test search functionality
      const searchResult = searchIndianDestinations('Delhi');
      if (searchResult.length === 0) {
        this.warnings.push({
          type: 'SERVICE_WARNING',
          message: 'Search service not returning results for Delhi',
          timestamp: new Date().toISOString()
        });
      }

      // Test AI service
      try {
        // Basic functionality test without actual API call
        if (!workingAIService) {
          this.errors.push({
            type: 'SERVICE_ERROR',
            message: 'Working AI Service not properly exported',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        this.errors.push({
          type: 'SERVICE_IMPORT_ERROR',
          message: 'Cannot import Working AI Service',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.errors.push({
        type: 'SERVICE_CHECK_ERROR',
        message: 'Service functionality check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check component integrity
  async checkComponentIntegrity() {
    console.log('🧩 Checking component integrity...');

    // Check if React is properly loaded (more robust check)
    const isReactLoaded = (
      typeof window !== 'undefined' &&
      (window.React ||
       document.querySelector('[data-reactroot]') ||
       document.querySelector('#root')?.hasChildNodes() ||
       document.querySelector('script[src*="react"]'))
    );

    if (!isReactLoaded) {
      this.warnings.push({
        type: 'REACT_WARNING',
        message: 'React may not be fully loaded yet',
        timestamp: new Date().toISOString()
      });
    }

    // Check if required DOM elements exist
    const requiredElements = ['root'];
    requiredElements.forEach(id => {
      if (!document.getElementById(id)) {
        this.errors.push({
          type: 'DOM_ERROR',
          message: `Required element #${id} not found`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check for broken images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (img.naturalWidth === 0 && img.complete) {
        this.warnings.push({
          type: 'IMAGE_WARNING',
          message: `Broken image detected at index ${index}`,
          src: img.src,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Check performance issues
  async checkPerformanceIssues() {
    console.log('⚡ Checking performance issues...');
    
    // Check bundle size (approximate)
    const scripts = document.querySelectorAll('script[src]');
    let totalScriptSize = 0;
    
    scripts.forEach(script => {
      // Estimate based on URL length (rough approximation)
      totalScriptSize += script.src.length;
    });

    if (totalScriptSize > 10000) {
      this.optimizations.push({
        type: 'PERFORMANCE_OPTIMIZATION',
        message: 'Consider code splitting to reduce bundle size',
        impact: 'Medium',
        timestamp: new Date().toISOString()
      });
    }

    // Check for excessive DOM nodes
    const domNodes = document.querySelectorAll('*').length;
    if (domNodes > 1500) {
      this.optimizations.push({
        type: 'DOM_OPTIMIZATION',
        message: `High DOM node count (${domNodes}). Consider virtualization for large lists.`,
        impact: 'Medium',
        timestamp: new Date().toISOString()
      });
    }

    // Check for memory usage (if available)
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      if (memoryUsage > 50) {
        this.warnings.push({
          type: 'MEMORY_WARNING',
          message: `High memory usage: ${memoryUsage.toFixed(2)} MB`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Check for memory leaks
  async checkMemoryLeaks() {
    console.log('🧠 Checking for potential memory leaks...');
    
    // Check for event listeners that might not be cleaned up
    const eventTypes = ['click', 'scroll', 'resize', 'keydown'];
    eventTypes.forEach(type => {
      // This is a simplified check - in real scenarios you'd need more sophisticated detection
      const elements = document.querySelectorAll(`[on${type}]`);
      if (elements.length > 20) {
        this.warnings.push({
          type: 'MEMORY_LEAK_WARNING',
          message: `Many ${type} event listeners detected (${elements.length}). Ensure proper cleanup.`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check for potential React memory leaks
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      // This is a very basic check - React DevTools would be better
      this.optimizations.push({
        type: 'REACT_OPTIMIZATION',
        message: 'Consider using React.memo for expensive components',
        impact: 'Low',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check console errors
  checkConsoleErrors() {
    console.log('📝 Checking console errors...');
    
    // Override console methods to capture errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let errorCount = 0;
    let warnCount = 0;
    
    console.error = (...args) => {
      errorCount++;
      this.errors.push({
        type: 'CONSOLE_ERROR',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      warnCount++;
      this.warnings.push({
        type: 'CONSOLE_WARNING',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalWarn.apply(console, args);
    };
    
    // Restore after a short delay
    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
    }, 5000);
  }

  // Generate optimization recommendations
  generateOptimizations() {
    console.log('🚀 Generating optimization recommendations...');
    
    // API optimization
    this.optimizations.push({
      type: 'API_OPTIMIZATION',
      message: 'Implement request caching to reduce API calls',
      impact: 'High',
      implementation: 'Add caching layer in services',
      timestamp: new Date().toISOString()
    });

    // Image optimization
    this.optimizations.push({
      type: 'IMAGE_OPTIMIZATION',
      message: 'Use WebP format and lazy loading for images',
      impact: 'Medium',
      implementation: 'Update image components with lazy loading',
      timestamp: new Date().toISOString()
    });

    // Code splitting
    this.optimizations.push({
      type: 'CODE_SPLITTING',
      message: 'Implement route-based code splitting',
      impact: 'High',
      implementation: 'Use React.lazy() for route components',
      timestamp: new Date().toISOString()
    });
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalOptimizations: this.optimizations.length,
        overallHealth: this.calculateOverallHealth()
      },
      errors: this.errors,
      warnings: this.warnings,
      optimizations: this.optimizations,
      recommendations: this.generateRecommendations()
    };

    console.log('📊 Error Detection Report:', report);
    return report;
  }

  // Calculate overall health score
  calculateOverallHealth() {
    const criticalErrors = this.errors.filter(e => e.type.includes('CRITICAL')).length;
    const apiErrors = this.errors.filter(e => e.type.includes('API')).length;
    const serviceErrors = this.errors.filter(e => e.type.includes('SERVICE')).length;
    
    if (criticalErrors > 0) return 'CRITICAL';
    if (apiErrors > 2 || serviceErrors > 2) return 'POOR';
    if (this.errors.length > 5) return 'FAIR';
    if (this.errors.length > 0 || this.warnings.length > 10) return 'GOOD';
    return 'EXCELLENT';
  }

  // Generate actionable recommendations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix all critical errors immediately',
        description: 'Address API connectivity and service functionality issues'
      });
    }
    
    if (this.warnings.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review and address warnings',
        description: 'Warnings may indicate potential issues that could become errors'
      });
    }
    
    if (this.optimizations.length > 0) {
      recommendations.push({
        priority: 'LOW',
        action: 'Implement performance optimizations',
        description: 'Improve user experience with performance enhancements'
      });
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const errorDetector = new ErrorDetector();
export default errorDetector;
