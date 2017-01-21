'use strict';

module.exports = (ast) => {
    const body = ast.program.body;
    return (
        ast.program.body.length === 1 &&
        body[0].type === 'FunctionDeclaration'
    );
};
