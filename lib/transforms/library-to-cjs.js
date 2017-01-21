'use strict';

const b = require('recast').types.builders;
const exportExpression = require('./export-expression');

module.exports.transform = function (ast) {
    const functionDeclaration = ast.program.body[0];
    return exportExpression.transform(ast, b.functionExpression(
        functionDeclaration.id,
        functionDeclaration.params,
        functionDeclaration.body
    ));
};
