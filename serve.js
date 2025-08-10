import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const ROOT_DIR = path.join(__dirname, '.');

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = path.join(ROOT_DIR, parsedUrl.pathname);
    
    // Handle root path
    if (parsedUrl.pathname === '/') {
        pathname = path.join(ROOT_DIR, 'index.html');
    }
    
    // Check if file exists
    if (!fs.existsSync(pathname)) {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }
    
    // Handle directories
    if (fs.statSync(pathname).isDirectory()) {
        pathname = path.join(pathname, 'index.html');
    }
    
    // Read file from file system
    try {
        const data = fs.readFileSync(pathname);
        
        // Set content type based on file extension
        const ext = path.extname(pathname);
        let contentType = 'text/html';
        switch (ext) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
        }
        
        // Respond with file content
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});
