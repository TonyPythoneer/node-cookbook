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
    [key: string] : {
        content: Buffer,
    }
}
const cache: ICache = {};
function f(f: string){

}


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // return cache
    if (cache[filePath]) {
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
            let bufferOffset = 0;
            cache[filePath] = { content: Buffer.alloc(stats.size) };  // Deprecated: new Buffer

            readStream.on('data', function(chunk: Buffer) {
                chunk.copy(cache[filePath].content, bufferOffset);
                bufferOffset += chunk.length;
            });
        });
    });
}).listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
