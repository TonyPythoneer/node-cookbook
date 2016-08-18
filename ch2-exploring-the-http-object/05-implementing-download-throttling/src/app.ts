import * as http from 'http';
import * as fs from 'fs';

/**
 * constants
 */
interface IOptions {
    file: string,
    fileSize: number,
    kbps: number,
}
interface IDownload extends IOptions {
    chunks: Buffer,
    bufferOffset: number,
    aborted: boolean,
}
const file = '50meg';
const options: IOptions = {
    file,
    fileSize: fs.statSync(file).size,
    kbps: 32, // download spead
}

/**
 * throttle
 */
function throttle(download: IDownload, cb: (chunk: Buffer) => void) {
    let chunkOutSize = download.kbps * 1024;
    let timer = 0;

    /**
     * process image:
     *
     *     This is total chunks of download:
     *
     *     |---|---|---|
     *
     *     Specify this slice, refer to 'download.chunks.slice'
     *
     *     |---|---|---|
     *      ^^^
     *
     *     After sending the chunk, it enters next loop until finished
     *
     *     |+++|---|---|
     *          ^^^
     *
     *     After sending last chunk, it won't enter loop
     *
     *     |+++|+++|---|
     *              ^^^
     *
     *     Set 'false' to download.aborted, it means finish
     *
     *     |+++|+++|+++|
     */
    (function loop(bytesSent: number) {
        let remainingOffset;

        // Check the download is finished or not
        if (!download.aborted) {
            /**
             * it's invoked instantly for first time,
             * next time set to 1-second period
             */
            setTimeout(() => {
                // Record current sent bytes from now
                let bytesOut = bytesSent + chunkOutSize;

                // First send chunk and set timer
                if (download.bufferOffset > bytesOut) {
                    timer = 1000;
                    cb(download.chunks.slice(bytesSent, bytesOut));
                    loop(bytesOut);
                    return;
                }

                // Send last chunk
                if (bytesOut >= download.chunks.length) {
                    remainingOffset = download.chunks.length - bytesSent;
                    cb(download.chunks.slice(remainingOffset, bytesSent));
                    return;
                }
                loop(bytesSent); //continue to loop, wait for enough data
            }, timer);
        }
    } (0));
    return function() { //return function to handle abort scenario
        download.aborted = true;
    };
}



/**
 * http server
 */
http.createServer((request, response) => {
    // Create download object
    let download: IDownload = Object.create(options);
    download.chunks = Buffer.alloc(options.fileSize);
    download.bufferOffset = 0;
    download.aborted = false;

    // Write Content-Length in headers
    response.writeHead(200, { 'Content-Length': options.fileSize });

    // Read data
    fs.createReadStream(options.file)
        .on('data', (chunk) => {
            // Store the file data in memory
            chunk.copy(download.chunks, download.bufferOffset);
            download.bufferOffset += chunk.length;
        })
        .once('open', () => {
            // start to throttle
            var handleAbort = throttle(download, (chunk: Buffer) => {
                response.write(chunk);
            });
            request.on('close', () => {
                handleAbort();
            });
        });

}).listen(8080);
