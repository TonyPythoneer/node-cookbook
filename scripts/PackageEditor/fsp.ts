import * as fs from 'fs';

import * as Promise from 'bluebird';


interface IFileSystemPromise {
    readdirAsync: (path: string) => Promise<string[]>,
    statAsync: (path: string) => Promise<fs.Stats>,
}

export default Promise.promisifyAll(fs) as IFileSystemPromise;
