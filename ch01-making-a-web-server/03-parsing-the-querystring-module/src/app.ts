import * as http from 'http';
import * as url from 'url';


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
    let lookup: string = decodeURI(req.url);
    let pathname: Array<string> = lookup.split('/'); pathname.splice(0, 1);

    console.log(`[INFO] Request accesses ${lookup}`)

    // Call searchRouteAlgorithm
    let parsedUrl: url.Url = url.parse(decodeURI(req.url), true)
    let id: string = (parsedUrl.query as { id: string }).id;
    if (id) {
        routes.forEach(function(route) {
            if (route.id === id) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(typeof route.output === 'function' ? route.output() : route.output);
            }
        });
    }

    // 404 - Page Not Found
    if (!res.finished) {
        console.log(`[ERROR] Page Not Found`);
        res.writeHead(404);
        res.end('Page Not Found!');
    }
});

server.listen(8080, () => {
    console.log(`[INFO] Create http server: 127.0.0.1:8080 / localhost:8080`)
});
