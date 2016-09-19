import * as path from 'path';
import * as fs from 'fs';

import * as Promise from 'bluebird';

import * as config from './config';
import fsp from './lib/fsp';
import * as promiseUtil from './lib/promise-util';


interface IPacakgeJson {
    "name": string,
    "version": string,
    "description": string,
    "main": string,
    "scripts": Object,
    "repository": {
        type: string,
        url: string,
    },
    "author": string,
    "license": string,
    "bugs": {
        url: string,
    },
    "homepage": string,
}



function main() {
    Promise.resolve(config.CONTENTS_DIR)
        .then(collectChapterDirs)
        .then(collectSectionDirs)
        .then(collectTargetFile)
        .then(editPackagefile)
        .then(anything => console.log(anything))
        .then(() => console.log('Finish!'))

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
                .then(sectionDirs => prev.concat(sectionDirs))
        }

    }

    function collectTargetFile(sectionDirs: string[]) {
        return Promise.map(sectionDirs, mapper2)

        ///// hoisted functions

        function mapper2(sectionDir: string) {
            return fsp.readdirAsync(sectionDir)
                .then(filenames => {
                    return nestFn(filenames, "package.json")
                })

            function nestFn(filenames, targetName) {
                let index = filenames.indexOf(targetName);
                let targetFn = filenames[index];
                let targetFnDir = path.join(sectionDir, targetFn);
                return targetFnDir
            }
        }
    }

    function editPackagefile(filenames: string[]) {
        return Promise.map(filenames, mapper)

        function mapper(filename: string) {
            fsp.readFileAsync(filename).then(data => {
                let targetFile: IPacakgeJson = JSON.parse(data.toString());
                let sourceFile: IPacakgeJson = JSON.parse(fs.readFileSync(config.TEMPLATE_PACKAGE).toString());

                let paths = filename.split(path.sep);
                let section = paths[paths.length - 2];
                let sectionTitle = section.split('-').splice(1).join('-');
                targetFile.name = sectionTitle;
                targetFile.scripts = sourceFile.scripts;

                return targetFile
            }).then((targetFile) => {
                fsp.writeFileAsync(filename, JSON.stringify(targetFile, null, 2))
                console.log(`Finish ${filename}`);
            })
        }
    }



}


if (require.main === module){
    main()
}
