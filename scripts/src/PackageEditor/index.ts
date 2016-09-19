import * as path from 'path';

import * as Promise from 'bluebird';
import * as sprintf from 'sprintf-js';

import * as config from './config';
import fsp from './lib/fsp';
import * as utilities from './lib/utilities';


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
        .catch(() => console.log("collectChapterDirs has problem!"))
        .then(collectSectionDirs)
        .catch(() => console.log("collectSectionDirs has problem!"))
        .then(collectTargetFiles)
        .catch(() => console.log("collectTargetFiles has problem!"))
        .then(editPackagefiles)
        .catch(() => console.log("editPackagefiles has problem!"))
        .then(anything => console.log(anything))
        .then(() => console.log('Finish!'))

    ///// hoisted functions for promise

    /**
     * Read contentsDir to collect chapterDirs
     * @param {string} contentsDir
     * @returns {string[]} chapterDirs
     */
    function collectChapterDirs(contentsDir: string) {
        let joinContentsDir = utilities.join(contentsDir);
        let isMatchedChapter = utilities.isMatched(config.FILE_PATTERNS.CHAPTER);
        return fsp.readdirAsync(contentsDir)
            .map(joinContentsDir)
            .filter(utilities.isDir)
            .filter(isMatchedChapter)
    }

    /**
     * Read contentsDir to collect sectionDirs
     * @param {string[]} chapterDirs
     * @returns {string[]} sectionDirs
     */
    function collectSectionDirs(chapterDirs: string[]) {
        return Promise.reduce(chapterDirs, concatSectionDirs, [])

        ///// hoisted functions

        function concatSectionDirs(prev: string[], chapterDir: string) {
            let joinChapterDir = utilities.join(chapterDir);
            let isMatchedSection = utilities.isMatched(config.FILE_PATTERNS.SECTION);
            return fsp.readdirAsync(chapterDir)
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
        return Promise.map(sectionDirs, collectTargetFile)

        ///// hoisted functions

        function collectTargetFile(sectionDir: string) {
            let getPackage = utilities.getTargeFile(config.TARGET_FILES.PACKAGE);
            let joinSectionDir = utilities.join(sectionDir);
            return fsp.readdirAsync(sectionDir)
                .then(getPackage)
                .then(joinSectionDir)
        }
    }

    /**
     * Edit packages
     * @param {string[]} filenames
     */
    function editPackagefiles(filenames: string[]) {
        let a = showProcessBar(filenames)
        return Promise.map(filenames, editPackagefile)

        ///// hoisted functions

        function editPackagefile(filename: string) {
            fsp.readFileAsync(filename).then(data => {
                let [targetFile, sourceFile] = [
                    data, config.TEMPLATE_FILES.PACKAGE
                ].map(utilities.parseJsonFile) as IPacakgeJson[];

                // Get section title
                let paths = filename.split(path.sep);
                let section = paths[paths.length - 2];
                let sectionTitle = section.split('-').splice(1).join('-');

                // Overwrite the items of package
                targetFile.name = sectionTitle;
                config.TARGET_KEYS.PACKAGE.forEach(key => {
                    targetFile[key] = sourceFile[key];
                })

                return targetFile
            }).then((targetFile) => {
                fsp.writeFileAsync(filename, JSON.stringify(targetFile, null, 2));
                a();
            })
        }

        function showProcessBar(filenames: string[]) {
            let current = 0;
            let total = filenames.length;

            return function tick() {
                current++;
                console.log(current, total)
                let fmt = '%(action)s [%(bar)10s] %(percentage)3s%% %(message)s';
                let kwargs = {
                    action: "Editing",
                    bar: "===",
                    percentage: Math.floor((current / total) * 100),
                    message: "any",
                }
                console.log(sprintf.sprintf(fmt, kwargs))
            }
        }
    }
}


if (require.main === module){
    main()
}
