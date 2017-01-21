'use strict';

const exportExpression = require('./export-expression');

module.exports.transform = function (ast) {
    const expressionStatement = ast.program.body[0];
    const objectExpression = expressionStatement.expression;
    return exportExpression.transform(ast, objectExpression);
};
