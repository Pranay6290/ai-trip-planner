#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Trip Planner - Project Health Check');
console.log('=========================================\n');

const projectRoot = __dirname;
const frontendDir = path.join(projectRoot, 'frontend');
const backendDir = path.join(projectRoot, 'backend');

let issues = [];
let warnings = [];

// Check if directories exist
function checkDirectories() {
    console.log('📁 Checking project structure...');
    
    if (!fs.existsSync(frontendDir)) {
        issues.push('Frontend directory missing');
        return false;
    }
    
    if (!fs.existsSync(backendDir)) {
        issues.push('Backend directory missing');
        return false;
    }
    
    console.log('✅ Project directories found');
    return true;
}

// Check package.json files
function checkPackageFiles() {
    console.log('📦 Checking package.json files...');
    
    const frontendPackage = path.join(frontendDir, 'package.json');
    const backendPackage = path.join(backendDir, 'package.json');
    
    if (!fs.existsSync(frontendPackage)) {
        issues.push('Frontend package.json missing');
    } else {
        console.log('✅ Frontend package.json found');
    }
    
    if (!fs.existsSync(backendPackage)) {
        issues.push('Backend package.json missing');
    } else {
        console.log('✅ Backend package.json found');
    }
}

// Check node_modules
function checkNodeModules() {
    console.log('📚 Checking node_modules...');
    
    const frontendNodeModules = path.join(frontendDir, 'node_modules');
    const backendNodeModules = path.join(backendDir, 'node_modules');
    
    if (!fs.existsSync(frontendNodeModules)) {
        warnings.push('Frontend node_modules missing - run "npm install" in frontend directory');
    } else {
        console.log('✅ Frontend node_modules found');
    }
    
    if (!fs.existsSync(backendNodeModules)) {
        warnings.push('Backend node_modules missing - run "npm install" in backend directory');
    } else {
        console.log('✅ Backend node_modules found');
    }
}

// Check environment files
function checkEnvironmentFiles() {
    console.log('🔐 Checking environment files...');
    
    const frontendEnv = path.join(frontendDir, '.env');
    const backendEnv = path.join(backendDir, '.env');
    
    if (!fs.existsSync(frontendEnv)) {
        issues.push('Frontend .env file missing');
    } else {
        console.log('✅ Frontend .env found');
        
        // Check for placeholder values
        const envContent = fs.readFileSync(frontendEnv, 'utf8');
        if (envContent.includes('your_weather_api_key_here') || envContent.includes('demo_key_replace_with_real_key')) {
            warnings.push('Weather API key needs to be replaced with real key');
        }
    }
    
    if (!fs.existsSync(backendEnv)) {
        issues.push('Backend .env file missing');
    } else {
        console.log('✅ Backend .env found');
    }
}

// Check critical files
function checkCriticalFiles() {
    console.log('📄 Checking critical files...');
    
    const criticalFiles = [
        'frontend/src/main.jsx',
        'frontend/src/App.jsx',
        'frontend/index.html',
        'frontend/vite.config.js',
        'backend/server.js',
        'frontend/src/components/enhanced/EnhancedTripPlanner.jsx'
    ];
    
    criticalFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (!fs.existsSync(filePath)) {
            issues.push(`Critical file missing: ${file}`);
        } else {
            console.log(`✅ ${file} found`);
        }
    });
}

// Check for common issues
function checkCommonIssues() {
    console.log('🔍 Checking for common issues...');
    
    // Check if ports might be in use
    console.log('ℹ️  Default ports: Frontend (5173), Backend (5000)');
    
    // Check Node.js version
    try {
        const nodeVersion = process.version;
        console.log(`✅ Node.js version: ${nodeVersion}`);
        
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 16) {
            warnings.push(`Node.js version ${nodeVersion} is old. Recommended: v16 or higher`);
        }
    } catch (error) {
        issues.push('Could not determine Node.js version');
    }
}

// Main health check
function runHealthCheck() {
    console.log('🏥 Running comprehensive health check...\n');
    
    checkDirectories();
    checkPackageFiles();
    checkNodeModules();
    checkEnvironmentFiles();
    checkCriticalFiles();
    checkCommonIssues();
    
    console.log('\n📊 HEALTH CHECK RESULTS:');
    console.log('========================\n');
    
    if (issues.length === 0) {
        console.log('🎉 NO CRITICAL ISSUES FOUND!');
    } else {
        console.log('❌ CRITICAL ISSUES:');
        issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (warnings.length === 0) {
        console.log('✅ NO WARNINGS');
    } else {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n🚀 MANUAL STARTUP INSTRUCTIONS:');
    console.log('===============================');
    console.log('1. Open TWO PowerShell windows');
    console.log('2. In first window: cd backend && npm run dev');
    console.log('3. In second window: cd frontend && npm run dev');
    console.log('4. Open browser: http://localhost:5173');
    console.log('\n✨ The AI Trip Planner should now be running!');
}

// Run the health check
runHealthCheck();
