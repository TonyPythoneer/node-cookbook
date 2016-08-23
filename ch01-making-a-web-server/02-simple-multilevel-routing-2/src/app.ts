import * as http from 'http';
import * as path from 'path';


/**
 * type
 */
interface IRoute {
    route: string,
    output?: string | (() => string),
    childRoutes?: Array<IRoute>,
}


/**
 * const
 */
const routes: Array<IRoute> = [
    { route: '', output: 'Woohoo!' },
    {
        route: 'about', childRoutes: [
            { route: 'node', output: 'Evented I/O for V8 Javascript' },
            { route: 'this', output: 'Complex Multilevel Example' }
        ]
    },
    { route: 'another page', output: function() { return `Here\'s ${this.route}` } },
];


/**
 * functions
 */
function searchRouteAlgorithm(pathname: Array<string>, routes: Array<IRoute>, res: http.ServerResponse) {
    (function searchRoute(pathname: Array<string>, routes: Array<IRoute>, pathnameLength:number = pathname.length) {
        // local variables
        let targetPath: string = pathname.shift();

        // Start to search routes
        for (let route of routes) {
            if (route.route === targetPath) {
                // Stop to find router
                if (pathname.length === 0) {
                    let headers = { 'Content-Type': 'text/html' };
                    let resData = typeof route.output === 'function'
                        ? route.output()
                        : route.output;

                    res.writeHead(200, headers);
                    res.end(resData);
                    break;
                }

                // Continue to find child router
                searchRoute(pathname, route.childRoutes, pathnameLength - 1)
            }
        }
    })(pathname, routes, pathname.length)
}


/**
 * server
 */
const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Local variables
    let lookup: string = decodeURI(req.url);
    let pathname: Array<string> = lookup.split('/'); pathname.splice(0, 1);

    console.log(`[INFO] Request accesses ${lookup}`)

    // Call searchRouteAlgorithm
    searchRouteAlgorithm(pathname, routes, res)

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
