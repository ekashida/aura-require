'use strict';

const recast = require('recast');
const types = recast.types;
const b = types.builders;

const globalStubId = b.identifier('__INJECTED_GLOBALS__');

function globalAssignmentExpressions (globalReferences) {
    return globalReferences.map(globalReference => {
        const globalReferenceId = b.identifier(globalReference);
        return b.variableDeclaration('var', [
            b.variableDeclarator(
                globalReferenceId,
                b.memberExpression(globalStubId, globalReferenceId, false)
            )
        ]);
    });
};

module.exports.transform = (ast, globals) => {
    const exportStatement = ast.program.body[0];

    // BEFORE:
    // module.exports = <EXPRESSION>;
    //
    // AFTER:
    // module.exports = function injectGlobals (__INJECTED_GLOBALS__) {
    //     __INJECTED_GLOBALS__ = __INJECTED_GLOBALS__ || {};
    //     var $A = __INJECTED_GLOBALS__.$A;
    //     var window = __INJECTED_GLOBALS__.window;
    //
    //     return <EXPRESSION>;
    // };
    exportStatement.expression.right = b.functionExpression(
        b.identifier('injectGlobals'),
        [globalStubId],
        b.blockStatement([].concat(
            b.expressionStatement(b.assignmentExpression(
                '=',
                globalStubId,
                b.logicalExpression(
                    '||',
                    globalStubId,
                    b.objectExpression([])
                )
            )),
            globalAssignmentExpressions(globals),
            b.returnStatement(
                exportStatement.expression.right
            )
        ))
    );

    return ast;
};
