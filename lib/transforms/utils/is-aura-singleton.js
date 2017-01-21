'use strict';

module.exports = (ast) => {
    const body = ast.program.body;
    return (
        body.length === 1 &&
        body[0].type === 'ExpressionStatement' &&
        body[0].expression.type === 'ObjectExpression'
    );
}
