/**
 * This is a simple crawler but it can't access website with https
 */
import * as http from 'http';
import * as url from 'url';

function fetch(){
    // url options
    let urlOpts: Object | url.Url = {
        host: 'stackoverflow.com',
        path: '/',
        port: '80'
    };

    // Complete url when inputting command argument
    if (process.argv[2]) {
        if (!process.argv[2].match('http://')) {
            process.argv[2] = 'http://' + process.argv[2];
        }
        urlOpts = url.parse(process.argv[2]);
    }

    // Start to crawl
    http.get(urlOpts, (res) => {
        res.on('data', (chunk: Buffer) => {
            console.log(chunk.toString());
        }).on('error', (e: Error) => {
            console.log('error:' + e.message);
        });
    });
}
fetch()
