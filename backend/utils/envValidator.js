import dotenv from 'dotenv';

dotenv.config();

class EnvironmentValidator {
  constructor() {
    this.requiredVars = [
      'GOOGLE_GEMINI_AI_API_KEY',
      'GOOGLE_PLACES_API_KEY',
      'FIREBASE_PROJECT_ID'
    ];
    
    this.optionalVars = [
      'WEATHER_API_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];
  }

  validate() {
    const missing = [];
    const warnings = [];
    const valid = [];

    console.log('🔍 Validating environment configuration...\n');

    // Check required variables
    this.requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value === 'your_' + varName.toLowerCase() + '_here') {
        missing.push(varName);
      } else {
        valid.push(varName);
      }
    });

    // Check optional variables
    this.optionalVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value === 'your_' + varName.toLowerCase() + '_here') {
        warnings.push(varName);
      } else {
        valid.push(varName);
      }
    });

    // Validate API key formats
    this.validateApiKeyFormats();

    // Display results
    this.displayResults(valid, missing, warnings);

    return {
      isValid: missing.length === 0,
      missing,
      warnings,
      valid
    };
  }

  validateApiKeyFormats() {
    const apiKeys = {
      'GOOGLE_GEMINI_AI_API_KEY': /^AIza[0-9A-Za-z-_]{35}$/,
      'GOOGLE_PLACES_API_KEY': /^AIza[0-9A-Za-z-_]{35}$/,
      'GOOGLE_MAPS_API_KEY': /^AIza[0-9A-Za-z-_]{35}$/
    };

    Object.entries(apiKeys).forEach(([keyName, pattern]) => {
      const value = process.env[keyName];
      if (value && !pattern.test(value)) {
        console.log(`⚠️  ${keyName} format appears invalid`);
      }
    });
  }

  displayResults(valid, missing, warnings) {
    console.log('📊 Environment Validation Results:');
    console.log('================================\n');

    if (valid.length > 0) {
      console.log('✅ Valid Configuration:');
      valid.forEach(varName => {
        const value = process.env[varName];
        const maskedValue = this.maskSensitiveValue(varName, value);
        console.log(`  ✓ ${varName}: ${maskedValue}`);
      });
      console.log('');
    }

    if (missing.length > 0) {
      console.log('❌ Missing Required Configuration:');
      missing.forEach(varName => {
        console.log(`  ✗ ${varName}: Not set or using placeholder`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  Optional Configuration (Recommended):');
      warnings.forEach(varName => {
        console.log(`  ! ${varName}: Not set (some features may be limited)`);
      });
      console.log('');
    }

    // Provide setup guidance
    if (missing.length > 0) {
      console.log('🔧 Setup Instructions:');
      console.log('=====================');
      console.log('1. Copy .env.example to .env');
      console.log('2. Replace placeholder values with your actual API keys');
      console.log('3. Restart the server');
      console.log('');
      console.log('📚 API Key Sources:');
      console.log('- Gemini AI: https://makersuite.google.com/app/apikey');
      console.log('- Google Places: https://console.cloud.google.com/apis/credentials');
      console.log('- Firebase: https://console.firebase.google.com/');
      console.log('');
    }
  }

  maskSensitiveValue(varName, value) {
    if (!value) return 'Not set';
    
    if (varName.includes('API_KEY') || varName.includes('SECRET') || varName.includes('PRIVATE_KEY')) {
      if (value.length > 10) {
        return value.substring(0, 8) + '...' + value.substring(value.length - 4);
      }
      return '***masked***';
    }
    
    return value;
  }

  // Check if environment is production-ready
  isProductionReady() {
    const prodRequiredVars = [
      ...this.requiredVars,
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ];

    const missing = prodRequiredVars.filter(varName => {
      const value = process.env[varName];
      return !value || value.includes('your_') || value.includes('_here');
    });

    return {
      ready: missing.length === 0,
      missing
    };
  }
}

export default new EnvironmentValidator();
