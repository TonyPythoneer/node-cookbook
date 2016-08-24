import * as http from 'http';

import * as xml2js from 'xml2js';

import PROFILES from './profiles';
import PROFILES_ENHANCED from './profiles_enhanced';


/**
 * server
 */
const server = http.createServer((req, res) => {
    let builder = new xml2js.Builder({ rootName: 'profiles' });
    let profiles = {
        normal: builder.buildObject(PROFILES),
        enhanced: builder.buildObject(PROFILES_ENHANCED)
    };

    let parseString = apply({
        explicitArray: false,
        explicitRoot: false
    }, xml2js.parseString);

    parseString(profiles.normal, console.log);
    parseString(profiles.enhanced, console.log);

    //////////

    function apply(options, fn) {
        return (xml, cb) => fn(xml, options, cb)
    }

}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});
