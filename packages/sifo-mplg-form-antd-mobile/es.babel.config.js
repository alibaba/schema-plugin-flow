module.exports = function (api) {
  api.cache(true);
  console.log('es babel config read!');
  const presets = [
    [
      "@babel/preset-env",
      {
        modules: false
      }
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
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ];
  return {
    presets,
    plugins,
  };
}