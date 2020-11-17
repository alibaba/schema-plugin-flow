/* eslint-disable */
module.exports = function (api) {
  api.cache(true);
  console.log('babel config read!');
  const presets = [
    [
      "@babel/preset-env",
      // {
      //   "targets": "ie >= 9, chrome >= 36, last 4 version"
      // }
    ],
    "@babel/preset-react",
    [
      "@babel/preset-typescript",
      {
        "happyPackMode": true,
        "transpileOnly": true
      }
    ]
  ];
  const plugins = [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ],
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-logical-assignment-operators",
    [
      "@babel/plugin-proposal-optional-chaining",
      {
        "loose": false
      }
    ],
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        "proposal": "minimal"
      }
    ],
    [
      "@babel/plugin-proposal-nullish-coalescing-operator",
      {
        "loose": false
      }
    ],
    "@babel/plugin-proposal-do-expressions",
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": false // use definition instead of assignment: https://2ality.com/2012/08/property-definition-assignment.html
      }
    ],
    "@babel/plugin-proposal-json-strings"
  ];
  const babelrcRoots = [
    '.', // root 指定只使用root的babelrc文件
    "packages/*", // 同时允许使用 subpackage 的 .babelrc.json, https://babeljs.io/docs/en/config-files#monorepos
  ];
  return {
    babelrcRoots,
    presets,
    plugins
  };
}