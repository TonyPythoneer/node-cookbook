import * as http from 'http';
import * as querystring from 'querystring';
import * as util from 'util';
import * as fs from 'fs';

/**
 *  const
 */
const form = fs.readFileSync('content/form.html');
const maxData = 2 *1024 * 1024; //2mb

/**
 * server
 */
const server = http.createServer((req, res) => {
    switch (req.method) {
        case "GET":
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(form);
            break;
        case "POST":
            let postData: Buffer = Buffer.from('');
            req.on('data', (chunk: Buffer) => {
                postData = Buffer.concat([postData, chunk]);
                if (postData.length > maxData) {
                    postData = Buffer.from('');
                    res.writeHead(413); // Request Entity Too Large
                    res.end('Too large');
                    req.destroy(new Error('Too large'));
                }
            }).on('end', () => {
                if (!postData.length) { res.end(); return; }
                let postDataObject = querystring.parse(postData.toString());
                console.log(`User Posted:\n ${postData}`);
                res.end(`You Posted:\n ${util.inspect(postDataObject)}`);
            });
            break;
    }
}).listen(8080);

server.on('clientError', (err, socket) => {
    if (err) console.log(err.toString()); // Catch the exception of req.destroy
});

