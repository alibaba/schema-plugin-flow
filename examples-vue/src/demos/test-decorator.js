
import { sifoAppDecorator } from "@schema-plugin-flow/sifo-vue";
import TestDecorator from './test-decorator-target.vue';

const componentPlugin = {
  'test-sifo-decorator': {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', (ctx, ...arg) => {
        console.log('decorator: clicked', ctx, arg);
        const extProps = mApi.getSifoExtProps();
        console.log("getSifoExtProps in : ", extProps);
      });
    }
  }
};
const plugins = [{ componentPlugin }];
const App = sifoAppDecorator('test-sifo-decorator', {
  externals: { aa: 1 },
  plugins,
  fragments: ['$dynamic_panel', '$static_panel'],
  class: "decorator-test",
  openLogger: false
})(TestDecorator);
export default App;
