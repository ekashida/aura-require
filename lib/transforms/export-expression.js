'use strict';

const b = require('recast').types.builders;

module.exports.transform = function (ast, expression) {
    ast.program.body[0] = b.expressionStatement(b.assignmentExpression(
        '=',
        b.memberExpression(
            b.identifier('module'),
            b.identifier('exports'),
            false // isComputed ? `module[exports]` : `module.exports`
        ),
        expression
    ));
    return ast;
};
