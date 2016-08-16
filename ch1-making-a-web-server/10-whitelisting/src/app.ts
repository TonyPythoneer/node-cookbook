import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';


/**
 * consts
 */
const whitelist = [
    '/index.html',
    '/styles.css',
    '/script.js'
];

/**
 * server
 */
const server = http.createServer((req, res) => {
    // Local variables
    let lookup = url.parse(decodeURI(req.url)).pathname;
    lookup = path.normalize(lookup);
    lookup = (lookup === "/") ? '/index.html' : lookup;

    // Check whitelist
    if (whitelist.indexOf(lookup) === -1) {
        res.writeHead(404);
        res.end('Page Not Found!');
        return;
    }

    // Read file
    let f = 'content' + lookup;
    fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(500); res.end('Server Error!'); return; }
        res.end(data);
    });
}).listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
