import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve character assets
app.use('/assets/characters', express.static(path.join(__dirname, 'assets/characters')));

// Serve map assets
app.use('/assets/maps', express.static(path.join(__dirname, 'assets/maps')));

// Serve Purgatory-GitHub directory
app.use('/Purgatory-GitHub', express.static(path.join(__dirname, 'Purgatory-GitHub')));

// Serve src directory for module scripts
app.use('/src', express.static(path.join(__dirname, 'src'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Function to find an available port
async function findAvailablePort(startPort) {
    const net = await import('net');
    return new Promise((resolve, reject) => {
        function testPort(port) {
            const server = net.createServer();
            server.once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    testPort(port + 1);
                } else {
                    reject(err);
                }
            });
            
            server.once('listening', () => {
                server.close(() => resolve(port));
            });
            
            server.listen(port);
        }
        
        testPort(startPort);
    });
}

// Start the server
(async () => {
    try {
        const port = await findAvailablePort(3000);
        app.listen(port, () => {
            console.log(`Office Purgatory Simulator running at http://localhost:${port}`);
            console.log('Press Ctrl+C to stop the server');
        });
    } catch (err) {
        console.error('Could not start server:', err);
    }
})();
