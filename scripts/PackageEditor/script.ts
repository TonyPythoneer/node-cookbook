import * as fs from 'fs';
import * as path from 'path';

import * as Promise from 'bluebird';


const CONTENTS_DIR = '../';


function main() {
    let readdir = Promise.promisify(fs.readdir);
    readdir(CONTENTS_DIR)
        .then(getRelativePathOfFiles)

    ////// hoisted functions

    function getRelativePath(files: Array<string>) {
        return files.map((f: string) => path.join(CONTENTS_DIR, f));
    }

    function getDirectories(files: Array<string>) {

    }

}


if (require.main === module){
    main()
}
