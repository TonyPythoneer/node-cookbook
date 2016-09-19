import * as fs from 'fs';
import * as path from 'path';


export function isDir(filename: string) {
    return fs.statSync(filename).isDirectory();
}

export function join(filepath: string) {
    return (filename: string) => path.join(filepath, filename);
}

export function isMatched(pattern: string) {
    let re = new RegExp(pattern);
    return (filename) => {
        let basename = path.basename(filename);
        let isMatched = Boolean(re.exec(basename));
        return isMatched;
    }
}

export function getTargeFile(targetFile) {
    return (filenames: string[]) => {
        let targetIndex = filenames.indexOf(targetFile);
        let targetFn = filenames[targetIndex];
        return targetFn
    }
}

export function parseJsonFile(filename: string | Buffer) {
    let data: Buffer;
    if (typeof filename === 'string') {
        data = fs.readFileSync(filename);
    } else if (typeof filename === 'Buffer') {
        data = filename;
    }
    return JSON.parse(data.toString());
}
