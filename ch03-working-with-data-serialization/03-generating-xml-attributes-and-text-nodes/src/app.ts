import * as http from 'http';

import * as xml2js from 'xml2js';

import PROFILES from './profiles_enhanced';


/**
 * server
 */
const server = http.createServer((req, res) => {
    let builder = new xml2js.Builder({ rootName: 'profiles' });
    let profiles = builder.buildObject(PROFILES);

    res.writeHead(200, { 'Content-type': 'text/xml' });
    res.end(profiles);
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
