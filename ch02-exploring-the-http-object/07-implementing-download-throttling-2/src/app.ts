import * as http from 'http';
import * as fs from 'fs';
import * as util from 'util';

/**
 * Constants
 */
const FILE = '50meg'
const KILOBYTE = 1024;

/**
 * Classes
 */
class Options{
    public file: string = FILE;
    public fileSize: number = fs.statSync(FILE).size;
    public kbps: number = 32 * KILOBYTE;  // test: 20 * 1024 * KILOBYTE
}

class DownloadOpts extends Options {
    public chunks: Buffer;
    public bufferOffset: number = 0;
    public currentSentOffset: number = 0;
    constructor() {
        super();
        this.chunks = Buffer.alloc(this.fileSize);
    }
    isReadyToSend(bytesOut: number): boolean {
        return this.bufferOffset > bytesOut;
    }
    isLastChunk(bytesOut: number): boolean {
        return bytesOut >= this.chunks.length;
    }
    getFileSlice(start?: number, end?: number): Buffer {
        return this.chunks.slice(start, end)
    }
}

/**
 * throttle
 */
function throttle(opts: DownloadOpts, sendChunk: (chunk: Buffer, isLast: boolean) => void) {
    (function loopSendChunk(bytesSent: number, timer: number = 1000) {
        setTimeout(() => {
            // Record current sent bytes from now
            let bytesOut = bytesSent + opts.kbps;

            // First send chunk and set timer
            if (opts.isReadyToSend(bytesOut)) {
                sendChunk(opts.getFileSlice(bytesSent, bytesOut), false);
                loopSendChunk(bytesOut);
                return;
            }
            // Send last chunk
            if (opts.isLastChunk(bytesOut)) {
                let remainingOffset = opts.chunks.length - bytesSent;
                sendChunk(opts.getFileSlice(remainingOffset), true);
                return;
            }

            // Read buffer not enough for network, so keept the current status
            loopSendChunk(bytesSent);
        }, timer);
    } (0, 0));
}

/**
 * http server
 */
http.createServer((req, res) => {
    // Create downloadOpts object
    let opts = new DownloadOpts();

    // Write Content-Length in headers
    res.writeHead(200, { 'Content-Length': opts.fileSize });

    // Read data with emitter
    fs.createReadStream(opts.file)
        .on('data', onRecordingBufferOffset)
        .once('open', onThrottlingDownload);

    /////////////////

    function onRecordingBufferOffset(chunk: Buffer) {
        // Store the file data in memory
        chunk.copy(opts.chunks, opts.bufferOffset);
        opts.bufferOffset += chunk.length;
    }

    function onThrottlingDownload() {
        // start to throttle
        throttle(opts, function sendChunk(chunk: Buffer, isLast: boolean) {
            (isLast) ? res.end(chunk) : res.write(chunk);
        });
    }

}).listen(8080);
