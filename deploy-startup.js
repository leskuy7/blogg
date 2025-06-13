require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log("Minimal deploy-startup.js is starting...");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${PORT}`);

// Basic health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check received.');
    res.status(200).json({ status: 'ok', message: 'Service is alive' });
});

// Basic root endpoint
app.get('/', (req, res) => {
    res.send('Hello from Blog App!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Keep the process alive indefinitely
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received, shutting down gracefully.');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
