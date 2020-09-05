import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import { message } from 'ant-design-vue';
// 扩展组件（局部）
const components = {
  'test-ext-button': {
    data: function () {
      return {
        count: 0
      }
    },
    template: `
  <button v-bind:style="{ margin: '0 8px' }" v-on:click="count++">
  You clicked me {{ count }} times.
  </button>`
  }
};
const componentPlugin = {
  btn_change_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      setTimeout(() => {        
        message.info("外部扩展：点击按钮3次将日期组件改为扩展组件", 3);
        mApi.setAttributes(event.key, {
          size: "large",
          style: {
            color: 'red'
          }
        });
      }, 2000);
      let count = 0;
      mApi.addEventListener(event.key, 'click', () => {
        count++;
        if (count >= 3) { 
          mApi.replaceComponent('date', 'test-ext-button');
        }
      });
    }
  }
};
// 按namespace注册
const singleton = new SifoSingleton('complex-sifo-demo');
singleton.registerItem('extendId01', () => {
  console.log('singleton');
  return {
    version: '1.0.0',
    plugins: [
      {
        componentPlugin,
        pagePlugin: {}
      }
    ],
    components,
    openLogger: true
  }
});
