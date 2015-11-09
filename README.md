autodts
=======

[![npm version](https://img.shields.io/npm/v/autodts.svg)](https://www.npmjs.com/package/autodts) [![dependency status](https://david-dm.org/charto/autodts.svg)](https://david-dm.org/charto/autodts)

`autodts` generates `.d.ts` files for publishing TypeScript projects on npm.

Usage
-----

It's best to run `autodts` from the `package.json` file of a Node.js module. Here's an example:

```json
{
  "name": "example",
  "version": "0.0.1",
  "description": "Example of a TypeScript-based package",
  "scripts": {
    "preinstall": "npm install autodts",
    "postinstall": "autodts link",
    "prepublish": "tsc && autodts generate"
  },
  "typescript": {
    "definition": "index.d.ts"
  },
  "dependencies": {
    "autodts": "~0.0.6",
    "@lib/dependency-example": "0.0.3"
  },
  "devDependencies": {
    "@lib/autodts-generator": "~0.0.1",
    "typescript": "~1.5.3"
  }
}
```

The `preinstall` command is needed to work around [npm issue #5001](https://github.com/npm/npm/issues/5001).

`autodts link` checks all packages listed in `dependencies`. If their `package.json` file contains a `typescript` section with a `definition` setting, a reference is added to the output file `typings/auto.d.ts`, for example:

```typescript
// Automatically generated file. Edits will be lost.
/// <reference path="../node_modules/@lib/dependency-example/index.d.ts" />
```

This allows pulling the type information of all required modules into a TypeScript source file with a single `/// <reference path = "typings/auto.d.ts" />` statement.

An entire tree of npm packages written in TypeScript can be installed with correct references to typings if packages referencing types from others add the above `preinstall` and `postinstall` sections in their `package.json`.

It's possible to change the output file path using the `--out` parameter, for example: `autodts link --out typings/tsd.d.ts`.

`autodts generate` calls [autodts-generator](https://www.npmjs.com/package/@lib/autodts-generator) to produce a single `.d.ts` file with all type information in the package. It will be automatically written to the path defined in the `definition` setting in the `typescript` section of your `package.json` file. Using it requires a particular package structure, otherwise it's better to use [dts-generator](https://www.npmjs.com/package/dts-generator) directly.

To use the `generate` command, you should add `@lib/autodts-generator` to your `devDependencies`. `autodts` doesn't automatically require it, because it pulls the entire TypeScript compiler and is not needed for the `link` command.

`autodts link` is meant for the common case of installing TypeScript-based npm packages, `autodts generate` for the rarer event of publishing them.

License
=======

[The MIT License](https://raw.githubusercontent.com/charto/autodts/master/LICENSE)
Copyright (c) 2015 BusFaster Ltd
