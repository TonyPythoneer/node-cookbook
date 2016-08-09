import * as http from 'http';
import * as path from 'path';


/**
 * type
 */
interface IPage {
    route: string,
    output: string | (() => string),
}


/**
 * const
 */
const pages: Array<IPage> = [
    { route: '/', output: 'Woohoo!' },
    { route: '/about/this', output: 'Multilevel routing with Node' },
    { route: '/about/node', output: 'Evented I/O for V8 JavaScript.' },
    { route: '/another page', output: function() { return `Here\'s ${this.route}` } },
];


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    let lookup: string = decodeURI(req.url);
    console.log(`[INFO] Request accesses ${lookup}`)
    pages.forEach((page: IPage) => {
        if (page.route === lookup) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(typeof page.output === 'function' ? page.output() : page.output);
        }
    });
    if (!res.finished) {
        console.log(`[ERROR] Page Not Found`);
        res.writeHead(404);
        res.end('Page Not Found!');
    }
});

server.listen(8080, () => {
    console.log(`[INFO] Create http server with 8080 port`)
});
