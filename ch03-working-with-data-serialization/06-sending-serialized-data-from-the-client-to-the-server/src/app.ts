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
    js: string,
    xml: string,
    json: string,
    html: string,
}
const MIMES: IMimes = {
    js: "application/javascript",
    xml: 'application/xml',
    json: 'application/json',
    html: 'text/html',
};

interface IRoutes extends Object {
    [k: string]: Function,
}
const ROUTES: IRoutes = {
    // output keys of profile
    'profiles': (contentType: string) =>
        output(Object.keys(PROFILES), contentType),
    // output one of profiles
    '/profile': (contentType: string, basename: string) =>
        output(PROFILES[basename], contentType, basename),
    // For front-end page to import
    'xml2js': (contentType) => {
        if (contentType === 'js') { return clientXml2js; }
    }
};

/**
 * Hoisting function
 */
function output(content: any, contentType: string = 'json', rootNode?: string): string {
    switch (contentType) {
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
let indexHtml = fs.readFileSync('./content/add_profile_index.html');
let clientXml2js = fs.readFileSync('./xml2js.js');

/**
 * server
 */
const server = http.createServer((req, res) => {
    let dirname = path.dirname(req.url);
    let extname = path.extname(req.url);
    let basename = path.basename(req.url, extname);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    //
    extname = extname.replace('.', ''); //remove period
    res.setHeader("Content-Type", MIMES[extname] || MIMES['html']);

    /**
     * [Log variables]
     * Example:
     *   req.url: /profiles
     *   dirname: /
     *   extname:
     *   basename: profiles
     *
     * Example:
     *   req.url: /profile/ryan
     *   dirname: /profile
     *   extname:
     *   basename: ryan
     */
    console.log('=== LOG ===')
    console.log(`req.url: ${req.url}`)
    console.log(`dirname: ${dirname}`)
    console.log(`extname: ${extname}`)
    console.log(`basename: ${basename}`)

    if (req.method === 'POST') {
        addProfile(req, (result) => { res.end(result) });
        return;
    }

    // Visit method is url as '/profile/ryan'
    if (ROUTES.hasOwnProperty(dirname)) {
        res.end(ROUTES[dirname](extname, basename));
        return;
    }

    // Visit method is url as '/profiles'
    if (ROUTES.hasOwnProperty(basename)) {
        res.end(ROUTES[basename](extname));
        return;
    }

    res.end(indexHtml);

    /////////

    function addProfile(request: http.IncomingMessage, cb: (result: string) => void) {
        let pD: Buffer = Buffer.alloc(0); //post data
        request
            .on('data', (chunk: Buffer) => { chunk.copy(pD) })
            .on('end', () => {
                let contentType = request.headers['content-type'];
                switch (contentType) {
                    case MIMES['json']:
                        updateProfiles(JSON.parse(pD.toString()), 'json', cb);
                        break;
                    case MIMES['xml']:
                        xml2js.parseString(pD.toString(), {
                            explicitRoot: false,
                            explicitArray: false
                        }, (err, obj) => {
                            updateProfiles(obj, 'xml', cb);
                        });
                        break;
                }
            });
    }

    function updateProfiles(profile: Object, type: string, cb: (result: string) => void) {
        let name: string = Object.keys(profile).pop();
        PROFILES[name] = profile[name];
        cb(output(PROFILES[name], type, name));
    }

}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
