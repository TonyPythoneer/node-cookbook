import * as http from 'http';

import * as xml2js from 'xml2js';

import PROFILES from './profiles';


/**
 * server
 */
const server = http.createServer((req, res) => {
    let builder = new xml2js.Builder({ rootName: 'profiles' });
    let profiles = builder.buildObject(PROFILES);

    xml2js.parseString(profiles, {
        explicitArray: false,
        explicitRoot: false
    }, (err, obj) => {
        profiles = obj;
        profiles['felix'].fullname = "Felix Geisendörfer";
        console.log(profiles['felix']);
    });
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
