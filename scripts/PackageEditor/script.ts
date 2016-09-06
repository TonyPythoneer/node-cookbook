import * as fs from 'fs';
import * as path from 'path';

import * as Promise from 'bluebird';

import fsp from './fsp';
import * as config from './config';


function main() {
    fsp.readdirAsync(config.CONTENTS_DIR)
        .map(joinContentsDir)
        .filter(filterAndGetDirectories)
        .filter(getChapters)
        .map(readChapterDir)
        .then((filenames) => {
            console.log(filenames);
        })

    ////// hoisted functions

    function joinContentsDir(filename: string) {
        return path.join(config.CONTENTS_DIR, filename);
    }

    function filterAndGetDirectories(filename: string) {
        return fsp.statAsync(filename)
            .then((stat) => stat.isDirectory())
            .catch(() => false)
    }

    function getChapters(filename: string) {
        let re = new RegExp(config.CHAPTER_PATTERN);
        let basename = path.basename(filename);
        let isChapter = Boolean(re.exec(basename));
        return isChapter;
    }

    function readChapterDir(filename: string) {
        return fsp.readdirAsync(filename)
    }

    function readSectionDir(filename: string) {

    }

    function filterAndGetPackagefile(filename: string) {

    }

    function editPackagefile(filename) {

    }

}


if (require.main === module){
    main()
}
