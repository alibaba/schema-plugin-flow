import Vue from 'vue';
import { DatePicker, Button, Input, Tabs, Table } from 'ant-design-vue';
import App from './App.vue';
import './index.less';
// 这些组件注册为全局组件
[DatePicker, Button, Input, Tabs, Table].forEach(comp => {
  Vue.use(comp);
});

Vue.config.productionTip = false;

new Vue({
  components: { 'test-root': App },
  render: h => h('test-root', {}),
}).$mount('#app');