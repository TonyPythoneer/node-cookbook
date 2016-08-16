import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';

import * as Promise from 'bluebird';


/**
 * const
 */
interface IMimeTypes {
    ".js": string,
    ".html": string,
    ".css": string,
}
const mimeTypes: IMimeTypes = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
};


/**
 * cache
 */
interface ICache {
    store: {
        [k: string]: {
            content: Buffer,
            timestamp: number,
        },
    },
    maxSize: number,
    maxAge: number,
    cleanAfter: number,
    nextCleanedAt: number,
    clean: (now: number) => void,
}
const cache: ICache = {
    store: {},
    maxSize: 26214400, // (bytes) 25mb
    maxAge: 5400 * 1000, // (ms) 1 and a half hours
    cleanAfter: 7200 * 1000, // (ms) two hours
    nextCleanedAt: 0,
    clean(now) {
        let enableToClean = now > this.nextCleanedAt;
        if (enableToClean) {
            this.nextCleanedAt = this.cleanAfter + this.cleanedAt;
            Object.keys(this.store).forEach((file) => {
                let isExpired = now > this.store[file].timestamp + this.maxAge;
                if (isExpired) { delete this.store[file]; }
            });
        }
    }
}


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // clean cache
    cache.clean(Date.now());

    // return cache
    if (cache[filePath]) {
        cache.clean(Date.now());
        let headers = { 'Content-type': mimeTypes[path.extname(lookup)] };
        res.writeHead(200, headers);
        res.end(cache[filePath].content)
        return;
    }

    // fs.exists had deprecated. Please use fs.stat() or fs.access()
    fs.access(filePath, (err: NodeJS.ErrnoException) => {
        // Response with 404
        if (err) { res.writeHead(404); res.end('Page not Found!'); return; }

        // Create read stream and build listeners
        let readStream = fs.createReadStream(filePath)
        readStream.once('open', () => {
            let headers = { 'Content-type': mimeTypes[path.extname(lookup)] };
            res.writeHead(200, headers);
            readStream.pipe(res);
        }).once('error', (err) => {
            console.log(err);
            res.writeHead(500);
            res.end('Server Error!');
        });

        // Store the file buffer in cache
        fs.stat(filePath, (err, stats) => {
            if (stats.size < cache.maxSize) {
                let bufferOffset = 0;
                cache.store[filePath] = {
                    content: Buffer.alloc(stats.size),
                    timestamp: Date.now(),
                };

                readStream.on('data', (chunk: Buffer) => {
                    chunk.copy(cache.store[filePath].content, bufferOffset);
                    bufferOffset += chunk.length;
                });
            }
        });

    });
}).listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
