import * as http from 'http';
import * as path from 'path';


http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('Woohoo!');
}).listen(8080);
