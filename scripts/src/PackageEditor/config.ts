/**
 * DIRS
 */
export const BASE_DIR = __dirname;
export const CONTENTS_DIR = `${BASE_DIR}/../../../`;

/**
 * FILE_PATTERNS
 */
export const FILE_PATTERNS = {
    CHAPTER: "^ch[0-9]{2}",
    SECTION: "^[0-9]{2}-",
};

/**
 * TARGET_FILES
 */
export const TARGET_FILES = {
    PACKAGE: "package.json",
    TYPINGS: "typings.json"
}

export const TARGET_KEYS = {
    PACKAGE: [
        'scripts',
        'repository',
        'author',
        'license',
        'bugs',
        'homepage',
    ]
}

/**
 * TEMPLATE_FILES
 */
export const TEMPLATE_FILES = {
    PACKAGE: `${BASE_DIR}/../../public/package.sample.json`,
};
