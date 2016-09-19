import * as path from 'path';

import fsp from './fsp';


export function isDir(filename: string) {
    return fsp.statAsync(filename)
        .then((stat) => stat.isDirectory())
        .catch(() => false)
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
