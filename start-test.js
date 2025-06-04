const { spawn } = require('child_process');

console.log('🚀 Starting blog application...\n');

const app = spawn('node', ['index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

app.on('error', (err) => {
    console.error('❌ Failed to start application:', err.message);
});

app.on('close', (code) => {
    console.log(`\n📝 Application exited with code ${code}`);
});

// Keep the process running for a few seconds to see startup logs
setTimeout(() => {
    console.log('\n✅ Application startup test completed');
    app.kill();
    process.exit(0);
}, 5000);
