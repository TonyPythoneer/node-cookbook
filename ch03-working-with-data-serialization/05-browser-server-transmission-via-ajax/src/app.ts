import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import * as xml2js from 'xml2js';

import PROFILES from './profiles';
import PROFILES_ENHANCED from './profiles_enhanced';

/**
 * constants
 */
interface IMimes {
    xml: string,
    json: string,
}
const MIMES: IMimes = { xml: "application/xml", json: "application/json" };

interface IRoutes extends Object {
    [key: string] : Function
}
const ROUTES: IRoutes = {
    'profiles': (format: string) => output(Object.keys(PROFILES), format),
    '/profile': (format: string, basename: string) => output(PROFILES[basename], format, basename),
};

/**
 * Hoisting function
 */
function output(content: any, format: string = 'json', rootNode?: string): string {
    switch (format) {
        case 'json':
            return JSON.stringify(content);
        case 'xml':
            let builder = new xml2js.Builder({ rootName: rootNode });
            return builder.buildObject(content);
    }
}

/**
 * Local variables
 */
let indexHtml = fs.readFileSync('./content/index.html');

/**
 * server
 */
const server = http.createServer((req, res) => {
    let dirname = path.dirname(req.url);
    let extname = path.extname(req.url);
    let basename = path.basename(req.url, extname);

    extname = extname.replace('.', ''); //remove period
    res.setHeader("Content-Type", MIMES[extname] || 'text/html');
    console.log(dirname)
    console.log(basename)
    if (ROUTES.hasOwnProperty(dirname)) {
        console.log(ROUTES[dirname](extname, basename));
        res.end(ROUTES[dirname](extname, basename));
        return;
    }
    if (ROUTES.hasOwnProperty(basename)) {
        console.log(ROUTES[basename](extname));
        res.end(ROUTES[basename](extname));
        return;
    }

    console.log(indexHtml)
    res.end(indexHtml);
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
