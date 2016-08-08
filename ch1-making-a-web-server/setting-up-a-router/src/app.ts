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
    { route: '', output: 'Woohoo!' },
    { route: 'about', output: 'A simple routing with Node example' },
    { route: 'another page', output: function() { return `Here\'s ${this.route}` } },
];


/**
 * server
 */
http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    let lookup: string = path.basename(decodeURI(req.url));
    pages.forEach((page: IPage) => {
        if (page.route === lookup) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(typeof page.output === 'function' ? page.output() : page.output);
        }
    });
    if (!res.finished) {
        res.writeHead(404);
        res.end('Page Not Found!');
    }
}).listen(8080);
