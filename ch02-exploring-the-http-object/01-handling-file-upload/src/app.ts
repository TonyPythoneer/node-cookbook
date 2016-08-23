import * as http from 'http';
import * as fs from 'fs';

import * as formidable from 'formidable';



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
            let incoming = new formidable.IncomingForm();
            incoming.uploadDir = 'uploads';

            // create the dir if unexisted
            if (!fs.existsSync(incoming.uploadDir)) fs.mkdirSync(incoming.uploadDir);

            // event listener
            incoming.on('file', (field, file) => {
                if (!file.size) { return; }
                res.write(`${file.name} received\n`);
            }).on('end', () => {
                res.end('All files received');
            });
            incoming.parse(req);
            break;
    }
}).listen(8080);
