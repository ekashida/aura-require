'use strict';

const path = require('path');

const importFromMemory = require('./lib/import-from-memory');
const importFromBuildFile = require('./lib/import-from-build-file');

module.exports = (relpath, globalStubs) => {
    let dir = process.cwd();

    // Use the dirpath of the parent module when possible
    if (module.parent && module.parent.filename) {
        dir = path.dirname(module.parent.filename);
    }

    let fullpath = path.resolve(dir, relpath);

    // Add .js extension if no extension is available
    const ext = path.extname(fullpath);
    if (!ext) {
        fullpath += '.js';
    }

    if (process.env.COVERAGE_ENABLED) {
        return importFromBuildFile(fullpath, globalStubs);
    } else {
        return importFromMemory(fullpath, globalStubs);
    }
};
