/* eslint-disable */
module.exports = function (api) {
  api.cache(true);
  const plugins = [
    [
      "import",
      {
        "libraryName": "antd-mobile",
        "customStyleName": function (transformedMethodName) { 
          return 'antd-mobile/cjs/components/' + transformedMethodName +"/" + transformedMethodName + ".css";
        },
        "libraryDirectory": "cjs/components",
        "styleLibraryDirectory": "cjs/components",
        "style": "css"
      }
    ]
  ];
  return {
    plugins
  };
}