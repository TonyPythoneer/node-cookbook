import * as fs from 'fs';

import * as Promise from 'bluebird';

interface IFileSystemPromise {
    readdirAsync: (path: string) => Promise<string[]>,
    statAsync: (path: string) => Promise<fs.Stats>,
    readFileAsync: (filename: string) => Promise<Buffer>,
    writeFileAsync: (filename: string, data: any) => Promise<Buffer>,
}

const fsp = Promise.promisifyAll(fs) as IFileSystemPromise;
export default fsp;
