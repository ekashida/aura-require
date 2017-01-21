'use strict';

const fs = require('fs');
const recast = require('recast');
const vm = require('vm');

const b = recast.types.builders;

const isAuraLibrary = require('./transforms/utils/is-aura-library');
const isAuraSingleton = require('./transforms/utils/is-aura-singleton');

module.exports = (fullpath, globals) => {
    const code = fs.readFileSync(fullpath, 'utf8');
    const ast = recast.parse(code);

    if (isAuraSingleton(ast)) {
        const singleton = ast.program.body[0];

        // ({ amazon: 'superfood' }) => var __AURA_EXPORTS__ = { amazon: 'superfood' }
        ast.program.body[0] = b.variableDeclaration('var', [
            b.variableDeclarator(
                b.identifier('__AURA_EXPORTS__'),
                b.objectExpression(singleton.expression.properties)
            )
        ]);
    } else if (isAuraLibrary(ast)) {
        const func = ast.program.body[0];

        // function delicious (acai) { var sambazon; } => var __AURA_EXPORTS__ = function (acai) { var sambazon; }
        ast.program.body[0] = b.variableDeclaration('var', [
            b.variableDeclarator(
                b.identifier('__AURA_EXPORTS__'),
                b.functionExpression(null, func.params, func.body)
            )
        ]);
    } else {
        throw new Error(`${fullpath} is neither an Aura Library nor an Aura Singleton`);
    }

    const sandbox = globals || {};
    vm.runInNewContext(recast.print(ast).code, sandbox);

    return sandbox.__AURA_EXPORTS__;
};
