import * as http from 'http';

import PROFILES from './profiles';


/**
 * server
 */
const server = http.createServer((req, res) => {
    let profiles = JSON.stringify(PROFILES).replace(/name/g, 'fullname');
    profiles = JSON.parse(profiles);
    profiles['felix'].fullname = "Felix Geisendörfer";
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(profiles));
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
