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
 * server
 */
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

        // Wrap fs.readFile in Promise
        let readFile = Promise.promisify(fs.readFile);
        readFile(filePath).then((data: Buffer) => {
            // -- SUCESSFUL --
            // Response with buffer
            let headers = { 'Content-type': mimeTypes[path.extname(lookup)] };
            res.writeHead(200, headers);
            res.end(data);
        }).catch((err: IPromiseError) => {
            // -- FAIL --
            // Response with 500
            res.writeHead(500);
            res.end('ServerError!');
        });
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



const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // fs.exists had deprecated. Please use fs.stat() or fs.access()
    fs.access(filePath, (err: NodeJS.ErrnoException) => {

        // Check file
        console.log(err ? `${filePath} doesn't exist` : `${filePath} is there`);

        // Response with 404
        if (Boolean(err)){
            res.writeHead(404);
            res.end('Page not Found!');
            return;
        }

        // Read file when existed
        fs.readFile(filePath, (err: NodeJS.ErrnoException, data: Buffer) => {
            // Content not found
            if (err) { res.writeHead(500); res.end('ServerError!'); return; }

            // Content can be found
            let headers = {
                'Content-type': mimeTypes[path.extname(lookup)]
            };
            res.writeHead(200, headers);
            res.end(data);
        });
    });
}).listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
