import * as http from 'http';
import * as url from 'url';

import PROFILES from './profiles';


/**
 * Interface
 */
interface IQuery {
    callback: string,
    who: string,
}

/**
 * server
 */
const server = http.createServer((req, res) => {
    let query: IQuery = url.parse(req.url, true).query;
    let {callback, who} = query;
    if (callback && who) {
        let profile = `${callback}(${JSON.stringify(PROFILES[who])})`;
        console.log(profile)
        res.end(profile);
    }
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
