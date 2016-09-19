import * as Promise from 'bluebird';

import * as config from './config';
import * as tasks from './libs/tasks';


function main() {
    Promise.resolve(config.CONTENTS_DIR)
        .then(tasks.collectChapterDirs)
        .then(tasks.collectSectionDirs)
        .then(tasks.collectTargetFiles)
        .then(tasks.editPackagefiles)
}


if (require.main === module){
    main()
}
