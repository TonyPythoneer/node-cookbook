import * as path from 'path';
import * as fs from 'fs';

import * as Promise from 'bluebird';

import * as config from './config';
import fsp from './lib/fsp';
import * as promiseUtil from './lib/promise-util';


interface IPacakgeJson {
    name: string,
    version: string,
    description: string,
    main: string,
    scripts: Object,
    repository: {
        type: string,
        url: string,
    },
    author: string,
    license: string,
    bugs: {
        url: string,
    },
    homepage: string,
}



function main() {
    Promise.resolve(config.CONTENTS_DIR)
        .then(collectChapterDirs)
        .then(collectSectionDirs)
        .then(collectTargetFiles)
        //.then(editPackagefile)
        .then(anything => console.log(anything))
        .then(() => console.log('Finish!'))

    ///// hoisted functions for promise

    /**
     * Read contentsDir to collect chapterDirs
     * @param {string} contentsDir
     * @returns {string[]} chapterDirs
     */
    function collectChapterDirs(contentsDir: string) {
        let joinContentsDir = promiseUtil.join(contentsDir);
        let isMatchedChapter = promiseUtil.isMatched(config.FILE_PATTERNS.CHAPTER);
        return fsp.readdirAsync(config.CONTENTS_DIR)
            .map(joinContentsDir)
            .filter(promiseUtil.isDir)
            .filter(isMatchedChapter)
    }

    /**
     * Read contentsDir to collect sectionDirs
     * @param {string[]} chapterDirs
     * @returns {string[]} sectionDirs
     */
    function collectSectionDirs(chapterDirs: string[]) {
        return Promise.reduce(chapterDirs, reducer, [])

        ///// hoisted functions

        function reducer(prev: string[], current: string, index: number) {
            let joinChapterDir = promiseUtil.join(current);
            let isMatchedSection = promiseUtil.isMatched(config.FILE_PATTERNS.SECTION);
            return fsp.readdirAsync(current)
                .map(joinChapterDir)
                .filter(isMatchedSection)
                .then(sectionDirs => prev.concat(sectionDirs))
        }
    }

    /**
     * Read sectionDirs to collect targetFiles
     * @param {string[]} sectionDirs
     * @returns {string[]} targetFiles
     */
    function collectTargetFiles(sectionDirs: string[]) {
        return Promise.map(sectionDirs, mapper2)

        ///// hoisted functions

        function mapper2(sectionDir: string) {
            let getPackage = promiseUtil.getTargeFile(config.TARGET_FILES.PACKAGE);
            let joinSectionDir = promiseUtil.join(sectionDir);
            return fsp.readdirAsync(sectionDir)
                .then(getPackage)
                .then(joinSectionDir)
        }
    }

    function editPackagefile(filenames: string[]) {
        return Promise.map(filenames, mapper)

        function mapper(filename: string) {
            fsp.readFileAsync(filename).then(data => {
                let targetFile: IPacakgeJson = JSON.parse(data.toString());
                let sourceFile: IPacakgeJson = JSON.parse(fs.readFileSync(config.TEMPLATE_FILES.PACKAGE).toString());

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
