import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';

import * as Promise from 'bluebird';


/**
 * const
 */
interface IRoute {
    id: string,
    route: string,
    output?: string | (() => string),
}
const routes: Array<IRoute> = [
    { id: '1', route: '', output: 'Woohoo!' },
    { id: '2', route: 'about', output: 'A simple routing with Nodeexample' },
    {
        id: '3', route: 'another page', output: function() {
            return 'Here\'s ' + this.route;
        }
    },
];


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
        timestamp: number,
    }
}
const cache: ICache = {};
function cacheAndDeliver(f: string,
                         cb: (err:NodeJS.ErrnoException, data: Buffer) => void) {
    fs.stat(f, (err, stats: fs.Stats) => {
        //
        if (err) { return console.log('Oh no!, Eror', err); }

        // Local variables
        let lastChanged: number = Date.parse(stats.ctime.toString())
        let isUpdated: boolean = (cache[f]) && lastChanged > cache[f].timestamp;

        // Check the file need to update or not
        if (!cache[f] || isUpdated) {
            fs.readFile(f, (err, data) => {
                console.log('loading ' + f + ' from file');
                cache[f] = { content: data, timestamp: Date.now() };
                cb(err, data);
                return;
            });
        }

        // Loading from cache
        console.log(`loading ${f} from cache`);
        cb(null, cache[f].content);
    });
}
function cacheAndDeliverWithPromise(f: string,
                                    cb: (err: NodeJS.ErrnoException, data: Buffer) => void) {
    // Wrap fs.stat in Promise
    let stat = Promise.promisify(fs.stat);
    stat(f).then((stats: fs.Stats) => {
        let lastChanged: number = Date.parse(stats.ctime.toString())
        let isUpdated: boolean = (cache[f]) && lastChanged > cache[f].timestamp;

        // Check the file is existent/updated or not
        if (!cache[f] || isUpdated) {
            // Wrap fs.readFile in Promise
            let readFile = Promise.promisify(fs.readFile);
            readFile(f).then((data) => {
                console.log('loading ' + f + ' from file');
                cache[f] = { content: data, timestamp: Date.now() };
                cb(null, data);
            }).catch((err) => {
                cb(err, null);
            })
            return;
        }

        // Loading from cache
        console.log(`loading ${f} from cache`);
        cb(null, cache[f].content);
    }).catch((err) => {
        return console.log('Oh no!, Eror', err);
    });
}


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // fs.exists had deprecated. Please use fs.stat() or fs.access()
    fs.access(filePath, (err: NodeJS.ErrnoException) => {

        // Check file
        console.log(err ? `${filePath} doesn't exist` : `${filePath} is there`);

        // Response with 404
        if (Boolean(err)) {
            res.writeHead(404);
            res.end('Page not Found!');
            return;
        }

        // Read file when existed
        cacheAndDeliver(filePath, (err: NodeJS.ErrnoException, data: Buffer) => {
            // Content not found
            if (err) { res.writeHead(500); res.end('ServerError!'); return; }

            // Content can be found
            let headers = { 'Content-type': mimeTypes[path.extname(lookup)] };
            res.writeHead(200, headers);
            res.end(data);
        });
    });
}).listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});


interface IPromiseError extends NodeJS.ErrnoException {
    cause: NodeJS.ErrnoException,
}
const serverWithPromise = http.createServer((req: http.IncomingMessage,
    res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // Wrap fs.access in Promise
    let access = Promise.promisify(fs.access)
    access(filePath).then(() => {
        // -- SUCESSFUL --
        // the path is valid
        console.log(`Exist!`);

        // Wrap cacheAndDeliverWithPromise in Promise
        let cacheFunc = Promise.promisify(cacheAndDeliverWithPromise);
        cacheFunc(filePath).then((data: Buffer) => {
            // -- SUCESSFUL --
            // Content can be found
            let headers = { 'Content-type': mimeTypes[path.extname(lookup)] };
            res.writeHead(200, headers);
            res.end(data);
        }).catch((err) => {
            // -- FAIL --
            // Content not found
            res.writeHead(500); res.end('ServerError!'); return;
        })
    }).catch((err: IPromiseError) => {
        // -- FAIL --
        // Log invalid path
        console.log(`${filePath} doesn't exist`);

        // Response with 404
        res.writeHead(404);
        res.end('Page not Found!');
    })
}).listen(8081, () => {
    console.log(`[INFO] Create http server with promise version: 127.0.0.1:8081 / localhost:8081`)
});
