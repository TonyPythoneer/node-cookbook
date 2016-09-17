import * as path from 'path';

import fsp from './fsp';


export function getDirectoriesFilter(filename: string) {
    return fsp.statAsync(filename)
        .then((stat) => stat.isDirectory())
        .catch(() => false)
}

export function joinPathMapper(filepath: string) {
    return (filename: string) => path.join(filepath, filename);
}

export function matchRegularExpression(pattern: string) {
    return (filename) => {
        let re = new RegExp(pattern);
        let basename = path.basename(filename);
        let isMatched = Boolean(re.exec(basename));
        return isMatched;
    }
}
