import * as path from 'path';

import * as Promise from 'bluebird';
import * as sprintf from 'sprintf-js';

import * as config from './config';
import { ProcessBar, IProcessBarOptions } from './libs/events';
import fsp from './libs/fsp';
import * as utils from './libs/utils';


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
        .then(editPackagefiles)

    ///// hoisted functions for promise

    /**
     * Read contentsDir to collect chapterDirs
     * @param {string} contentsDir
     * @returns {string[]} chapterDirs
     */
    function collectChapterDirs(contentsDir: string) {
        let joinContentsDir = utils.join(contentsDir);
        let isMatchedChapter = utils.isMatched(config.FILE_PATTERNS.CHAPTER);
        return fsp.readdirAsync(contentsDir)
            .map(joinContentsDir)
            .filter(utils.isDir)
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
            let joinChapterDir = utils.join(chapterDir);
            let isMatchedSection = utils.isMatched(config.FILE_PATTERNS.SECTION);
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
            let getPackage = utils.getTargeFile(config.TARGET_FILES.PACKAGE);
            let joinSectionDir = utils.join(sectionDir);
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
        let processBarListener = createProcessBarListener(
            filenames.length,
            { action: 'Editing...' }
        )
        return Promise.map(filenames, editPackagefile)

        ///// hoisted functions

        function editPackagefile(filename: string) {
            fsp.readFileAsync(filename)
                .then(makeTargetFile)
                .then(overwriteTargetFile)
                .then(processBarListener)

            ////

            function makeTargetFile(data: Buffer) {
                let [targetJson, sourceJson] = [
                    data, config.TEMPLATE_FILES.PACKAGE
                ].map(utils.parseJsonFile) as IPacakgeJson[];

                // Get section title
                let paths = filename.split(path.sep);
                let section = paths[paths.length - 2];
                let sectionTitle = section.split('-').splice(1).join('-');

                // Overwrite the items of package
                targetJson.name = sectionTitle;
                config.TARGET_KEYS.PACKAGE.forEach(key => {
                    targetJson[key] = targetJson[key];
                })

                return targetJson
            }

            function overwriteTargetFile(targetJson: IPacakgeJson) {
                fsp.writeFileAsync(filename, JSON.stringify(targetJson, null, 2));
                return filename
            }
        }
    }

    function createProcessBarListener(goal: number, options?: IProcessBarOptions) {
        let processBar = new ProcessBar(goal, options);

        return (filename: string) => {
            let section = path.basename(path.dirname(filename));
            let fn = path.basename(filename);
            processBar.tick(`${section}/${fn}`);
        }
    }
}


if (require.main === module){
    main()
}
