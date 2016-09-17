import * as fs from 'fs';
import * as path from 'path';

import * as Promise from 'bluebird';

import fsp from './lib/fsp';
import * as config from './config';
import * as promiseUtil from './lib/promise-util';


function main() {
    fsp.readdirAsync(config.CONTENTS_DIR)
        .then(collectChapterDirs)
        .then(readChapterDirs)
        .then((filenames) => {
            console.log(filenames);
        })

        /*
        Current process:
            { '../../ch01-making-a-web-server':
               [ '../../ch01-making-a-web-server/00-setting-up-a-router',
                 '../../ch01-making-a-web-server/01-simple-multilevel-routing',
                 '../../ch01-making-a-web-server/02-simple-multilevel-routing-2',
                 '../../ch01-making-a-web-server/03-parsing-the-querystring-module',
                 '../../ch01-making-a-web-server/04-serving-static-files',
                 '../../ch01-making-a-web-server/05-caching-content-in-memory-for-immediatedelivery',
                 '../../ch01-making-a-web-server/06-reflecting-content-changes',
                 '../../ch01-making-a-web-server/07-optimizing-performance-with-streaming',
                 '../../ch01-making-a-web-server/08-protecting-against-process-memory-overruns',
                 '../../ch01-making-a-web-server/09-securing-against-filesystem-hacking-exploits',
                 '../../ch01-making-a-web-server/10-whitelisting' ],
              '../../ch02-exploring-the-http-object':
               [ '../../ch02-exploring-the-http-object/00-processing-post-data',
                 '../../ch02-exploring-the-http-object/01-handling-file-upload',
                 '../../ch02-exploring-the-http-object/02-using-formidable-to-accept-all-post-data',
                 '../../ch02-exploring-the-http-object/03-uploading-files-via-put',
                 '../../ch02-exploring-the-http-object/04-using-node-as-an-http-client',
                 '../../ch02-exploring-the-http-object/05-implementing-download-throttling',
                 '../../ch02-exploring-the-http-object/06-enabling-a-resume-request-from-broken-downloads',
                 '../../ch02-exploring-the-http-object/07-implementing-download-throttling-2' ],
              '../../ch03-working-with-data-serialization': [] }
         */

    ///// hoisted functions for promise

    function collectChapterDirs(chapterDirs: string[]) {
        return Promise.resolve(chapterDirs)
            .map(promiseUtil.joinPathMapper(config.CONTENTS_DIR))
            .filter(promiseUtil.getDirectoriesFilter)
            .filter(promiseUtil.matchRegularExpression(config.CHAPTER_PATTERN))
    }

    function readChapterDirs(chapterDirs: string[]) {
        return Promise.resolve(chapterDirs)
            .reduce(reducer, {})

        ///// hoisted functions

        function reducer(prev: Object, current: string) {
            return fsp.readdirAsync(current)
                .map(promiseUtil.joinPathMapper(current))
                .filter(promiseUtil.matchRegularExpression(config.SECTION_PATTERN))
                .then((sectionDirs) => {
                    prev[current] = sectionDirs;
                    return prev
                })
        }

    }

    ///// hoisted functions for utils

    function filterAndGetPackagefile(filename: string) {

    }

    function editPackagefile(filename) {

    }

}


if (require.main === module){
    main()
}
