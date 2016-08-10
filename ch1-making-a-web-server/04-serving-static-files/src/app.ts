import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';


/**
 * type
 */
interface IRoute {
    id: string,
    route: string,
    output?: string | (() => string),
}


/**
 * const
 */
const routes: Array<IRoute> = [
    { id: '1', route: '', output: 'Woohoo!' },
    { id: '2', route: 'about', output: 'A simple routing with Nodeexample' },
    {
        id: '3', route: 'another page', output: function() {
            return 'Here\'s ' + this.route;
        }
    },
];


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup = path.basename(decodeURI(req.url)) || 'index.html';
    let filePath = `${__dirname}/../content/${lookup}`

    // fs.exists had deprecated. Please use fs.stat() or fs.access()
    fs.access(filePath, fs.R_OK, (err: NodeJS.ErrnoException) => {
        console.log(err ? `${filePath} doesn't exist` : `${filePath} is there`);
    })
});

server.listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
