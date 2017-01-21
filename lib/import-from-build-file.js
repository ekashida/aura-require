'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const recast = require('recast');
const util = require('ast-util');

const b = recast.types.builders;

const isAuraLibrary = require('./transforms/utils/is-aura-library');
const isAuraSingleton = require('./transforms/utils/is-aura-singleton');
const singletonToCJS = require('./transforms/singleton-to-cjs');
const libraryToCJS = require('./transforms/library-to-cjs');
const injectGlobals = require('./transforms/inject-globals');

const WHITELISTED_GLOBAL_REFS = [
    '$A',
    'window'
];

module.exports = (fullpath, globalStubs = {}) => {
    const code = fs.readFileSync(fullpath, 'utf8');
    let ast = recast.parse(code);

    const globals = util
        .getGlobals(ast.program)
        .map(identifier => identifier.name)
        .filter(identifier => WHITELISTED_GLOBAL_REFS.includes(identifier));

    if (isAuraSingleton(ast)) {
        ast = singletonToCJS.transform(ast);
    } else if (isAuraLibrary(ast)) {
        ast = libraryToCJS.transform(ast);
    } else {
        throw new Error(`${fullpath} is neither an Aura Library nor an Aura Singleton`);
    }

    ast = injectGlobals.transform(ast, globals);
    const modifiedCode = recast.print(ast).code;

    const buildpath = path.join(
        process.cwd(),
        process.env.COVERAGE_BUILD_DIR || 'build/coverage/',
        // /Users/ekashida/repos/lightning-global/src/main/components/lightning/validityLibrary/validity.js => lightning/validityLibrary/validity.js
        fullpath.split(path.sep).slice(-3).join(path.sep)
    );

    // TODO: Optimize by writing the file only if a hash of the modified code
    // changed or the file does not yet exist
    mkdirp.sync(path.dirname(buildpath));
    fs.writeFileSync(buildpath, modifiedCode);

    return require(buildpath)(globalStubs);
};
