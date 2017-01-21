# aura-require

Facilitates unit testing of Aura singletons and libraries by allowing us to
import them as if they were CommonJS modules. We can also pass a second
argument that will be used to stub out any global variable references in the
code being tested.

When testing without coverage, the code is parsed and executed in a JavaScript
VM. When testing with coverage, we write the modified source to disk and then
`require()` it. This is because most coverage tools hook into the `require()`
in order to instrument the code before it executes.

## example

```js
const optionalGlobalStubs = {
  '$A': {
    get: () => {},
    set: () => {}
  },
  document: {
    querySelector: () => {}
  }
};

const libSetup = require('aura-require')(pathToLib, optionalGlobalStubs);

// <aura:include name="lib" imports="dependencyA, dependencyB"/>
const dependencyA = { foo: () => {} };
const dependencyB = { bar: () => {} };
const lib = libSetup(dependencyA, dependencyB);
```

## install

```sh
npm install aura-require
```

## usage

### enable coverage

Declare the following environment variable to enable coverage:
`COVERAGE_ENABLED=true`

### build file directory

Declare the following environment variable to specify the directory in which
the generated build files should go: `BUILD_COVERAGE_DIR=build/coverage/`

If not specified, the default directory is `build/coverage/`

### example

```json
{
  "script": {
    "test:coverage": "COVERAGE_ENABLED=true COVERAGE_BUILD_DIR=build/coverage/ tap --coverage src/test/unit/**/*.js"
  },
}
```
