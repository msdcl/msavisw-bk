require('dotenv').config();
const server = require('./server');

server.start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
}); 