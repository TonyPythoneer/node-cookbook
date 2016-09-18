import * as path from 'path';

import * as Promise from 'bluebird';

import * as config from './config';
import fsp from './lib/fsp';
import * as promiseUtil from './lib/promise-util';


function main() {
    Promise.resolve(config.CONTENTS_DIR)
        .then(collectChapterDirs)
        .then(collectSectionDirs)

    ///// hoisted functions for promise

    /**
     * Read contentsDir to collect chapterDirs
     * @param {string} contentsDir - contents directory
     * @returns {string[]} chapterDirs - chapter directories
     */
    function collectChapterDirs(contentsDir: string) {
        let joinContentsDirMapper = promiseUtil.joinPathMapper(contentsDir);
        let matchChapterFilter = promiseUtil.matchReFilter(config.CHAPTER_PATTERN);
        return fsp.readdirAsync(config.CONTENTS_DIR)
            .map(joinContentsDirMapper)
            .filter(promiseUtil.getDirectoriesFilter)
            .filter(matchChapterFilter)
    }

    /**
     * Read contentsDir to collect sectionDirs
     * @param {string[]} chapterDirs - chapter directories
     * @returns {string[]} sectionDirs - section directories
     */
    function collectSectionDirs(chapterDirs: string[]) {
        return Promise.reduce(chapterDirs, reducer, [])

        ///// hoisted functions

        function reducer(prev: string[], current: string, index: number) {
            let joinChapterDirMapper = promiseUtil.joinPathMapper(current);
            let matchSectionFilter = promiseUtil.matchReFilter(config.SECTION_PATTERN);
            return fsp.readdirAsync(current)
                .map(joinChapterDirMapper)
                .filter(matchSectionFilter)
                .then((sectionDirs) => prev.concat(sectionDirs))
        }

    }

    function collectTargetFiles(nestContentDirs: string[][]) {
        return Promise.map(nestContentDirs, mapper)

        ///// hoisted functions

        function mapper(sectionDirs: string[]) {
            return Promise.map(sectionDirs, mapper2)
        }

        function mapper2(sectionDir: string) {
            return fsp.readdirAsync(sectionDir)
                .then(filenames => {
                    let targetName = 'package.json';
                    let index = filenames.indexOf(targetName);
                    let targetFn = filenames[index];
                    let targetFnDir = path.join(sectionDir, targetFn);
                    return targetFnDir
                })
        }
    }

    ///// TODO

    function filterAndGetPackagefile(filename: string) {

    }

    function editPackagefile(filename) {

    }

}


if (require.main === module){
    main()
}
