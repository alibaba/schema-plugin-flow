module.exports = {
  runtimeCompiler: true,
    lintOnSave: false, //是否开启eslint保存检测 ,它的有效值为 true || false || 'error'
    configureWebpack: {
        resolve: {
          alias: {
            // 'vue$': 'vue/dist/vue.esm.js' // https://www.jianshu.com/p/466510d84e36
          }
        }
    }
}