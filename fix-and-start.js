#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 AI Trip Planner - Fix and Start Script');
console.log('==========================================\n');

const projectRoot = __dirname;
const frontendDir = path.join(projectRoot, 'frontend');
const backendDir = path.join(projectRoot, 'backend');

// Check if directories exist
if (!fs.existsSync(frontendDir)) {
    console.error('❌ Frontend directory not found!');
    process.exit(1);
}

if (!fs.existsSync(backendDir)) {
    console.error('❌ Backend directory not found!');
    process.exit(1);
}

console.log('✅ Project directories found');
console.log(`📁 Frontend: ${frontendDir}`);
console.log(`📁 Backend: ${backendDir}\n`);

// Function to run command and return promise
function runCommand(command, cwd, description) {
    return new Promise((resolve, reject) => {
        console.log(`🔧 ${description}...`);
        
        const child = spawn(command, { 
            shell: true, 
            cwd: cwd,
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} completed successfully\n`);
                resolve();
            } else {
                console.error(`❌ ${description} failed with code ${code}\n`);
                reject(new Error(`Command failed: ${command}`));
            }
        });
        
        child.on('error', (error) => {
            console.error(`❌ Error running ${description}: ${error.message}\n`);
            reject(error);
        });
    });
}

// Function to start server in background
function startServer(command, cwd, description) {
    console.log(`🚀 Starting ${description}...`);
    
    const child = spawn(command, { 
        shell: true, 
        cwd: cwd,
        stdio: 'pipe',
        detached: true
    });
    
    child.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('localhost') || output.includes('ready')) {
            console.log(`✅ ${description} is ready!`);
            console.log(`📱 ${output.trim()}\n`);
        }
    });
    
    child.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warning') && !error.includes('deprecated')) {
            console.error(`⚠️  ${description} error: ${error.trim()}`);
        }
    });
    
    return child;
}

async function main() {
    try {
        // Check if node_modules exist and install if needed
        const frontendNodeModules = path.join(frontendDir, 'node_modules');
        const backendNodeModules = path.join(backendDir, 'node_modules');
        
        if (!fs.existsSync(frontendNodeModules)) {
            await runCommand('npm install', frontendDir, 'Installing frontend dependencies');
        } else {
            console.log('✅ Frontend dependencies already installed\n');
        }
        
        if (!fs.existsSync(backendNodeModules)) {
            await runCommand('npm install', backendDir, 'Installing backend dependencies');
        } else {
            console.log('✅ Backend dependencies already installed\n');
        }
        
        console.log('🎯 Starting servers...\n');
        
        // Start backend server
        const backendProcess = startServer('npm run dev', backendDir, 'Backend server');
        
        // Wait a moment for backend to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Start frontend server
        const frontendProcess = startServer('npm run dev', frontendDir, 'Frontend development server');
        
        // Wait a moment for frontend to start
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🎉 Both servers are starting!');
        console.log('📱 Frontend: http://localhost:5173');
        console.log('🔧 Backend: http://localhost:5000\n');
        
        // Open browser
        console.log('🌐 Opening browser...');
        const openCommand = process.platform === 'win32' ? 'start' : 
                           process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${openCommand} http://localhost:5173`);
        
        console.log('\n✨ AI Trip Planner is ready!');
        console.log('Press Ctrl+C to stop the servers');
        
        // Keep the script running
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping servers...');
            backendProcess.kill();
            frontendProcess.kill();
            process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {}, 1000);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
