import * as http from 'http';
import * as fs from 'fs';

import * as formidable from 'formidable';

/**
 *  const
 */
const form = fs.readFileSync('content/form.html');
const maxData = 2 * 1024 * 1024; //2mb
const uploadDir = 'uploads';

/**
 * server
 */
const server = http.createServer((req, res) => {
    // create the dir if unexisted
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // Process request
    switch (req.method) {
        case "GET":
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(form);
            break;
        case "POST":
            let incoming = new formidable.IncomingForm();
            incoming.uploadDir = uploadDir;

            // event listener
            incoming.on('file', (field, file) => {
                if (!file.size) { return; }
                res.write(`${file.name} received\n`);
            }).on('field', (field, value) => {
                // unreacted: the module is long time to mantain
                res.write(`${field} : ${value} \n`);
            }).on('end', () => {
                res.end('All files received');
            });

            // parse request
            incoming.parse(req);
            break;
        case "PUT":
            let contentLength = Number(req.headers['content-length']);
            let fileData = Buffer.alloc(contentLength);
            let bufferOffset = 0;
            req.on('data', (chunk) => {
                chunk.copy(fileData, bufferOffset);
                bufferOffset += chunk.length;
            }).on('end', () => {
                let rand = (Math.random() * Math.random())
                    .toString(16).replace('.', '');
                let to = `${uploadDir}/${rand}-${req.headers['x-uploadedfilename']}`;
                fs.writeFile(to, fileData, (err) => {
                    if (err) { throw err; }
                    console.log('Saved file to ' + to);
                    res.end();
                });
            });
    }
}).listen(8080);
